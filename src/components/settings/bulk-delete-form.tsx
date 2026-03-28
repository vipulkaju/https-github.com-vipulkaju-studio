'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { useMachines } from '@/context/machines-context';
import type { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';

export function BulkDeleteForm() {
  const { allProductionEntries, bulkDeleteEntries } = useMachines();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const { toast } = useToast();
  
  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setPickerOpen(false);
    }
  };

  const entriesToDeleteCount = () => {
    if (!dateRange?.from) return 0;

    const fromDate = new Date(dateRange.from.setHours(0, 0, 0, 0));
    const toDate = dateRange.to ? new Date(dateRange.to.setHours(23, 59, 59, 999)) : fromDate;

    return allProductionEntries.filter(
      (e) => {
        const entryDate = new Date(e.date);
        return entryDate >= fromDate && entryDate <= toDate;
      }
    ).length;
  };
  
  const count = entriesToDeleteCount();

  const handleBulkDelete = async () => {
    if (!dateRange?.from) {
        toast({
            variant: 'destructive',
            title: 'Invalid Date Range',
            description: 'Please select a date or date range to delete.',
        });
        return;
    }

    setIsLoading(true);
    try {
      const deletedCount = await bulkDeleteEntries({
        startDate: dateRange.from,
        endDate: dateRange.to || dateRange.from,
      });

      toast({
        title: 'Entries Deleted',
        description: `${deletedCount} production entries have been permanently deleted.`,
      });
      setDateRange(undefined);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'An error occurred while deleting entries. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-lg border-white/10 shadow-xl">
      <CardHeader>
        <CardTitle>Bulk Delete Production Entries</CardTitle>
        <CardDescription>
          Permanently delete entries by selecting a date or a date range. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="date-range-picker">Date Range</Label>
            <Popover open={isPickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
                <Button
                id="date-range-picker"
                variant={'outline'}
                className={cn(
                    'w-full justify-start text-left font-normal h-12 text-base bg-background/80 backdrop-blur-sm',
                    !dateRange && 'text-muted-foreground'
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {dateRange?.from ? (
                    dateRange.to ? (
                    <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                    </>
                    ) : (
                    format(dateRange.from, 'LLL dd, y')
                    )
                ) : (
                    <span>Pick a date or date range</span>
                )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 !z-[9999]" align="start">
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
                />
            </PopoverContent>
            </Popover>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full"
              disabled={count === 0 || isLoading}
            >
              {isLoading ? 'Deleting...' : `Delete ${count} Entries`}
              <Trash2 className="ml-2 h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <span className="font-bold">{count}</span> production entries from the selected date range. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleBulkDelete}
              >
                Yes, delete them
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </CardContent>
    </Card>
  );
}
