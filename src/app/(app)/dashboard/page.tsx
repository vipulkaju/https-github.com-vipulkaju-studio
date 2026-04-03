'use client';

import { useMemo, useState, type ElementType } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { useMachines } from '@/context/machines-context';
import Link from 'next/link';
import {
  Hash,
  TrendingUp,
  TrendingDown,
  Award,
  CircleOff,
  User,
  Settings,
  Calendar,
  Layers,
  Clock,
  BarChart,
  Plus,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/animated-counter';
import { WeeklyPerformanceChart } from '@/components/dashboard/weekly-performance-chart';
import type { ProductionEntry } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { DailyMachineEntryStatus } from '@/components/dashboard/daily-machine-entry-status';

type MonthlyPerformer = { karigarName: string; totalTich: number; machines: string[]; averageTich: number; };
type DetailData = (ProductionEntry) | (MonthlyPerformer);
type DetailType = 'yesterday' | 'month';

type DialogData = {
    icon: ElementType;
    title: string;
    description: string;
    content: React.ReactNode;
}

const SewingMachineIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M19.3,7.2H17.2V5.1c0-0.6-0.4-1-1-1H7.7c-0.6,0-1,0.4-1,1v5H3.1c-0.6,0-1,0.4-1,1v4.1c0,0.6,0.4,1,1,1h1.1v2.1c0,0.6,0.4,1,1,1h11.7c0.6,0,1-0.4,1-1v-2.1h1.1c0.6,0,1-0.4,1-1V8.2C20.3,7.6,19.9,7.2,19.3,7.2z M10.8,9.1c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S11.4,9.1,10.8,9.1z M15.2,10.1v2.1H8.7v-2.1H15.2z"/>
    </svg>
  );

