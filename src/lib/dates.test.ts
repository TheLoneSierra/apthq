import { describe, expect, it } from 'vitest'
import { formatRangeLabel, parseTypedRange, rangeFromPreset } from './dates'

describe('rangeFromPreset', () => {
  it('returns 30-day range for 30d preset', () => {
    const range = rangeFromPreset('30d')
    expect(range.start).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(range.end).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(range.start <= range.end).toBe(true)
  })
})

describe('formatRangeLabel', () => {
  it('joins dates with arrow', () => {
    expect(formatRangeLabel({ start: '2025-01-01', end: '2025-01-31' })).toBe(
      '2025-01-01 → 2025-01-31',
    )
  })
})

describe('parseTypedRange', () => {
  it('parses arrow-separated range', () => {
    expect(parseTypedRange('2025-01-01 → 2025-01-31')).toEqual({
      start: '2025-01-01',
      end: '2025-01-31',
    })
  })

  it('rejects invalid range', () => {
    expect(parseTypedRange('not-a-date')).toBeNull()
    expect(parseTypedRange('2025-02-01 → 2025-01-01')).toBeNull()
  })
})
