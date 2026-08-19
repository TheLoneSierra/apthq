/**
 * API route definitions — mirrors apt_hq_dashboard.js
 * Base URL: VITE_API_BASE (empty in dev → Vite proxy) or Lambda URL in production
 */

export const API_ROUTES = {
  health: '/health',

  mainActivity: '/api/v1/main-activity',
  users: '/api/v1/users',
  liveTrading: '/api/v1/live-trading',
  paperTrading: '/api/v1/paper-trading',
  strategies: '/api/v1/strategies',

  healthCheck: {
    ltp: '/api/v1/health-check/ltp-service',
    indicator: '/api/v1/health-check/indicator-service',
    position: '/api/v1/health-check/position',
  },

  /** Brand Config API — requires Authorization header on all routes */
  brandConfig: {
    config: '/v2/aggregate/config',
    allConfigs: '/v2/aggregate/all_configs',
  },
} as const

export type HealthCheckKind = keyof typeof API_ROUTES.healthCheck

export const HEALTH_CHECK_LABELS: Record<HealthCheckKind, string> = {
  ltp: 'LTP Service',
  indicator: 'Indicator Service',
  position: 'Position Lookup',
}

/** Query params shared by all analytics endpoints */
export function analyticsParams(
  broker: string,
  startDate: string,
  endDate: string,
): URLSearchParams {
  const params = new URLSearchParams({ broker })
  if (startDate) params.set('start_date', startDate)
  if (endDate) params.set('end_date', endDate)
  return params
}

export function healthCheckPath(kind: HealthCheckKind): string {
  return API_ROUTES.healthCheck[kind]
}
