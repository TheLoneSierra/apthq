import { useQuery } from '@tanstack/react-query'
import { fetchHealthCheckV3PositionService, parseHealthV3Response } from '../lib/healthCheckV3'
import { healthV3Keys } from '../lib/queryKeys'

export function useHealthCheckV3Position(enabled: boolean) {
  return useQuery({
    queryKey: healthV3Keys.positionService(),
    queryFn: ({ signal }) => fetchHealthCheckV3PositionService(signal),
    enabled,
    retry: 1,
    staleTime: 60_000,
    select: (data) => parseHealthV3Response(data),
  })
}
