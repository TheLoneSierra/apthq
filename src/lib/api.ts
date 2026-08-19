import { API_BASE } from './constants'
import {
  API_ROUTES,
  analyticsParams,
  healthCheckPath,
  type HealthCheckKind,
} from './endpoints'
import type {
  DashboardData,
  HealthCheckResponse,
  HealthData,
  LiveTradingData,
  MainActivity,
  PaperTradingData,
  StrategiesData,
  UsersData,
} from '../types/dashboard'

async function apiGet<T>(
  path: string,
  params: URLSearchParams,
  signal?: AbortSignal,
): Promise<T> {
  const qs = params.toString()
  const url = qs ? `${API_BASE}${path}?${qs}` : `${API_BASE}${path}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`${path} failed (${res.status})`)
  return res.json() as Promise<T>
}

async function apiGetPath<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { signal })
  if (!res.ok) throw new Error(`${path} failed (${res.status})`)
  return res.json() as Promise<T>
}

// ── Analytics (broker + date range) ──

export async function fetchMainActivity(
  broker: string,
  startDate: string,
  endDate: string,
  signal?: AbortSignal,
): Promise<MainActivity> {
  return apiGet<MainActivity>(
    API_ROUTES.mainActivity,
    analyticsParams(broker, startDate, endDate),
    signal,
  )
}

export async function fetchUsers(
  broker: string,
  startDate: string,
  endDate: string,
  signal?: AbortSignal,
): Promise<UsersData> {
  return apiGet<UsersData>(
    API_ROUTES.users,
    analyticsParams(broker, startDate, endDate),
    signal,
  )
}

export async function fetchLiveTrading(
  broker: string,
  startDate: string,
  endDate: string,
  signal?: AbortSignal,
): Promise<LiveTradingData> {
  return apiGet<LiveTradingData>(
    API_ROUTES.liveTrading,
    analyticsParams(broker, startDate, endDate),
    signal,
  )
}

export async function fetchPaperTrading(
  broker: string,
  startDate: string,
  endDate: string,
  signal?: AbortSignal,
): Promise<PaperTradingData> {
  return apiGet<PaperTradingData>(
    API_ROUTES.paperTrading,
    analyticsParams(broker, startDate, endDate),
    signal,
  )
}

export async function fetchStrategies(
  broker: string,
  startDate: string,
  endDate: string,
  signal?: AbortSignal,
): Promise<StrategiesData> {
  return apiGet<StrategiesData>(
    API_ROUTES.strategies,
    analyticsParams(broker, startDate, endDate),
    signal,
  )
}

// ── Health (broker list for dropdown) ──

export async function fetchHealth(signal?: AbortSignal): Promise<HealthData | null> {
  const res = await fetch(`${API_BASE}${API_ROUTES.health}`, { signal })
  return res.ok ? (res.json() as Promise<HealthData>) : null
}

// ── Health Check API ──

export async function fetchHealthCheckLtp(
  signal?: AbortSignal,
): Promise<HealthCheckResponse> {
  return apiGetPath<HealthCheckResponse>(API_ROUTES.healthCheck.ltp, signal)
}

export async function fetchHealthCheckIndicator(
  signal?: AbortSignal,
): Promise<HealthCheckResponse> {
  return apiGetPath<HealthCheckResponse>(API_ROUTES.healthCheck.indicator, signal)
}

export async function fetchHealthCheckPosition(
  positionId: string,
  signal?: AbortSignal,
): Promise<HealthCheckResponse> {
  return apiGet<HealthCheckResponse>(
    API_ROUTES.healthCheck.position,
    new URLSearchParams({ id: positionId }),
    signal,
  )
}

export async function fetchHealthCheckByKind(
  kind: Exclude<HealthCheckKind, 'position'>,
  signal?: AbortSignal,
): Promise<HealthCheckResponse> {
  return apiGetPath<HealthCheckResponse>(healthCheckPath(kind), signal)
}

/** @deprecated Use individual fetchers + TanStack Query */
export async function fetchDashboardData(
  broker: string,
  startDate: string,
  endDate: string,
): Promise<DashboardData> {
  const [mainActivity, users, liveTrading, paperTrading, strategies, healthRes] =
    await Promise.allSettled([
      fetchMainActivity(broker, startDate, endDate),
      fetchUsers(broker, startDate, endDate),
      fetchLiveTrading(broker, startDate, endDate),
      fetchPaperTrading(broker, startDate, endDate),
      fetchStrategies(broker, startDate, endDate),
      fetchHealth(),
    ])

  const pick = <T,>(r: PromiseSettledResult<T>) =>
    r.status === 'fulfilled' ? r.value : null

  return {
    mainActivity: pick(mainActivity),
    users: pick(users),
    liveTrading: pick(liveTrading),
    paperTrading: pick(paperTrading),
    strategies: pick(strategies),
    health: pick(healthRes),
    errors: [mainActivity, users, liveTrading, paperTrading, strategies]
      .filter((r) => r.status === 'rejected')
      .map((r) =>
        r.status === 'rejected'
          ? r.reason?.message || 'Request failed'
          : 'Request failed',
      ),
  }
}

/** @deprecated Use fetchHealthCheckByKind or specific fetchers */
export async function runHealthCheckApi(
  path: string,
  signal?: AbortSignal,
): Promise<HealthCheckResponse> {
  return apiGetPath<HealthCheckResponse>(`/api/v1/health-check/${path}`, signal)
}

/** @deprecated Use fetchHealthCheckPosition */
export async function runHealthPositionApi(
  positionId: string,
  signal?: AbortSignal,
): Promise<HealthCheckResponse> {
  return fetchHealthCheckPosition(positionId, signal)
}
