import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ComponentProps } from 'react'
import { DayPicker } from 'react-day-picker'
import { cn } from '../../lib/utils'

export type CalendarProps = ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('rdp-root p-2', className)}
      classNames={{
        months: 'relative flex flex-col gap-3 sm:flex-row',
        month: 'flex w-full flex-col gap-2',
        month_caption: 'flex h-8 items-center justify-center px-8',
        caption_label: 'text-xs font-semibold text-[var(--text)]',
        nav: 'absolute inset-x-0 top-0 flex items-center justify-between px-1',
        button_previous: 'rdp-nav-btn',
        button_next: 'rdp-nav-btn',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday:
          'w-8 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--text3)]',
        week: 'mt-0.5 flex w-full',
        day: 'relative p-0 text-center',
        day_button: 'rdp-day-btn',
        selected: 'rdp-day-selected',
        range_start: 'rdp-range-start',
        range_end: 'rdp-range-end',
        range_middle: 'rdp-range-middle',
        today: 'rdp-day-today',
        outside: 'rdp-day-outside',
        disabled: 'rdp-day-disabled',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  )
}