export default function DashboardPage() {
  const { machines, allProductionEntries } = useMachines();
  const [dialogData, setDialogData] = useState<DialogData | null>(null);
  const [isStatusDialogOpen, setStatusDialogOpen] = useState(false);

  const dashboardStats = useMemo(() => {
    const totalMachines = machines.length;
    if (totalMachines === 0) {
      return {
        totalMachines: 0,
        totalMachineHad: 0,
      };
    }
    
    const totalMachineHad = machines.reduce((acc, m) => acc + m.model, 0);

    return {
      totalMachines,
      totalMachineHad,
    };
  }, [machines]);

  const performanceStats = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = format(yesterday, 'yyyy-MM-dd');
    
    const yesterdayEntries = allProductionEntries.filter(entry => entry.date === yesterdayDate);

    if (yesterdayEntries.length === 0) {
      return {
        topPerformer: null,
        worstPerformer: null,
      };
    }
    
    // Sort descending by totalTich
    const sortedEntries = [...yesterdayEntries].sort((a, b) => b.totalTich - a.totalTich);

    const topPerformer = sortedEntries[0];
    const worstPerformer = sortedEntries.length > 1 ? sortedEntries[sortedEntries.length - 1] : null;

    // Handle ties: if top and worst have the same score, there's no "worst"
    if (worstPerformer && topPerformer.totalTich === worstPerformer.totalTich) {
        return {
            topPerformer: topPerformer,
            worstPerformer: null,
        }
    }

    return {
      topPerformer,
      worstPerformer,
    };
  }, [allProductionEntries]);

  const monthlyPerformanceStats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthEntries = allProductionEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return isWithinInterval(entryDate, { start: monthStart, end: monthEnd });
    });

    if (monthEntries.length === 0) {
        return { topPerformer: null, worstPerformer: null };
    }

    const karigarPerformance: { [key: string]: {
        totalTich: number;
        machines: Set<string>;
        daysWorked: Set<string>;
    } } = {};

    monthEntries.forEach(entry => {
        if (!karigarPerformance[entry.karigarName]) {
            karigarPerformance[entry.karigarName] = {
                totalTich: 0,
                machines: new Set(),
                daysWorked: new Set(),
            };
        }
        karigarPerformance[entry.karigarName].totalTich += entry.totalTich;
        karigarPerformance[entry.karigarName].machines.add(entry.machineId);
        karigarPerformance[entry.karigarName].daysWorked.add(entry.date);
    });

    const performanceArray = Object.entries(karigarPerformance).map(([name, data]) => ({
        karigarName: name,
        totalTich: data.totalTich,
        machines: Array.from(data.machines).sort(),
        averageTich: data.daysWorked.size > 0 ? data.totalTich / data.daysWorked.size : 0,
    }));

    if (performanceArray.length === 0) {
      return { topPerformer: null, worstPerformer: null };
    }
    
    performanceArray.sort((a, b) => a.totalTich - b.totalTich);
    
    const top = performanceArray[performanceArray.length - 1];
    const worst = performanceArray.length > 1 ? performanceArray[0] : null;

    if (performanceArray.length > 1 && top.totalTich === worst?.totalTich) {
        return {
            topPerformer: top,
            worstPerformer: null,
        }
    }

    return {
        topPerformer: top,
        worstPerformer: worst,
    };
  }, [allProductionEntries]);

  const renderDetailContent = (data: DetailData, type: DetailType) => {
    if (type === 'yesterday') {
        const entry = data as ProductionEntry;
        return (
            <div className="space-y-3 text-sm pt-4">
                <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4"/>Karigar</span><span className="font-semibold">{entry.karigarName}</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-muted-foreground"><Settings className="h-4 w-4"/>Machine</span><span className="font-semibold">{entry.machineId}</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-muted-foreground"><Layers className="h-4 w-4"/>Design</span><span className="font-semibold">{entry.designName}</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4"/>Shift</span><span className="font-semibold capitalize">{entry.shift}</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-muted-foreground"><Hash className="h-4 w-4"/>Total Tich</span><span className="font-bold text-primary text-lg">{entry.totalTich.toLocaleString()}</span></div>
            </div>
        )
    }

    if (type === 'month') {
        const performer = data as MonthlyPerformer;
        return (
            <div className="space-y-3 text-sm pt-4">
                <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4"/>Karigar</span><span className="font-semibold">{performer.karigarName}</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-muted-foreground"><SewingMachineIcon className="h-4 w-4"/>Machines</span><span className="font-semibold text-right">{performer.machines.join(', ')}</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-muted-foreground"><BarChart className="h-4 w-4"/>Avg. Daily Tich</span><span className="font-semibold">{Math.round(performer.averageTich).toLocaleString()}</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-muted-foreground"><Hash className="h-4 w-4"/>Month&apos;s Total Tich</span><span className="font-bold text-primary text-lg">{performer.totalTich.toLocaleString()}</span></div>
            </div>
        )
    }
    return null;
  }

  const getDialogDataForPerformer = (performer: ProductionEntry | MonthlyPerformer | null, type: DetailType, title: string, icon: ElementType, noDataText: string) => {
    if (!performer) {
      return {
        icon,
        title,
        description: noDataText,
        content: <p className="text-center text-muted-foreground py-8">{noDataText}</p>
      };
    }
    
    const isYesterday = type === 'yesterday';
    const performerName = (performer as { karigarName: string }).karigarName;
    const description = isYesterday
      ? `Yesterday's performance details for ${performerName}`
      : `This month's performance summary for ${performerName}`;

    return {
      icon,
      title,
      description,
      content: renderDetailContent(performer, type)
    };
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold font-headline tracking-tight text-foreground/90">Overview</h2>
              <div className="text-xs font-bold text-primary/60 bg-primary/5 px-4 py-1.5 rounded-full backdrop-blur-md border border-primary/10">
                Live Status
              </div>
            </div>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              <KpiCard
                title="Yesterday's Status"
                icon={SewingMachineIcon}
                onClick={() => setStatusDialogOpen(true)}
              />
              <KpiCard
                title="Total Machine Had"
                icon={SewingMachineIcon}
                onClick={() => setDialogData({
                    icon: SewingMachineIcon,
                    title: "Total Machine Had",
                    description: "Sum of all machine 'had' values.",
                    content: (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground text-sm">Total Machine Had</p>
                        <p className="text-6xl font-bold text-primary">
                          <AnimatedCounter value={dashboardStats.totalMachineHad} />
                        </p>
                      </div>
                    )
                })}
              />
              <KpiCard
                title="Top Performer Yesterday"
                icon={TrendingUp}
                className={performanceStats.topPerformer ? "border-green-500/50 bg-green-500/10" : ""}
                onClick={() => setDialogData(getDialogDataForPerformer(performanceStats.topPerformer, 'yesterday', 'Top Performer Yesterday', TrendingUp, 'No production entries for yesterday.'))}
              />
              <KpiCard
                title="Worst Performer Yesterday"
                icon={TrendingDown}
                className={performanceStats.worstPerformer ? "border-red-500/50 bg-red-500/10" : ""}
                onClick={() => setDialogData(getDialogDataForPerformer(performanceStats.worstPerformer, 'yesterday', 'Worst Performer Yesterday', TrendingDown, 'Not enough data to compare.'))}
              />
              <KpiCard
                title="Top Performer This Month"
                icon={Award}
                className={monthlyPerformanceStats.topPerformer ? "border-violet-500/50 bg-violet-500/10" : ""}
                onClick={() => setDialogData(getDialogDataForPerformer(monthlyPerformanceStats.topPerformer, 'month', 'Top Performer This Month', Award, 'No production entries for this month.'))}
              />
              <KpiCard
                title="Worst Performer This Month"
                icon={CircleOff}
                className={monthlyPerformanceStats.worstPerformer ? "border-orange-500/50 bg-orange-500/10" : ""}
                onClick={() => setDialogData(getDialogDataForPerformer(monthlyPerformanceStats.worstPerformer, 'month', 'Worst Performer This Month', CircleOff, 'Not enough data to compare.'))}
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold font-headline tracking-tight text-foreground/90">Production Trends</h2>
              <div className="flex items-center gap-2 bg-white/10 p-1 rounded-xl border border-white/20">
                <Button variant="ghost" size="sm" className="rounded-lg h-7 text-[10px] font-bold uppercase tracking-wider">7 Days</Button>
                <Button variant="ghost" size="sm" className="rounded-lg h-7 text-[10px] font-bold uppercase tracking-wider opacity-50">30 Days</Button>
              </div>
            </div>
            <div className="glass-card p-6">
              <WeeklyPerformanceChart entries={allProductionEntries} />
            </div>
          </section>
        </div>

        <aside className="w-full lg:w-96 space-y-6">
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-headline tracking-tight text-foreground/90">Recent Activity</h2>
            <div className="liquid-glass p-6 rounded-[2rem] space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-12 -mt-12" />
              {allProductionEntries.slice(0, 5).map((entry, i) => (
                <div key={entry.id} className="flex items-start gap-4 relative group">
                  {i !== 4 && <div className="absolute left-[1.125rem] top-10 bottom-[-1.5rem] w-0.5 bg-primary/10 group-hover:bg-primary/20 transition-colors" />}
                  <div className="bg-primary/10 p-2 rounded-full mt-1 border border-primary/20 group-hover:scale-110 transition-transform">
                    <div className="h-2.5 w-2.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-sm leading-none tracking-tight">{entry.karigarName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Added entry for <span className="font-bold text-foreground">{entry.machineId}</span>
                    </p>
                    <p className="text-[9px] text-primary/60 uppercase font-black tracking-widest">
                      {format(new Date(entry.date), 'MMM d')} • {entry.shift}
                    </p>
                  </div>
                </div>
              ))}
              {allProductionEntries.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-primary/5 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="h-8 w-8 text-primary/20" />
                  </div>
                  <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">No activity yet</p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
       <Dialog open={!!dialogData} onOpenChange={(open) => !open && setDialogData(null)}>
        <DialogContent className="liquid-glass border-white/20 p-6 rounded-[2rem]">
          <DialogHeader>
             <div className="flex items-center gap-4 mb-2">
                {dialogData && <div className="bg-primary/10 p-2.5 rounded-xl"><dialogData.icon className="h-5 w-5 text-primary" /></div>}
                <div>
                    <DialogTitle className="text-lg">{dialogData?.title}</DialogTitle>
                    <DialogDescription className="text-xs">{dialogData?.description}</DialogDescription>
                </div>
            </div>
          </DialogHeader>
          {dialogData?.content}
        </DialogContent>
      </Dialog>
      <Dialog open={isStatusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="liquid-glass border-white/20 p-6 rounded-[2rem] max-w-2xl">
          <DialogHeader>
             <div className="flex items-center gap-4 mb-2">
                <div className="bg-primary/10 p-2.5 rounded-xl"><SewingMachineIcon className="h-5 w-5 text-primary" /></div>
                <div>
                    <DialogTitle className="text-lg">Yesterday&apos;s Entry Status</DialogTitle>
                    <DialogDescription className="text-xs">Color indicates production entry status for yesterday.</DialogDescription>
                </div>
            </div>
          </DialogHeader>
          <DailyMachineEntryStatus machines={machines} entries={allProductionEntries} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
