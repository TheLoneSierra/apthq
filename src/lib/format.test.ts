import { describe, expect, it } from 'vitest'
import { fmt, fmtTurnover, normalizeStrategyOrders } from './format'

describe('fmt', () => {
  it('returns em dash for nullish values', () => {
    expect(fmt(null)).toBe('—')
    expect(fmt(undefined)).toBe('—')
  })

  it('formats integers with locale grouping', () => {
    expect(fmt(24820)).toBe('24,820')
  })

  it('formats decimals with max 2 places', () => {
    expect(fmt(12.456)).toBe('12.46')
  })
})

describe('fmtTurnover', () => {
  it('formats turnover with up to 4 decimal places', () => {
    expect(fmtTurnover(284.12345)).toBe('284.1235')
  })
})

describe('normalizeStrategyOrders', () => {
  it('handles numeric values', () => {
    const result = normalizeStrategyOrders(42)
    expect(result.display).toBe('42')
    expect(result.metrics.active).toBe(42)
  })

  it('handles object breakdown', () => {
    const result = normalizeStrategyOrders({
      active: 10,
      all: 20,
      executed: 8,
      failed: 2,
    })
    expect(result.display).toBe('10')
    expect(result.summary).toContain('all 20')
  })
})
