'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Machine, ProductionEntry } from '@/lib/types';
import { Check, CheckCheck, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DailyMachineEntryStatusProps {
  machines: Machine[];
  entries: ProductionEntry[];
}

const statusConfig = {
  both: {
    color: 'bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-400',
    icon: CheckCheck,
    label: 'Both Shifts Entered',
  },
  one: {
    color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-400',
    icon: Check,
    label: 'One Shift Entered',
  },
  none: {
    color: 'bg-red-500/20 border-red-500/50 text-red-700 dark:text-red-400',
    icon: X,
    label: 'No Shifts Entered',
  },
};

export function DailyMachineEntryStatus({ machines, entries }: DailyMachineEntryStatusProps) {
  const yesterday = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return format(date, 'yyyy-MM-dd');
  }, []);

  const machineStatuses = useMemo(() => {
    const sortedMachines = [...machines].sort((a,b) => {
        const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
    });

    return sortedMachines.map(machine => {
      const yesterdayEntries = entries.filter(
        entry => entry.machineId === machine.id && entry.date === yesterday
      );
      const hasDayEntry = yesterdayEntries.some(e => e.shift === 'day');
      const hasNightEntry = yesterdayEntries.some(e => e.shift === 'night');

      let status: keyof typeof statusConfig = 'none';
      if (hasDayEntry && hasNightEntry) {
        status = 'both';
      } else if (hasDayEntry || hasNightEntry) {
        status = 'one';
      }

      return {
        id: machine.id,
        model: machine.model,
        status,
      };
    });
  }, [machines, entries, yesterday]);

  if (machines.length === 0) {
      return (
        <div className="py-8 text-center text-muted-foreground">
            Please add a machine to see its status.
        </div>
      )
  }

  return (
    <TooltipProvider>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
        {machineStatuses.map(({ id, model, status }) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            return (
            <Tooltip key={id}>
                <TooltipTrigger asChild>
                <div
                    className={cn(
                    'flex flex-col items-center justify-center aspect-square rounded-lg border-2 p-2 transition-all',
                    config.color
                    )}
                >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-bold mt-1 text-foreground/80">{id}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">({model})</span>
                </div>
                </TooltipTrigger>
                <TooltipContent>
                <p>{config.label}</p>
                </TooltipContent>
            </Tooltip>
            );
        })}
        </div>
    </TooltipProvider>
  );
}
