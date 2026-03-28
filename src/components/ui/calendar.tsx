"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useDayPicker, useNavigation, type CaptionProps, type DateRange, type DayContentProps } from "react-day-picker"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  
  const getInitialDate = () => {
    if (props.mode === 'single' && props.selected) {
      return props.selected as Date;
    }
    if (props.mode === 'range' && props.selected) {
      const range = props.selected as DateRange;
      return range.to || range.from;
    }
    return new Date();
  }

  const [headerDate, setHeaderDate] = React.useState<Date | undefined>(getInitialDate());

  React.useEffect(() => {
    setHeaderDate(getInitialDate());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selected]);

  return (
    <div className={cn("rounded-xl border bg-card/80 backdrop-blur-sm text-card-foreground shadow-xl w-fit border-white/10", className)}>
        <div className="bg-primary/80 text-primary-foreground px-4 py-3 flex items-center justify-between rounded-t-xl">
            <div>
                <p className="text-sm font-medium opacity-90">{headerDate ? format(headerDate, "yyyy") : ''}</p>
                <p className="text-2xl font-semibold">{headerDate ? format(headerDate, "eeee, LLL d") : 'No date'}</p>
            </div>
        </div>

        <div className="p-4">
          <DayPicker
              showOutsideDays={showOutsideDays}
              className="p-0"
              classNames={{
                months: "flex flex-col sm:flex-row",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center mb-2",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                  "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                ...classNames,
              }}
              components={{
                Caption: CustomCaption,
              }}
              {...props}
          />
        </div>
    </div>
  )
}
Calendar.displayName = "Calendar"


function CustomCaption(props: CaptionProps) {
    const { goToMonth, nextMonth, previousMonth } = useNavigation();
    return (
      <div className="flex items-center justify-between pt-1 px-1">
        <h2 className="text-sm font-semibold text-center flex-1">{format(props.displayMonth, 'MMMM yyyy')}</h2>
        <div className="flex items-center gap-1">
            <Button
                disabled={!previousMonth}
                onClick={() => previousMonth && goToMonth(previousMonth)}
                variant="outline"
                size="icon"
                className="h-7 w-7"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
                disabled={!nextMonth}
                onClick={() => nextMonth && goToMonth(nextMonth)}
                variant="outline"
                size="icon"
                className="h-7 w-7"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      </div>
    );
}


export { Calendar }
