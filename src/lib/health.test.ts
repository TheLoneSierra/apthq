import { describe, expect, it } from 'vitest'
import { parseHealthRows, summarizeHealthPayload } from './health'

describe('summarizeHealthPayload', () => {
  it('marks success responses as ok', () => {
    const summary = summarizeHealthPayload(
      { success: true, message: 'Healthy', data: { status: 'ok' } },
      'service',
    )
    expect(summary.cls).toBe('ok')
    expect(summary.label).toBe('OK')
  })

  it('handles error payloads', () => {
    const summary = summarizeHealthPayload(
      { error: 'Timeout', status_code: 504 },
      'service',
    )
    expect(summary.cls).toBe('err')
  })
})

describe('parseHealthRows', () => {
  it('parses broker map into rows', () => {
    const result = parseHealthRows(
      {
        total: 2,
        brokers: {
          a: { success: true, message: 'ok', data: { status: 'ok' } },
          b: { error: 'down' },
        },
      },
      'service',
    )
    expect(result.rows).toHaveLength(2)
    expect(result.ok).toBe(1)
    expect(result.issues).toBe(1)
  })
})
