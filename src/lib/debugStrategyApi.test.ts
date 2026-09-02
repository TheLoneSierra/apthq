import { describe, expect, it } from 'vitest'
import {
  debugStrategyFullUrl,
  debugStrategyPath,
  extractStrategyData,
  flattenTopLevelFields,
  isApiErrorBody,
  summarizeDebugResult,
} from './debugStrategyApi'

describe('debugStrategyApi', () => {
  it('builds strategy debug path', () => {
    expect(
      debugStrategyPath('strategy-1', 'session-2'),
    ).toBe('/v3/strategies/strategy-1/session-2')
  })

  it('builds full strategy debug URL for copy/paste', () => {
    expect(
      debugStrategyFullUrl('strategy-1', 'session-2'),
    ).toBe('https://api.aptdemo.atoms.trade/v3/strategies/strategy-1/session-2')
  })

  it('flattens top-level response fields', () => {
    const rows = flattenTopLevelFields({
      success: true,
      message: 'ok',
      data: { id: '1' },
    })
    expect(rows).toHaveLength(3)
    expect(rows[2].isJson).toBe(true)
  })

  it('summarizes debug result', () => {
    const summary = summarizeDebugResult({
      ok: false,
      status: 404,
      body: { message: 'Strategy not found', requestId: 'req-1' },
    })
    expect(summary.message).toBe('Strategy not found')
    expect(summary.requestId).toBe('req-1')
    expect(summary.hasStrategyData).toBe(false)
  })

  it('detects strategy data in success body', () => {
    const summary = summarizeDebugResult({
      ok: true,
      status: 200,
      body: { success: true, data: { id: '1' } },
    })
    expect(summary.hasStrategyData).toBe(true)
  })

  it('extracts nested strategy data', () => {
    expect(extractStrategyData({ data: { id: '1' } })).toEqual({ id: '1' })
    expect(extractStrategyData({ message: 'missing' })).toBeNull()
  })

  it('detects api error bodies', () => {
    expect(isApiErrorBody({ error: true, message: 'Strategy not found' })).toBe(true)
    expect(isApiErrorBody({ success: true, data: {} })).toBe(false)
  })
})
