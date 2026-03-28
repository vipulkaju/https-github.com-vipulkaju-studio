import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Machine } from '@/lib/types';
import { Circle } from 'lucide-react';

interface MachineStatusListProps {
  machines: Machine[];
}

const statusStyles = {
  running: 'text-green-500',
  idle: 'text-yellow-500',
  fault: 'text-red-500',
};

const statusBgStyles = {
    running: 'bg-green-500/10 border-green-500/20',
    idle: 'bg-yellow-500/10 border-yellow-500/20',
    fault: 'bg-red-500/10 border-red-500/20',
}

export function MachineStatusList({ machines }: MachineStatusListProps) {
    const sortedMachines = [...machines].sort((a,b) => {
        const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
    });

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">Machine Status</CardTitle>
        <CardDescription className="text-sm">Live status of all registered machines.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          {sortedMachines.map((machine) => (
            <div key={machine.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                 <Circle className={cn('h-2.5 w-2.5 fill-current', statusStyles[machine.status])} />
                <div>
                  <p className="font-medium">{machine.id}</p>
                  <p className="text-xs text-muted-foreground">Model: {machine.model}</p>
                </div>
              </div>
              <Badge variant="outline" className={cn("capitalize text-xs", statusStyles[machine.status], statusBgStyles[machine.status])}>
                {machine.status}
              </Badge>
            </div>
          ))}
          {sortedMachines.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No machines found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
