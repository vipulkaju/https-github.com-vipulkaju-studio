'use client';

import { useMachines } from '@/context/machines-context';
import { PageHeader } from '@/components/page-header';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Hash,
  Sun,
  Moon,
  Trash2,
  Layers,
  Ruler,
  ChevronsUp,
  FilterX,
  Pencil,
  Filter,
  Plus,
} from 'lucide-react';
import type { ProductionEntry, Machine } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import type { ProductionEntryUpdateData } from '@/context/machines-context';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const editEntrySchema = z.object({
  date: z.date({ required_error: 'A date is required.' }),
  designName: z.string().min(1, 'Design name is required.'),
  designTich: z.coerce.number().positive('Must be a positive number.'),
  frame: z.coerce.number().min(0, 'Frame must be a positive number.'),
  totalTich: z.coerce.number().positive('Must be a positive number.'),
  totalMeter: z.coerce.number(),
});

type EditEntryFormValues = z.infer<typeof editEntrySchema>;

function EditProductionForm({ 
  entry,
  machine,
  onUpdate,
  onCancel
}: { 
  entry: ProductionEntry;
  machine: Machine | undefined;
  onUpdate: (data: EditEntryFormValues) => void;
  onCancel: () => void;
}) {
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const form = useForm<EditEntryFormValues>({
    resolver: zodResolver(editEntrySchema),
    defaultValues: {
      date: parse(entry.date, 'yyyy-MM-dd', new Date()),
      designName: entry.designName,
      designTich: entry.designTich,
      frame: entry.frame,
      totalTich: entry.totalTich,
      totalMeter: entry.totalMeter,
    },
  });
  
  const { setValue } = form;
  const watchedFrame = form.watch('frame');

  useEffect(() => {
    if (machine && watchedFrame >= 0) {
      const oneFremMeter = (machine.model * machine.capacityUnitsPerHour) / 1000;
      const totalMeterValue = watchedFrame * oneFremMeter;
      setValue('totalMeter', parseFloat(totalMeterValue.toFixed(2)));
    } else {
      setValue('totalMeter', 0);
    }
  }, [watchedFrame, machine, setValue]);

  function onSubmit(data: EditEntryFormValues) {
    onUpdate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover open={isDatePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 !z-[9999]" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(date);
                      }
                      setDatePickerOpen(false);
                    }}
                    disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={new Date().getFullYear() - 10}
                    toYear={new Date().getFullYear() + 10}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="designName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Design</FormLabel>
              <FormControl>
                <Input placeholder="Enter Design Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="designTich"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Design Tich</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter Design Tich" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="frame"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frame</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter Frame" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="totalTich"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Tich</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter Total Tich" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="totalMeter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Meter</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Calculated automatically"
                  {...field}
                  className="text-muted-foreground"
                  disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </DialogFooter>
      </form>
    </Form>
  );
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

