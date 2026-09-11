import { describe, expect, it } from 'vitest'
import {
  flattenWebhookSignals,
  isBrokerError,
  parseOrderPlacementCards,
  successfulOrphanBrokers,
  toNaiveIstDatetime,
} from './hqOps'

describe('hqOps helpers', () => {
  it('detects broker error envelopes', () => {
    expect(
      isBrokerError({
        error: "Client error '404 Not Found'",
        status_code: 404,
        body: { detail: 'Parent strategy not found' },
      }),
    ).toBe(true)
    expect(isBrokerError({ success: true, data: { status: 'ok' } })).toBe(false)
  })

  it('builds naive IST datetimes', () => {
    expect(toNaiveIstDatetime('2026-09-10', '09:15')).toBe('2026-09-10T09:15:00')
    expect(toNaiveIstDatetime('2026-09-10', '')).toBe('2026-09-10T00:00:00')
  })

  it('parses order-placement cards with ok / not_ok / unreachable', () => {
    const parsed = parseOrderPlacementCards({
      total: 3,
      brokers: {
        smc: {
          success: true,
          message: 'healthy',
          data: { status: 'ok', failures: [], tokenIndexProbes: {} },
        },
        bajaj: {
          success: false,
          message: 'unhealthy',
          data: {
            status: 'not_ok',
            failures: ['Redis client is unavailable'],
            tokenIndexProbes: {
              cash: { found: true, valid: true },
              fut: { found: false, valid: false },
              opt: { found: true, valid: true },
            },
          },
        },
        navia: {
          error: 'timeout',
          status_code: 500,
          body: { detail: 'upstream down' },
        },
      },
    })

    expect(parsed.ok).toBe(1)
    expect(parsed.issues).toBe(1)
    expect(parsed.unreachable).toBe(1)
    expect(parsed.cards.find((c) => c.broker === 'bajaj')?.failures).toEqual([
      'Redis client is unavailable',
    ])
    expect(parsed.cards.find((c) => c.broker === 'navia')?.uiStatus).toBe(
      'unreachable',
    )
  })

  it('flattens webhook signals and skips error brokers', () => {
    const flat = flattenWebhookSignals({
      total: 1,
      broker_count: 2,
      brokers: {
        smc: {
          new_relic: { attached: false, reason: 'include_logs=false' },
          signals: [
            {
              id: 'sig-1',
              status: 'FAILED',
              created_at: '2026-09-10T10:00:00.000Z',
              message: 'Market price unavailable',
            },
          ],
        },
        bajaj: {
          error: 'not found',
          status_code: 404,
        },
      },
    })

    expect(flat.rows).toHaveLength(1)
    expect(flat.rows[0].broker).toBe('smc')
    expect(flat.total).toBe(1)
    expect(flat.newRelicNotice).toBe('include_logs=false')
  })

  it('returns successful orphan brokers only', () => {
    const hits = successfulOrphanBrokers({
      orphan_position_count: 1,
      broker_count: 2,
      brokers: {
        smc: {
          summary: { orphan_position_count: 1 },
          parent: { strategy: { id: 'p1' }, positions: [] },
          children: [],
        },
        bajaj: { error: 'missing', status_code: 404 },
      },
    })
    expect(hits).toHaveLength(1)
    expect(hits[0].broker).toBe('smc')
  })
})
