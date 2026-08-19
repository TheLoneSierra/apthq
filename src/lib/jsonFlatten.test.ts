import { describe, expect, it } from 'vitest'
import { flattenObject, unflattenEntries, isHexColor } from './jsonFlatten'

describe('jsonFlatten', () => {
  it('detects hex colors properly', () => {
    expect(isHexColor('#fff')).toBe(true)
    expect(isHexColor('#8b5cf6')).toBe(true)
    expect(isHexColor('#123456')).toBe(true)
    expect(isHexColor('blue')).toBe(false)
    expect(isHexColor('123')).toBe(false)
  })

  it('flattens nested object into dot-notation entries', () => {
    const input = {
      key: 'smc',
      typography: {
        fontSans: 'Inter, sans-serif',
      },
      colors: {
        primary: '#3F4599',
      },
      settings: {
        active: true,
        retries: 3,
      },
    }

    const flattened = flattenObject(input)
    expect(flattened).toHaveLength(5)
    expect(flattened.find((f) => f.key === 'key')?.value).toBe('smc')
    expect(flattened.find((f) => f.key === 'typography.fontSans')?.value).toBe('Inter, sans-serif')
    expect(flattened.find((f) => f.key === 'colors.primary')?.value).toBe('#3F4599')
    expect(flattened.find((f) => f.key === 'colors.primary')?.type).toBe('color')
    expect(flattened.find((f) => f.key === 'settings.active')?.value).toBe('true')
    expect(flattened.find((f) => f.key === 'settings.retries')?.value).toBe('3')
  })

  it('unflattens entries back to original nested structure', () => {
    const entries = [
      { id: '1', key: 'key', value: 'tradesmart', type: 'string' as const },
      { id: '2', key: 'colors.primary', value: '#8b5cf6', type: 'color' as const },
      { id: '3', key: 'typography.fontSans', value: 'Inter', type: 'string' as const },
      { id: '4', key: 'stats.count', value: '42', type: 'number' as const },
      { id: '5', key: 'flags.enabled', value: 'true', type: 'boolean' as const },
    ]

    const result = unflattenEntries(entries)
    expect(result).toEqual({
      key: 'tradesmart',
      colors: {
        primary: '#8b5cf6',
      },
      typography: {
        fontSans: 'Inter',
      },
      stats: {
        count: 42,
      },
      flags: {
        enabled: true,
      },
    })
  })

  it('handles empty or blank keys gracefully', () => {
    const entries = [
      { id: '1', key: '', value: 'ignored', type: 'string' as const },
      { id: '2', key: 'validKey', value: 'stored', type: 'string' as const },
    ]
    expect(unflattenEntries(entries)).toEqual({ validKey: 'stored' })
  })
})
