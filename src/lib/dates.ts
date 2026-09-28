import { format, isAfter, isValid, parse, startOfYear, subDays } from 'date-fns'
import type { DateRange, PeriodPreset } from '../types/dashboard'
import { toIsoDate } from './format'

export function defaultDateRange(): DateRange {
  const end = new Date()
  const start = subDays(end, 30)
  return { start: toIsoDate(start), end: toIsoDate(end) }
}

export function rangeFromPreset(preset: PeriodPreset): DateRange {
  const end = new Date()
  const start = new Date()

  if (preset === '7d') start.setDate(end.getDate() - 7)
  else if (preset === '30d') start.setDate(end.getDate() - 30)
  else if (preset === '90d') start.setDate(end.getDate() - 90)
  else start.setTime(startOfYear(end).getTime())

  return { start: toIsoDate(start), end: toIsoDate(end) }
}

export function formatRangeLabel(range: DateRange): string {
  return `${range.start} → ${range.end}`
}

/** Local calendar date → YYYY-MM-DD (avoids UTC shift from toISOString). */
export function toIsoDateLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse YYYY-MM-DD as a local Date at midnight. */
export function parseLocalDate(value: string): Date {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return new Date(NaN)
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

export function parseTypedRange(value: string): DateRange | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const match = trimmed.match(
    /^(\d{4}-\d{2}-\d{2})\s*(?:→|->|-|to)\s*(\d{4}-\d{2}-\d{2})$/i,
  )
  if (!match) return null

  const startDate = parse(match[1], 'yyyy-MM-dd', new Date())
  const endDate = parse(match[2], 'yyyy-MM-dd', new Date())
  if (!isValid(startDate) || !isValid(endDate) || isAfter(startDate, endDate)) {
    return null
  }

  return { start: format(startDate, 'yyyy-MM-dd'), end: format(endDate, 'yyyy-MM-dd') }
}
