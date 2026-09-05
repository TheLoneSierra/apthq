import { describe, expect, it } from 'vitest'
import { healthV3FullUrl, parseHealthV3Response, summarizeSection } from './healthCheckV3'
import type { HealthV3Response } from '../types/healthCheckV3'

const sampleResponse: HealthV3Response = {
  success: false,
  message: 'Position service is unhealthy',
  data: {
    status: 'not_ok',
    message: 'Position service is unhealthy',
    sections: {
      positions: {
        status: 'ok',
        message: 'Positions are healthy',
        details: { dbLength: 1 },
        errors: [],
      },
      strategies: {
        status: 'not_ok',
        message: 'Strategies are unhealthy',
        details: { dbLength: 1, missingEntityKeys: ['abc'] },
        errors: ['Redis key unavailable'],
      },
    },
  },
}

describe('healthCheckV3', () => {
  it('builds full aptdemo URL for copy/paste', () => {
    expect(healthV3FullUrl()).toBe(
      'https://api.aptdemo.atoms.trade/v3/healthCheck/position-service',
    )
  })

  it('parses sections into rows with stats', () => {
    const stats = parseHealthV3Response(sampleResponse)
    expect(stats.total).toBe(2)
    expect(stats.ok).toBe(1)
    expect(stats.issues).toBe(1)
    expect(stats.rows[0].label).toBe('Positions')
    expect(stats.rows[1].chipLabel).toBe('NOT OK')
  })

  it('summarizes section details', () => {
    expect(
      summarizeSection({
        status: 'not_ok',
        message: 'x',
        details: { dbLength: 2, tradingDay: 'TUE' },
        errors: ['a', 'b'],
      }),
    ).toContain('dbLength: 2')
  })
})
