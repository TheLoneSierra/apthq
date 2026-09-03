import { describe, expect, it } from 'vitest'
import { DEFAULT_API_PROXY_TARGET } from './constants'
import {
  DEBUG_STRATEGY_API_ORIGIN,
  debugStrategyFullUrl,
  debugStrategyPath,
  debugStrategyPathPreview,
  debugStrategyV3FullUrl,
  extractStrategyData,
  flattenTopLevelFields,
  isApiErrorBody,
  summarizeDebugResult,
} from './debugStrategyApi'

describe('debugStrategyApi', () => {
  it('uses Lambda as debug strategy origin', () => {
    expect(DEBUG_STRATEGY_API_ORIGIN).toBe(DEFAULT_API_PROXY_TARGET)
  })

  it('builds Lambda position lookup path', () => {
    expect(debugStrategyPath('strategy-1')).toBe(
      '/api/v1/health-check/position?id=strategy-1',
    )
  })

  it('shows readable preview placeholder', () => {
    expect(debugStrategyPathPreview('')).toBe(
      '/api/v1/health-check/position?id=:strategyId',
    )
  })

  it('builds full Lambda URL for copy/paste', () => {
    expect(debugStrategyFullUrl('strategy-1')).toBe(
      `${DEFAULT_API_PROXY_TARGET}/api/v1/health-check/position?id=strategy-1`,
    )
  })

  it('builds aptdemo v3 reference URL when session is provided', () => {
    expect(debugStrategyV3FullUrl('strategy-1', 'session-2')).toBe(
      'https://api.aptdemo.atoms.trade/v3/strategies/strategy-1/session-2',
    )
  })

  it('summarizes position lookup result', () => {
    const summary = summarizeDebugResult({
      ok: true,
      status: 200,
      body: {
        position_id: 'strategy-1',
        brokers: { tradesmart: {} },
        total: 1,
      },
    })
    expect(summary.hasStrategyData).toBe(true)
    expect(summary.message).toContain('strategy-1')
  })

  it('extracts brokers from response', () => {
    expect(extractStrategyData({ brokers: { a: 1 } })).toEqual({ a: 1 })
  })

  it('detects api error bodies', () => {
    expect(isApiErrorBody({ detail: 'Not Found' })).toBe(true)
    expect(isApiErrorBody({ position_id: 'x', brokers: {} })).toBe(false)
  })

  it('flattens top-level response fields', () => {
    const rows = flattenTopLevelFields({
      position_id: '1',
      brokers: {},
      total: 3,
    })
    expect(rows).toHaveLength(3)
  })
})
