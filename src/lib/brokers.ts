import { BROKER_NAMES } from './constants'
import type { BrokerKey, HealthData } from '../types/dashboard'

export function syncBrokersFromHealth(
  health: HealthData | null | undefined,
  current: BrokerKey,
): { options: { value: BrokerKey; label: string }[]; broker: BrokerKey } {
  const options: { value: BrokerKey; label: string }[] = [
    { value: 'all', label: BROKER_NAMES.all },
  ]

  if (health?.brokers) {
    Object.entries(health.brokers).forEach(([key, status]) => {
      if (typeof status !== 'string') return
      const normalized = status.trim().toLowerCase()
      if (normalized !== 'ok' && normalized !== 'healthy') return
      options.push({ value: key, label: BROKER_NAMES[key] || key })
    })
  }

  const allowed = new Set(options.map((o) => o.value))
  const broker = allowed.has(current) ? current : 'all'
  return { options, broker }
}