const ProductionEntryItem = ({ entry, performance, onDelete, onEdit }: {
  entry: ProductionEntry;
  performance: 'good' | 'bad' | 'neutral';
  onDelete: (entryId: string) => void;
  onEdit: (entry: ProductionEntry) => void;
}) => {
    const { toast } = useToast();

    const handleDelete = (entryId: string, entryName: string) => {
        onDelete(entryId);
        toast({
          variant: 'destructive',
          title: "Entry Deleted",
          description: `The entry for "${entryName}" has been deleted.`,
        });
    };
    
    const performanceClasses = {
        good: 'border-green-500/50 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.1)]',
        bad: 'border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.1)]',
        neutral: 'bg-white/5 border-white/10',
    };

    return (
        <div className={cn(
            "relative rounded-[2rem] border p-4 shadow-lg backdrop-blur-xl transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group print-card overflow-hidden", 
            performanceClasses[performance],
            performance === 'neutral' ? 'liquid-glass' : ''
        )}>
           {/* Decorative background element */}
           <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
           
           <div className="absolute top-4 right-4 flex items-center gap-2 no-print opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                <Button variant="glass" size="icon" className="h-8 w-8 rounded-full shadow-md border-white/20" onClick={() => onEdit(entry)}>
                    <Pencil className="h-3.5 w-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="glass" size="icon" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 shadow-md border-white/20">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="liquid-glass border-white/20 rounded-[2.5rem] p-8">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-3xl font-bold font-headline tracking-tight">Delete Entry?</AlertDialogTitle>
                      <AlertDialogDescription className="text-lg text-muted-foreground">
                        This action cannot be undone. This will permanently delete the entry for design <span className="font-bold text-foreground">{entry.designName}</span> by <span className="font-bold text-foreground">{entry.karigarName}</span>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8">
                      <AlertDialogCancel className="rounded-2xl h-12 px-6 font-bold">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl h-12 px-6 font-bold shadow-lg shadow-destructive/20"
                        onClick={() => handleDelete(entry.id, entry.designName)}
                      >
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
          
            <div className="flex items-center gap-4 mb-6">
                <div className="relative group/avatar">
                  <Avatar className="h-12 w-12 border-2 border-white/50 shadow-xl transition-transform duration-500 group-hover/avatar:scale-110">
                    <AvatarFallback className="text-lg font-black bg-primary/20 text-primary font-headline">{entry.karigarName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md border border-white/50">
                    {entry.shift === 'day' ? <Sun className="h-3 w-3 text-orange-500 animate-pulse" /> : <Moon className="h-3 w-3 text-blue-500 animate-float" />}
                  </div>
                </div>
                <div>
                  <p className="font-black text-xl font-headline tracking-tight leading-none mb-1">{entry.karigarName}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] py-0 px-1.5 bg-primary/5 border-primary/10 text-primary/70">Operator</Badge>
                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">{entry.shift} Shift</span>
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 group-hover:bg-white/20 transition-colors">
                <div className="flex items-center gap-1.5 mb-1.5">
                    <Layers className="h-3 w-3 text-primary/60" />
                    <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Design</p>
                </div>
                <p className="font-bold text-sm truncate tracking-tight">{entry.designName}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 group-hover:bg-white/20 transition-colors">
                <div className="flex items-center gap-1.5 mb-1.5">
                    <Hash className="h-3 w-3 text-primary/60" />
                    <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Tich</p>
                </div>
                <p className="font-bold text-sm tracking-tight">{entry.designTich.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 group-hover:bg-white/20 transition-colors">
                <div className="flex items-center gap-1.5 mb-1.5">
                    <Plus className="h-3 w-3 text-primary/60" />
                    <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Frame</p>
                </div>
                <p className="font-bold text-sm tracking-tight">{entry.frame}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 group-hover:bg-white/20 transition-colors">
                <div className="flex items-center gap-1.5 mb-1.5">
                    <Ruler className="h-3 w-3 text-primary/60" />
                    <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Meter</p>
                </div>
                <p className="font-bold text-sm tracking-tight">{entry.totalMeter}<span className="text-[10px] ml-0.5 opacity-60">m</span></p>
              </div>
            </div>

            <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 flex items-center justify-between shadow-inner group-hover:bg-primary/15 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/20 p-1.5 rounded-lg">
                    <ChevronsUp className="h-4 w-4 text-primary" />
                </div>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Total Tich</span>
              </div>
              <span className="font-black text-2xl text-primary font-headline tracking-tighter">{entry.totalTich.toLocaleString()}</span>
            </div>
        </div>
    );
};


const ShiftCard = ({
  title,
  icon: Icon,
  entries,
  onDelete,
  onEdit,
  performance,
}: {
  title: string;
  icon: React.ElementType;
  entries: ProductionEntry[];
  onDelete: (entryId: string) => void;
  onEdit: (entry: ProductionEntry) => void;
  performance: 'good' | 'bad' | 'neutral';
}) => {
  if (entries.length === 0) return null;

  const isDay = title.includes('Day');

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
            <div className={cn(
                "p-4 rounded-[1.5rem] shadow-xl border-2 transition-transform duration-500 hover:scale-110", 
                isDay 
                    ? "bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-orange-500/10" 
                    : "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/10"
            )}>
              <Icon className={cn("h-8 w-8", isDay ? "animate-pulse" : "animate-float")} />
            </div>
            <div>
                <h3 className="text-2xl font-black font-headline tracking-tight text-foreground">{title}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">{entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}</p>
            </div>
        </div>
        {performance !== 'neutral' && (
            <Badge variant="outline" className={cn(
                "rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest shadow-lg",
                performance === 'good' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
            )}>
                {performance === 'good' ? 'Top Performer' : 'Under Performer'}
            </Badge>
        )}
      </div>
      <div className="grid grid-cols-1 gap-8">
        {entries.map((entry) => (
          <ProductionEntryItem
            key={entry.id}
            entry={entry}
            performance={performance}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
};


type GroupedEntries = {
  [date: string]: {
    [machineId: string]: {
      day: ProductionEntry[];
      night: ProductionEntry[];
    };
  };
};

export default function EntriesPage() {
  const { machines, allProductionEntries, deleteProductionEntry, updateProductionEntry } = useMachines();
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [editingEntry, setEditingEntry] = useState<ProductionEntry | null>(null);
  const [isDateFilterOpen, setDateFilterOpen] = useState(false);
  const { toast } = useToast();
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    // If a complete range is selected (or a single day is double-clicked), close the popover.
    if (range?.from && range?.to) {
      setDateFilterOpen(false);
    }
  };

  const machineOptions = useMemo(
    () => machines.map(m => ({ value: m.id, label: `${m.id} (${m.model})` })).sort((a,b) => {
        const numA = parseInt(a.value.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.value.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
    }), [machines]
  );
  
  const isFiltered = selectedMachines.length > 0 || dateRange?.from;

  const filteredEntries = useMemo(() => {
    return allProductionEntries.filter(entry => {
        const machineFilterPassed = selectedMachines.length === 0 || selectedMachines.includes(entry.machineId);
        
        let dateFilterPassed = true;
        if (dateRange?.from) {
            const entryDate = new Date(entry.date);
            const fromDate = new Date(dateRange.from.setHours(0,0,0,0));
            if (dateRange.to) {
                const toDate = new Date(dateRange.to.setHours(23,59,59,999));
                dateFilterPassed = entryDate >= fromDate && entryDate <= toDate;
            } else {
                dateFilterPassed = entryDate >= fromDate && entryDate <= new Date(dateRange.from.setHours(23,59,59,999));
            }
        }
        
        return machineFilterPassed && dateFilterPassed;
    });
  }, [allProductionEntries, selectedMachines, dateRange]);

  const groupedEntries = useMemo(() => {
    const sortedEntries = [...filteredEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const grouped: GroupedEntries = sortedEntries.reduce((acc: GroupedEntries, entry) => {
      const { date, machineId, shift } = entry;
      if (!acc[date]) acc[date] = {};
      if (!acc[date][machineId]) acc[date][machineId] = { day: [], night: [] };
      acc[date][machineId][shift].push(entry);
      return acc;
    }, {});
    
    return Object.entries(grouped).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

  }, [filteredEntries]);
  
  const handleEdit = (entry: ProductionEntry) => {
    setEditingEntry(entry);
  };

  const handleUpdateEntry = (data: EditEntryFormValues) => {
    if (!editingEntry) return;
    updateProductionEntry(editingEntry.id, data);
    toast({
      title: "Entry Updated",
      description: "The production entry has been updated.",
    });
    setEditingEntry(null);
  };

  const handleShareToWhatsApp = (date: string, machinesOnDate: GroupedEntries[string]) => {
    let report = `*Production Report - ${format(new Date(date), 'eeee, MMM do, yyyy')}*\n\n`;

    Object.entries(machinesOnDate)
      .sort((a, b) => {
        const numA = parseInt(a[0].replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b[0].replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      })
      .forEach(([machineId, shifts]) => {
        const machine = machines.find(m => m.id === machineId);
        report += `*Machine: ${machineId} ${machine ? `(${machine.model})` : ''}*\n`;

        if (shifts.day.length > 0) {
          report += `\n*DAY SHIFT*\n`;
          shifts.day.forEach(entry => {
            report += `--------------------\n`;
            report += `Design: *${entry.designName}*\n`;
            report += `Karigar: ${entry.karigarName}\n`;
            report += `Frame: ${entry.frame} | Meter: ${entry.totalMeter}m\n`;
            report += `Total Tich: ${entry.totalTich.toLocaleString()}\n`;
          });
        }

        if (shifts.night.length > 0) {
          report += `\n*NIGHT SHIFT*\n`;
          shifts.night.forEach(entry => {
            report += `--------------------\n`;
            report += `Design: *${entry.designName}*\n`;
            report += `Karigar: ${entry.karigarName}\n`;
            report += `Frame: ${entry.frame} | Meter: ${entry.totalMeter}m\n`;
            report += `Total Tich: ${entry.totalTich.toLocaleString()}\n`;
          });
        }
        report += `\n`;
      });

    const encodedReport = encodeURIComponent(report);
    window.open(`https://wa.me/?text=${encodedReport}`, '_blank');
  };

  const handleClearFilters = () => {
    setSelectedMachines([]);
    setDateRange(undefined);
  };
  
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Production Entries" className="no-print">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button asChild variant="glass" className="hidden sm:flex px-4">
            <Link href="/production/new">
              <Plus className="mr-2 h-4 w-4" />
              <span>New Entry</span>
            </Link>
          </Button>
          <Button
            variant={isFilterMenuOpen ? 'secondary' : 'outline'}
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className="relative flex-1 sm:flex-none px-4"
          >
            <Filter className="mr-2 h-4 w-4" />
            <span>Filter</span>
            {isFiltered && !isFilterMenuOpen && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
          </Button>
        </div>
      </PageHeader>
      
      <Collapsible open={isFilterMenuOpen}>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="p-6 bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl rounded-[2.5rem] no-print">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-3">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Filter by Machine</label>
                     <ScrollArea className="h-48 w-full rounded-2xl border border-black/10 dark:border-white/10 bg-background/50 backdrop-blur-sm">
                        <div className="p-4 space-y-3">
                            {machineOptions.map((option) => (
                                <div key={option.value} className="flex items-center space-x-3 group">
                                    <Checkbox
                                        id={option.value}
                                        checked={selectedMachines.includes(option.value)}
                                        onCheckedChange={(checked) => {
                                            setSelectedMachines(prev =>
                                                checked
                                                    ? [...prev, option.value]
                                                    : prev.filter((value) => value !== option.value)
                                            );
                                        }}
                                        className="rounded-md data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-all duration-200"
                                    />
                                    <label
                                        htmlFor={option.value}
                                        className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer group-hover:text-primary transition-colors"
                                    >
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <div className="space-y-3">
                     <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Filter by Date</label>
                    <Popover open={isDateFilterOpen} onOpenChange={setDateFilterOpen}>
                        <PopoverTrigger asChild>
                            <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-bold h-14 rounded-2xl border-black/10 dark:border-white/10 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300",
                                !dateRange && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                </>
                                ) : (
                                format(dateRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-3xl border-black/10 dark:border-white/10 shadow-2xl !z-[9999]" align="start">
                            <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={handleDateSelect}
                            numberOfMonths={1}
                            captionLayout="dropdown-buttons"
                            fromYear={new Date().getFullYear() - 10}
                            toYear={new Date().getFullYear() + 10}
                            className="p-4"
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            {isFiltered && (
                <div className="mt-6 flex justify-end">
                    <Button variant="ghost" onClick={handleClearFilters} className="rounded-xl font-bold hover:bg-destructive/10 hover:text-destructive transition-colors">
                        <FilterX className="mr-2 h-4 w-4"/>
                        Clear Filters
                    </Button>
                </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {groupedEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 gap-6 bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl rounded-[3rem] text-center">
            <div className="bg-primary/10 p-6 rounded-full shadow-inner border border-primary/20">
                <CalendarIcon className="h-12 w-12 text-primary opacity-80" />
            </div>
            <div className="space-y-2">
                <h3 className="text-3xl font-black font-headline tracking-tight">No Entries Found</h3>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto">We couldn&apos;t find any production entries matching your current filters. Try adjusting them or add a new entry.</p>
            </div>
            <Button asChild size="lg" className="rounded-2xl mt-4 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <Link href="/production/new">
                    <Plus className="mr-2 h-5 w-5" />
                    Add First Entry
                </Link>
            </Button>
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-6">
          {groupedEntries.map(([date, machinesOnDate]) => (
            <AccordionItem key={date} value={date} className="border-none print-card-container">
              <div className="liquid-glass p-0 rounded-[2.5rem] border border-white/20 shadow-2xl relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-center justify-between relative w-full pr-6 border-b border-white/10 bg-white/5">
                  <AccordionTrigger className="hover:no-underline px-4 py-2 flex-1 [&[data-state=open]>div>div>svg.chevron]:rotate-180">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-3 rounded-full shadow-inner border border-primary/20">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-xl font-black text-foreground font-headline tracking-tight">
                          {format(new Date(date), 'eeee, MMM do')}
                        </h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">{format(new Date(date), 'yyyy')}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <div className="flex items-center gap-3 no-print z-10">
                    <Tooltip>
                      <TooltipTrigger asChild>
                          <Button size="lg" className="rounded-full bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 shadow-lg hover:bg-[#25D366] hover:text-white hover:shadow-xl hover:shadow-[#25D366]/20 hover:-translate-y-1 transform transition-all duration-300 font-bold px-6" onClick={(e) => { e.stopPropagation(); handleShareToWhatsApp(date, machinesOnDate); }}>
                             <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-5 w-5 mr-2">
                                <title>WhatsApp</title>
                                <path d="M12.04 2.015c-5.52 0-9.994 4.475-9.994 9.995 0 1.88.523 3.633 1.43 5.144L2 22l5.05-1.378a9.92 9.92 0 0 0 4.99 1.362h.002c5.52 0 9.995-4.476 9.995-9.995s-4.475-9.996-9.995-9.996zM17.473 14.383c-.297-.149-1.758-.867-2.03-.967-.273-.1-.47-.148-.67.15-.196.297-.767.966-.94 1.164-.172.199-.346.223-.644.074-.297-.15-1.254-.463-2.39-1.475-.883-.788-1.48-1.76-1.652-2.058-.173-.297-.018-.458.13-.606.135-.133.297-.347.446-.52.149-.174.198-.298.298-.497.1-.198.05-.371-.025-.52s-.67-.816-.917-1.114c-.247-.298-.495-.255-.67-.255-.172 0-.37.025-.52.025-.148 0-.37.074-.568.371-.198.298-.768.967-.768 2.352 0 1.385.792 2.733.916 2.93.124.198 1.58 2.52 3.824 3.537.533.249.94.398 1.267.507.506.171.95.147 1.305.09.43-.07 1.255-.513 1.428-.988.173-.474.173-.881.124-1.024-.05-.147-.172-.222-.37-.37z"/>
                              </svg>
                              Share Report
                          </Button>
                      </TooltipTrigger>
                        <TooltipContent className="rounded-full font-bold">
                            <p>Share on WhatsApp</p>
                        </TooltipContent>
                      </Tooltip>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="lg" className="rounded-full bg-destructive/10 text-destructive border border-destructive/20 shadow-lg hover:bg-destructive hover:text-white hover:shadow-xl hover:shadow-destructive/20 hover:-translate-y-1 transform transition-all duration-300 font-bold px-6" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-5 w-5 mr-2" />
                            Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="liquid-glass border-white/20 rounded-[2.5rem] p-8">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-3xl font-bold font-headline tracking-tight">Delete All Entries for {format(new Date(date), 'MMM do, yyyy')}?</AlertDialogTitle>
                          <AlertDialogDescription className="text-lg text-muted-foreground">
                            This action cannot be undone. This will permanently delete all production entries for this date.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-8">
                          <AlertDialogCancel className="rounded-2xl h-12 px-6 font-bold">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl h-12 px-6 font-bold shadow-lg shadow-destructive/20"
                            onClick={async () => {
                                await bulkDeleteEntries({ startDate: startOfDay(new Date(date)), endDate: endOfDay(new Date(date)) });
                                toast({
                                    title: "Date Entries Deleted",
                                    description: `All entries for ${format(new Date(date), 'MMM do, yyyy')} have been deleted.`,
                                });
                            }}
                          >
                            Delete Permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    </div>
                  </div>

                <AccordionContent className="pt-8 pb-6 px-6">
                  <div className="space-y-12">
                    {Object.entries(machinesOnDate)
                    .sort((a, b) => {
                      const numA = parseInt(a[0].replace(/\D/g, ''), 10) || 0;
                      const numB = parseInt(b[0].replace(/\D/g, ''), 10) || 0;
                      return numA - numB;
                    })
                    .map(([machineId, shifts]) => {
                    const machine = machines.find(m => m.id === machineId);
                    
                    let dayPerformance: 'good' | 'bad' | 'neutral' = 'neutral';
                    let nightPerformance: 'good' | 'bad' | 'neutral' = 'neutral';

                    const dayTotalTich = shifts.day.reduce((acc, entry) => acc + entry.totalTich, 0);
                    const nightTotalTich = shifts.night.reduce((acc, entry) => acc + entry.totalTich, 0);

                    if (shifts.day.length > 0 && shifts.night.length > 0) {
                        if (dayTotalTich > nightTotalTich) {
                            dayPerformance = 'good';
                            nightPerformance = 'bad';
                        } else if (nightTotalTich > dayTotalTich) {
                            dayPerformance = 'bad';
                            nightPerformance = 'good';
                        }
                    }

                    return (
                      <div key={machineId} className="space-y-8 bg-black/5 dark:bg-white/5 p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/20 p-3 rounded-2xl shadow-inner border border-primary/30">
                                    <SewingMachineIcon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black font-headline tracking-tight text-foreground">
                                        Machine {machineId}
                                    </h3>
                                    {machine && (
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                            Model: {machine.model}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest py-1 px-3 bg-background/50 backdrop-blur-md">
                                    {shifts.day.length + shifts.night.length} Total Entries
                                </Badge>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <ShiftCard 
                              title="Day Shift" 
                              icon={Sun} 
                              entries={shifts.day} 
                              onDelete={deleteProductionEntry} 
                              onEdit={handleEdit}
                              performance={dayPerformance}
                           />
                          <ShiftCard 
                              title="Night Shift" 
                              icon={Moon} 
                              entries={shifts.night} 
                              onDelete={deleteProductionEntry} 
                              onEdit={handleEdit}
                              performance={nightPerformance}
                          />
                        </div>
                      </div>
                    )
                })}
                </div>
              </AccordionContent>
            </div>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {editingEntry && (
        <Dialog open={!!editingEntry} onOpenChange={(isOpen) => !isOpen && setEditingEntry(null)}>
            <DialogContent className="liquid-glass border-white/20 p-8 rounded-[3rem] sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold font-headline">Edit Production Entry</DialogTitle>
                    <DialogDescription className="text-base">
                        Update the details for the entry by <span className="font-semibold">{editingEntry.karigarName}</span> on machine <span className="font-semibold">{editingEntry.machineId}</span>.
                    </DialogDescription>
                </DialogHeader>
                <EditProductionForm 
                    entry={editingEntry}
                    machine={machines.find(m => m.id === editingEntry.machineId)}
                    onUpdate={handleUpdateEntry}
                    onCancel={() => setEditingEntry(null)}
                />
            </DialogContent>
        </Dialog>
    )}

    </div>
  );
}
