import { describe, expect, it } from 'vitest'
import { syncBrokersFromHealth } from './brokers'

describe('syncBrokersFromHealth', () => {
  it('always includes all brokers option', () => {
    const { options } = syncBrokersFromHealth(null, 'all')
    expect(options[0]).toEqual({ value: 'all', label: 'All Brokers' })
  })

  it('adds healthy brokers from health payload', () => {
    const { options } = syncBrokersFromHealth(
      { brokers: { tradesmart: 'ok', smc: 'unhealthy' } },
      'all',
    )
    expect(options.map((o) => o.value)).toEqual(['all', 'tradesmart'])
  })

  it('resets broker when current is not allowed', () => {
    const { broker } = syncBrokersFromHealth(
      { brokers: { tradesmart: 'ok' } },
      'smc',
    )
    expect(broker).toBe('all')
  })
})
