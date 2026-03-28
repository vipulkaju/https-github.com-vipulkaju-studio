'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ProductionRecord } from '@/lib/types';
import { useMemo } from 'react';
import { format } from 'date-fns';

interface ProductionChartProps {
  data: ProductionRecord[];
}

const chartConfig = {
  output: {
    label: 'Output (units)',
    color: 'hsl(var(--primary))',
  },
  downtime: {
    label: 'Downtime (min)',
    color: 'hsl(var(--destructive))',
  },
};

export function ProductionChart({ data }: ProductionChartProps) {
  const chartData = useMemo(() => {
    return data.map((record) => ({
      date: format(new Date(record.date), 'MMM d'),
      output: record.outputUnits,
      downtime: record.downtimeMinutes,
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Production Overview</CardTitle>
        <CardDescription>Output units and downtime minutes for the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--destructive))" />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="output" fill="var(--color-output)" radius={4} yAxisId="left" />
            <Bar dataKey="downtime" fill="var(--color-downtime)" radius={4} yAxisId="right" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
