import { useMutation } from '@tanstack/react-query'
import { fetchDebugStrategy, fetchDebugStrategyAptdemo } from '../lib/debugStrategyApi'
import { debugStrategyKeys } from '../lib/queryKeys'
import type { DebugStrategyParams } from '../types/debugStrategy'

export function useDebugStrategyFetch() {
  return useMutation({
    mutationKey: debugStrategyKeys.all,
    mutationFn: ({ strategyId, sessionId }: DebugStrategyParams) =>
      fetchDebugStrategy(strategyId, sessionId),
  })
}

export function useDebugStrategyAptdemoFetch() {
  return useMutation({
    mutationKey: debugStrategyKeys.aptdemo,
    mutationFn: ({ strategyId, sessionId }: DebugStrategyParams) =>
      fetchDebugStrategyAptdemo(strategyId, sessionId),
  })
}
