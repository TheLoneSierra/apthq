import type { BrokerKey } from '../types/dashboard'
import type { BrokerBrandConfig } from '../types/brandConfig'
import { fetchAllBrandConfigs, getBrandConfigToken } from './brandConfigApi'
import { BROKER_NAMES } from './constants'

/** All aptdemo brokers for Health Check v3 fan-out — no auth required for /v3/healthCheck. */
export const HEALTH_V3_ALL_BROKERS: BrokerKey[] = [
  'bajaj',
  'smc',
  'tradesmart',
  'navia',
  'tradesbull',
  'moneysukh',
]

/** @deprecated use HEALTH_V3_ALL_BROKERS */
export const DEFAULT_HEALTH_V3_BROKERS = HEALTH_V3_ALL_BROKERS

export interface AptdemoBrokerEntry {
  slug: BrokerKey
  label: string
}

export function extractBrokerSlug(entry: BrokerBrandConfig): BrokerKey {
  const fromConfig = entry.config?.key
  if (typeof fromConfig === 'string' && fromConfig.trim()) {
    return fromConfig.trim().toLowerCase()
  }
  return entry.brokerName.trim().toLowerCase()
}

export function brokerLabelFromEntry(
  slug: BrokerKey,
  config?: Record<string, unknown>,
): string {
  for (const field of ['displayName', 'name', 'brokerDisplayName', 'title'] as const) {
    const value = config?.[field]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return BROKER_NAMES[slug] || slug
}

export function aptdemoBrokersToLabelMap(
  brokers: AptdemoBrokerEntry[],
): Record<string, string> {
  return Object.fromEntries(brokers.map((b) => [b.slug, b.label]))
}

/** Fetch broker slugs from aptdemo GET /v2/aggregate/all_configs (requires Brand Config token). */
export async function fetchAptdemoBrokers(
  signal?: AbortSignal,
): Promise<AptdemoBrokerEntry[]> {
  const token = getBrandConfigToken()
  if (!token) return []

  try {
    const configs = await fetchAllBrandConfigs(token, undefined, undefined, signal)
    const seen = new Set<string>()
    const result: AptdemoBrokerEntry[] = []

    for (const entry of configs) {
      const slug = extractBrokerSlug(entry)
      if (!slug || seen.has(slug)) continue
      seen.add(slug)
      result.push({
        slug,
        label: brokerLabelFromEntry(slug, entry.config),
      })
    }

    return result
  } catch {
    return []
  }
}

export function resolveHealthV3Brokers(
  broker: BrokerKey,
  _availableBrokers: BrokerKey[] = [],
  _aptdemoSlugs: BrokerKey[] = [],
): BrokerKey[] {
  if (broker !== 'all') return [broker]
  return HEALTH_V3_ALL_BROKERS
}
