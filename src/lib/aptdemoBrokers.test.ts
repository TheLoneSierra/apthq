import { describe, expect, it } from 'vitest'
import {
  aptdemoBrokersToLabelMap,
  brokerLabelFromEntry,
  extractBrokerSlug,
  resolveHealthV3Brokers,
} from './aptdemoBrokers'

describe('aptdemoBrokers', () => {
  it('extracts slug from config.key when present', () => {
    expect(
      extractBrokerSlug({
        brokerName: 'SMC',
        config: { key: 'smc' },
      }),
    ).toBe('smc')
  })

  it('falls back to brokerName when config.key is missing', () => {
    expect(
      extractBrokerSlug({
        brokerName: 'tradesbull',
        config: {},
      }),
    ).toBe('tradesbull')
  })

  it('prefers displayName for label', () => {
    expect(
      brokerLabelFromEntry('tradesbull', { displayName: 'Trades Bull' }),
    ).toBe('Trades Bull')
  })

  it('falls back to BROKER_NAMES then slug', () => {
    expect(brokerLabelFromEntry('bajaj', {})).toBe('Bajaj Broking')
    expect(brokerLabelFromEntry('unknown_broker', {})).toBe('unknown_broker')
  })

  it('builds label map from aptdemo entries', () => {
    expect(
      aptdemoBrokersToLabelMap([
        { slug: 'navia', label: 'Navia' },
        { slug: 'tradesbull', label: 'Trades Bull' },
      ]),
    ).toEqual({
      navia: 'Navia',
      tradesbull: 'Trades Bull',
    })
  })

  it('returns all known brokers for all-brokers fan-out', () => {
    expect(
      resolveHealthV3Brokers('all', ['all', 'bajaj', 'smc'], ['navia']),
    ).toEqual([
      'bajaj',
      'smc',
      'tradesmart',
      'navia',
      'tradesbull',
      'moneysukh',
    ])
  })

  it('returns single broker for non-all selection', () => {
    expect(resolveHealthV3Brokers('navia')).toEqual(['navia'])
  })
})
