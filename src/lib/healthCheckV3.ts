import type {
  HealthV3Response,
  HealthV3Row,
  HealthV3Section,
  HealthV3Stats,
} from '../types/healthCheckV3'

export const HEALTH_V3_POSITION_SERVICE_PATH = '/v3/healthCheck/position-service'

export const HEALTH_V3_DEFAULT_ORIGIN = 'https://api.aptdemo.atoms.trade'

/** Client path — proxied in dev/Vercel to api.aptdemo.atoms.trade */
export const HEALTH_V3_API_BASE =
  import.meta.env.VITE_HEALTH_V3_API_BASE?.trim() ?? ''

export function healthV3Url(): string {
  const base = HEALTH_V3_API_BASE.replace(/\/$/, '')
  return base ? `${base}${HEALTH_V3_POSITION_SERVICE_PATH}` : HEALTH_V3_POSITION_SERVICE_PATH
}

export const HEALTH_V3_SECTION_LABELS: Record<string, string> = {
  positions: 'Positions',
  strategies: 'Strategies',
  strategyBaskets: 'Strategy Baskets',
  openPositionTokens: 'Open Position Tokens',
}

function formatSectionLabel(key: string): string {
  return (
    HEALTH_V3_SECTION_LABELS[key] ??
    key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
  )
}

function chipForStatus(status: string): { cls: 'ok' | 'warn' | 'err'; label: string } {
  const normalized = status.toLowerCase()
  if (normalized === 'ok') return { cls: 'ok', label: 'OK' }
  if (normalized === 'not_ok' || normalized === 'not ok') {
    return { cls: 'warn', label: 'NOT OK' }
  }
  return { cls: 'err', label: status.toUpperCase() || 'ISSUE' }
}

export function summarizeSection(section: HealthV3Section): string {
  const parts: string[] = []
  const details = section.details ?? {}

  if (details.dbLength != null) parts.push(`dbLength: ${details.dbLength}`)
  if (details.checkedCount != null) parts.push(`checked: ${details.checkedCount}`)
  if (Array.isArray(details.missingEntityKeys) && details.missingEntityKeys.length) {
    parts.push(`missing keys: ${details.missingEntityKeys.length}`)
  }
  if (Array.isArray(section.errors) && section.errors.length) {
    parts.push(`errors: ${section.errors.length}`)
  }
  if (typeof details.redisKey === 'string') parts.push(`redis: ${details.redisKey}`)
  if (typeof details.tradingDay === 'string') parts.push(`day: ${details.tradingDay}`)

  return parts.join(' • ') || 'Response received'
}

export function parseHealthV3Response(response: HealthV3Response): HealthV3Stats {
  const sections = response.data?.sections ?? {}
  const entries = Object.entries(sections)

  let ok = 0
  let issues = 0

  const rows: HealthV3Row[] = entries.map(([key, section]) => {
    const chip = chipForStatus(section.status)
    if (chip.cls === 'ok') ok += 1
    else issues += 1

    return {
      section: key,
      label: formatSectionLabel(key),
      status: section.status,
      message: section.message,
      detail: summarizeSection(section),
      chipCls: chip.cls,
      chipLabel: chip.label,
      payload: section,
    }
  })

  return {
    rows,
    total: rows.length,
    ok,
    issues,
    overallStatus: response.data?.status ?? 'unknown',
    overallMessage: response.data?.message || response.message,
    apiSuccess: response.success,
  }
}

export async function fetchHealthCheckV3PositionService(
  signal?: AbortSignal,
): Promise<HealthV3Response> {
  const res = await fetch(healthV3Url(), { signal })
  if (!res.ok) {
    throw new Error(`Health Check v3 failed (${res.status})`)
  }
  return res.json() as Promise<HealthV3Response>
}
