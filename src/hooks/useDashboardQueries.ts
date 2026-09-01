import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import {
  fetchHealth,
  fetchLiveTrading,
  fetchMainActivity,
  fetchPaperTrading,
  fetchStrategies,
  fetchUsers,
} from '../lib/api'
import { dashboardKeys, filtersFrom } from '../lib/queryKeys'
import type {
  BrokerKey,
  DateRange,
  HealthData,
  LiveTradingData,
  MainActivity,
  PaperTradingData,
  StrategiesData,
  UsersData,
} from '../types/dashboard'
import type { SectionSlice } from '../types/section'

function toSection<T>(query: UseQueryResult<T, Error>): SectionSlice<T> {
  return {
    data: query.data ?? null,
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: () => {
      void query.refetch()
    },
  }
}

export function useDashboardQueries(
  broker: BrokerKey,
  dateRange: DateRange,
  options: {
    analyticsEnabled?: boolean
    healthEnabled?: boolean
  } = {},
) {
  const analyticsEnabled = options.analyticsEnabled ?? true
  const healthEnabled = options.healthEnabled ?? true
  const filters = filtersFrom(broker, dateRange)

  const mainActivityQuery = useQuery({
    queryKey: dashboardKeys.mainActivity(filters),
    queryFn: ({ signal }) =>
      fetchMainActivity(filters.broker, filters.startDate, filters.endDate, signal),
    enabled: analyticsEnabled,
    refetchInterval: analyticsEnabled ? 30_000 : false,
    retry: 1,
    staleTime: 60_000,
  })

  const usersQuery = useQuery({
    queryKey: dashboardKeys.users(filters),
    queryFn: ({ signal }) =>
      fetchUsers(filters.broker, filters.startDate, filters.endDate, signal),
    enabled: analyticsEnabled,
    retry: 1,
    staleTime: 60_000,
  })

  const liveTradingQuery = useQuery({
    queryKey: dashboardKeys.liveTrading(filters),
    queryFn: ({ signal }) =>
      fetchLiveTrading(filters.broker, filters.startDate, filters.endDate, signal),
    enabled: analyticsEnabled,
    retry: 1,
    staleTime: 60_000,
  })

  const paperTradingQuery = useQuery({
    queryKey: dashboardKeys.paperTrading(filters),
    queryFn: ({ signal }) =>
      fetchPaperTrading(filters.broker, filters.startDate, filters.endDate, signal),
    enabled: analyticsEnabled,
    retry: 1,
    staleTime: 60_000,
  })

  const strategiesQuery = useQuery({
    queryKey: dashboardKeys.strategies(filters),
    queryFn: ({ signal }) =>
      fetchStrategies(filters.broker, filters.startDate, filters.endDate, signal),
    enabled: analyticsEnabled,
    retry: 1,
    staleTime: 60_000,
  })

  const healthQuery = useQuery({
    queryKey: dashboardKeys.health(),
    queryFn: ({ signal }) => fetchHealth(signal),
    enabled: healthEnabled,
    staleTime: 300_000,
    retry: 1,
  })

  const sections = {
    mainActivity: toSection<MainActivity>(mainActivityQuery),
    users: toSection<UsersData>(usersQuery),
    liveTrading: toSection<LiveTradingData>(liveTradingQuery),
    paperTrading: toSection<PaperTradingData>(paperTradingQuery),
    strategies: toSection<StrategiesData>(strategiesQuery),
    health: toSection<HealthData | null>(healthQuery),
  }

  const loading = Object.values(sections).some(
    (s) => s.loading && s.data === null,
  )

  const partialErrors = [
    sections.users.error,
    sections.liveTrading.error,
    sections.paperTrading.error,
    sections.strategies.error,
  ].filter(Boolean)

  const allFailed =
    sections.mainActivity.error &&
    sections.users.error &&
    sections.liveTrading.error &&
    sections.paperTrading.error &&
    sections.strategies.error

  const reload = () => {
    void mainActivityQuery.refetch()
    void usersQuery.refetch()
    void liveTradingQuery.refetch()
    void paperTradingQuery.refetch()
    void strategiesQuery.refetch()
    void healthQuery.refetch()
  }

  return {
    sections,
    loading,
    partialErrors,
    allFailed: Boolean(allFailed),
    apiError: allFailed ? sections.mainActivity.error || 'Dashboard unavailable' : null,
    reload,
  }
}
