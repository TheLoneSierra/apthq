import { CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { DateRange as DayPickerRange } from 'react-day-picker'
import {
  formatRangeLabel,
  parseLocalDate,
  toIsoDateLocal,
} from '../../lib/dates'
import type { DateRange } from '../../types/dashboard'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

function toDayPickerRange(range: DateRange): DayPickerRange {
  return {
    from: parseLocalDate(range.start),
    to: parseLocalDate(range.end),
  }
}

export function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRange
  onChange: (range: DateRange) => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DayPickerRange | undefined>(() =>
    toDayPickerRange(value),
  )

  useEffect(() => {
    setDraft(toDayPickerRange(value))
  }, [value])

  const applyRange = (next: DayPickerRange | undefined) => {
    setDraft(next)
    if (next?.from && next?.to) {
      onChange({
        start: toIsoDateLocal(next.from),
        end: toIsoDateLocal(next.to),
      })
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rdp-trigger"
          aria-label="Select date range"
        >
          <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-[var(--text3)]" />
          <span className="font-mono-dm text-[11px] text-[var(--text)]">
            {formatRangeLabel(value)}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Calendar
          mode="range"
          defaultMonth={draft?.from ?? parseLocalDate(value.start)}
          selected={draft}
          onSelect={applyRange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
