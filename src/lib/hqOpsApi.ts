import { API_BASE } from './constants'
import { API_ROUTES } from './endpoints'
import type {
  OrphanDiagnosisQuery,
  OrphanDiagnosisResponse,
  OrderPlacementHealthResponse,
  WebhookSignalsQuery,
  WebhookSignalsResponse,
} from '../types/hqOps'

function formatApiError(path: string, status: number, body: unknown): string {
  if (body && typeof body === 'object') {
    const detail = (body as { detail?: unknown }).detail
    if (typeof detail === 'string' && detail.trim()) return detail
    if (Array.isArray(detail)) {
      const parts = detail
        .map((item) => {
          if (typeof item === 'string') return item
          if (item && typeof item === 'object' && 'msg' in item) {
            return String((item as { msg: unknown }).msg)
          }
          return null
        })
        .filter(Boolean)
      if (parts.length) return parts.join('; ')
    }
  }
  return `${path} failed (${status})`
}

async function apiGetJson<T>(
  path: string,
  params?: URLSearchParams,
  signal?: AbortSignal,
): Promise<T> {
  const qs = params?.toString()
  const url = qs ? `${API_BASE}${path}?${qs}` : `${API_BASE}${path}`
  const res = await fetch(url, { signal })
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    body = null
  }
  if (!res.ok) {
    throw new Error(formatApiError(path, res.status, body))
  }
  return body as T
}

export async function fetchOrderPlacementHealth(
  signal?: AbortSignal,
): Promise<OrderPlacementHealthResponse> {
  return apiGetJson<OrderPlacementHealthResponse>(
    API_ROUTES.healthCheck.orderPlacement,
    undefined,
    signal,
  )
}

export async function fetchWebhookSignals(
  query: WebhookSignalsQuery,
  signal?: AbortSignal,
): Promise<WebhookSignalsResponse> {
  const params = new URLSearchParams({
    message: query.message,
    start_datetime: query.startDatetime,
    end_datetime: query.endDatetime,
    include_logs: String(query.includeLogs),
  })
  return apiGetJson<WebhookSignalsResponse>(
    API_ROUTES.webhookSignals,
    params,
    signal,
  )
}

export async function fetchOrphanDiagnosis(
  query: OrphanDiagnosisQuery,
  signal?: AbortSignal,
): Promise<OrphanDiagnosisResponse> {
  const params = new URLSearchParams({
    strategy_id: query.strategyId,
    include_logs: String(query.includeLogs),
  })
  return apiGetJson<OrphanDiagnosisResponse>(
    API_ROUTES.orphanDiagnosis,
    params,
    signal,
  )
}
