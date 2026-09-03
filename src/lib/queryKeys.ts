import type { BrokerKey, DateRange } from '../types/dashboard'

export type DashboardFilters = {
  broker: BrokerKey
  startDate: string
  endDate: string
}

export const dashboardKeys = {
  all: ['dashboard'] as const,
  mainActivity: (f: DashboardFilters) =>
    [...dashboardKeys.all, 'main-activity', f] as const,
  users: (f: DashboardFilters) => [...dashboardKeys.all, 'users', f] as const,
  liveTrading: (f: DashboardFilters) =>
    [...dashboardKeys.all, 'live-trading', f] as const,
  paperTrading: (f: DashboardFilters) =>
    [...dashboardKeys.all, 'paper-trading', f] as const,
  strategies: (f: DashboardFilters) =>
    [...dashboardKeys.all, 'strategies', f] as const,
  health: () => [...dashboardKeys.all, 'health'] as const,
}

export function filtersFrom(
  broker: BrokerKey,
  range: DateRange,
): DashboardFilters {
  return { broker, startDate: range.start, endDate: range.end }
}

export const healthKeys = {
  all: ['health-check'] as const,
  ltp: () => [...healthKeys.all, 'ltp-service'] as const,
  indicator: () => [...healthKeys.all, 'indicator-service'] as const,
  position: (id: string) => [...healthKeys.all, 'position', id] as const,
}

export type BrandConfigFilters = {
  token: string
  configType?: string
  brokers?: string
}

export const brandConfigKeys = {
  all: ['brand-config'] as const,
  current: (f: BrandConfigFilters) =>
    [...brandConfigKeys.all, 'current', f] as const,
  allConfigs: (f: BrandConfigFilters) =>
    [...brandConfigKeys.all, 'all-configs', f] as const,
}

export const healthV3Keys = {
  all: ['health-check-v3'] as const,
  positionService: () => [...healthV3Keys.all, 'position-service'] as const,
}

export const debugStrategyKeys = {
  all: ['debug-strategy'] as const,
  aptdemo: ['debug-strategy', 'aptdemo'] as const,
}
