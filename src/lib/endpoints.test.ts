import { describe, expect, it } from 'vitest'
import {
  API_ROUTES,
  analyticsParams,
  healthCheckPath,
  HEALTH_CHECK_LABELS,
} from './endpoints'

describe('endpoints', () => {
  it('defines all analytics routes from original dashboard', () => {
    expect(API_ROUTES.mainActivity).toBe('/api/v1/main-activity')
    expect(API_ROUTES.users).toBe('/api/v1/users')
    expect(API_ROUTES.liveTrading).toBe('/api/v1/live-trading')
    expect(API_ROUTES.paperTrading).toBe('/api/v1/paper-trading')
    expect(API_ROUTES.strategies).toBe('/api/v1/strategies')
    expect(API_ROUTES.health).toBe('/health')
  })

  it('defines health-check routes', () => {
    expect(healthCheckPath('ltp')).toBe('/api/v1/health-check/ltp-service')
    expect(healthCheckPath('indicator')).toBe('/api/v1/health-check/indicator-service')
    expect(healthCheckPath('position')).toBe('/api/v1/health-check/position')
    expect(HEALTH_CHECK_LABELS.ltp).toBe('LTP Service')
  })

  it('defines brand config routes', () => {
    expect(API_ROUTES.brandConfig.config).toBe('/v2/aggregate/config')
    expect(API_ROUTES.brandConfig.allConfigs).toBe('/v2/aggregate/all_configs')
  })

  it('builds analytics query params', () => {
    const params = analyticsParams('all', '2026-01-01', '2026-01-31')
    expect(params.get('broker')).toBe('all')
    expect(params.get('start_date')).toBe('2026-01-01')
    expect(params.get('end_date')).toBe('2026-01-31')
  })
})
