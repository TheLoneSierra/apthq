import { useMutation, useQuery } from '@tanstack/react-query'
import {
  fetchHealthCheckIndicator,
  fetchHealthCheckLtp,
  fetchHealthCheckPosition,
} from '../lib/api'
import { parseHealthRows } from '../lib/health'
import { healthKeys } from '../lib/queryKeys'

export function useHealthCheckLtp(enabled: boolean) {
  return useQuery({
    queryKey: healthKeys.ltp(),
    queryFn: ({ signal }) => fetchHealthCheckLtp(signal),
    enabled,
    retry: 1,
    staleTime: 60_000,
    select: (data) => parseHealthRows(data, 'service'),
  })
}

export function useHealthCheckIndicator(enabled: boolean) {
  return useQuery({
    queryKey: healthKeys.indicator(),
    queryFn: ({ signal }) => fetchHealthCheckIndicator(signal),
    enabled,
    retry: 1,
    staleTime: 60_000,
    select: (data) => parseHealthRows(data, 'service'),
  })
}

export function useHealthCheckPosition() {
  return useMutation({
    mutationFn: (positionId: string) => fetchHealthCheckPosition(positionId),
  })
}
