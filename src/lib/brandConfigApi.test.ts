import { describe, expect, it } from 'vitest'
import {
  parseAllConfigsJson,
  parseBrandConfigJson,
} from './brandConfigApi'

describe('brandConfigApi parsing', () => {
  it('parses valid config object', () => {
    expect(parseBrandConfigJson('{"colors":{"primary":"#000"}}')).toEqual({
      colors: { primary: '#000' },
    })
  })

  it('rejects empty config object', () => {
    expect(() => parseBrandConfigJson('{}')).toThrow(/at least one key/)
  })

  it('parses all_configs patch body', () => {
    const body = parseAllConfigsJson(
      '{"configs":[{"brokerName":"SMC","config":{"key":"value"}}]}',
    )
    expect(body.configs).toHaveLength(1)
    expect(body.configs[0].brokerName).toBe('SMC')
  })

  it('rejects empty configs array', () => {
    expect(() => parseAllConfigsJson('{"configs":[]}')).toThrow(/non-empty/)
  })
})
