import type { DebugStrategyFieldRow, DebugStrategyResult } from '../types/debugStrategy'

export const DEBUG_STRATEGY_DEFAULT_STRATEGY_ID = ''
export const DEBUG_STRATEGY_DEFAULT_SESSION_ID = ''

/** Same-origin /v3 path — proxied to api.aptdemo.atoms.trade in dev/Vercel */
const V3_API_BASE = import.meta.env.VITE_HEALTH_V3_API_BASE?.trim() ?? ''

/** Production origin for copy/paste links (Postman, curl, etc.) */
export const DEBUG_STRATEGY_API_ORIGIN = 'https://api.aptdemo.atoms.trade'

export function debugStrategyPath(strategyId: string, sessionId: string): string {
  const sid = encodeURIComponent(strategyId.trim())
  const sess = encodeURIComponent(sessionId.trim())
  return `/v3/strategies/${sid}/${sess}`
}

export function debugStrategyUrl(strategyId: string, sessionId: string): string {
  const base = V3_API_BASE.replace(/\/$/, '')
  const path = debugStrategyPath(strategyId, sessionId)
  return base ? `${base}${path}` : path
}

/** Full URL for sharing — always uses the Apt demo API host when proxy base is empty. */
export function debugStrategyFullUrl(strategyId: string, sessionId: string): string {
  const base = V3_API_BASE.replace(/\/$/, '') || DEBUG_STRATEGY_API_ORIGIN
  return `${base}${debugStrategyPath(strategyId, sessionId)}`
}

export function formatDebugJson(value: unknown): string {
  return JSON.stringify(value, null, 2)
}

function previewValue(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return `[${value.length} items]`
  if (typeof value === 'object') return `{${Object.keys(value).length} keys}`
  return String(value)
}

export function flattenTopLevelFields(body: unknown): DebugStrategyFieldRow[] {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return []

  return Object.entries(body as Record<string, unknown>).map(([key, value]) => {
    const isJson = value !== null && typeof value === 'object'
    return {
      key,
      value: previewValue(value),
      isJson,
      payload: value,
    }
  })
}

export function summarizeDebugResult(result: DebugStrategyResult | null) {
  if (!result) {
    return { status: '—', message: '—', requestId: '—', hasStrategyData: false }
  }

  const body =
    result.body && typeof result.body === 'object' && !Array.isArray(result.body)
      ? (result.body as Record<string, unknown>)
      : {}

  const hasStrategyData = body.data != null && typeof body.data === 'object'

  return {
    status: result.ok ? 'OK' : `HTTP ${result.status}`,
    message: String(body.message ?? (result.ok ? 'Success' : 'Request failed')),
    requestId: String(body.requestId ?? '—'),
    hasStrategyData,
  }
}

export function extractStrategyData(body: unknown): unknown | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null
  const data = (body as Record<string, unknown>).data
  return data != null ? data : null
}

export function isApiErrorBody(body: unknown): boolean {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false
  const record = body as Record<string, unknown>
  return record.error === true || record.success === false
}

export async function fetchDebugStrategy(
  strategyId: string,
  sessionId: string,
  signal?: AbortSignal,
): Promise<DebugStrategyResult> {
  const trimmedStrategy = strategyId.trim()
  const trimmedSession = sessionId.trim()

  if (!trimmedStrategy) throw new Error('Strategy ID is required')
  if (!trimmedSession) throw new Error('Session ID is required')

  const res = await fetch(debugStrategyUrl(trimmedStrategy, trimmedSession), { signal })

  let body: unknown
  try {
    body = await res.json()
  } catch {
    body = { message: res.statusText || 'Non-JSON response' }
  }

  return { ok: res.ok, status: res.status, body }
}
