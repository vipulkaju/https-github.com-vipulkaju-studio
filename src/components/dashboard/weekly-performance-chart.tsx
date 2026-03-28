'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ProductionEntry } from '@/lib/types';

interface WeeklyPerformanceChartProps {
  entries: ProductionEntry[];
}

const chartConfig = {
  day: {
    label: 'Day Shift',
    color: 'hsl(var(--primary))',
  },
  night: {
    label: 'Night Shift',
    color: 'hsl(var(--accent))',
  },
};

export function WeeklyPerformanceChart({ entries }: WeeklyPerformanceChartProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    // Assuming week starts on Sunday
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
    });

    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const dataByDay = daysOfWeek.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayEntries = weekEntries.filter(e => e.date === dayStr);

        const dayTotal = dayEntries
            .filter(e => e.shift === 'day')
            .reduce((acc, curr) => acc + curr.totalTich, 0);

        const nightTotal = dayEntries
            .filter(e => e.shift === 'night')
            .reduce((acc, curr) => acc + curr.totalTich, 0);

        return {
            date: format(day, 'EEE'), // Mon, Tue, etc.
            day: dayTotal,
            night: nightTotal,
        };
    });

    return dataByDay;
  }, [entries]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold font-headline tracking-tight text-foreground">This Week&apos;s Performance</h3>
        <p className="text-sm text-muted-foreground">Total Tich for Day vs. Night shifts</p>
      </div>
      <div className="w-full">
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
            />
            <YAxis 
                tickFormatter={(value) => {
                    if (typeof value !== 'number') return value;
                    return value > 1000 ? `${(value / 1000).toFixed(0)}k` : value;
                }}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(255,255,255,0.5)' }}
            />
            <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="day" fill="var(--color-day)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="night" fill="var(--color-night)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
