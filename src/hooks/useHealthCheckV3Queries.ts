import { useQuery } from '@tanstack/react-query'
import type { BrokerKey } from '../types/dashboard'
import { resolveHealthV3Brokers } from '../lib/aptdemoBrokers'
import {
  fetchHealthCheckV3AtUrl,
  fetchHealthCheckV3PositionService,
} from '../lib/healthCheckV3'
import { healthV3Keys } from '../lib/queryKeys'

export function useHealthCheckV3Position(
  enabled: boolean,
  broker: BrokerKey,
  fetchUrl?: string,
) {
  const brokerScope = resolveHealthV3Brokers(broker).join(',')

  return useQuery({
    queryKey: healthV3Keys.positionService(broker, brokerScope, fetchUrl ?? ''),
    queryFn: ({ signal }) => {
      const trimmedUrl = fetchUrl?.trim()
      if (trimmedUrl && broker !== 'all') {
        return fetchHealthCheckV3AtUrl(trimmedUrl, broker, signal)
      }
      return fetchHealthCheckV3PositionService(broker, [], signal)
    },
    enabled,
    retry: 1,
    staleTime: 60_000,
  })
}
