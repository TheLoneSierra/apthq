import { useMutation } from '@tanstack/react-query'
import { fetchDebugStrategy } from '../lib/debugStrategyApi'
import { debugStrategyKeys } from '../lib/queryKeys'
import type { DebugStrategyParams } from '../types/debugStrategy'

export function useDebugStrategyFetch() {
  return useMutation({
    mutationKey: debugStrategyKeys.all,
    mutationFn: ({ strategyId, sessionId }: DebugStrategyParams) =>
      fetchDebugStrategy(strategyId, sessionId),
  })
}
