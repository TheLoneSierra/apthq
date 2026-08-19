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
