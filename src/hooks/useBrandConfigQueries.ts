import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAllBrandConfigs,
  fetchCurrentBrandConfig,
  patchAllBrandConfigs,
  patchCurrentBrandConfig,
} from '../lib/brandConfigApi'
import { brandConfigKeys, type BrandConfigFilters } from '../lib/queryKeys'
import type { BrandConfigObject, PatchAllConfigsBody } from '../types/brandConfig'

export function useCurrentBrandConfig(
  filters: BrandConfigFilters,
  enabled: boolean,
) {
  return useQuery({
    queryKey: brandConfigKeys.current(filters),
    queryFn: ({ signal }) =>
      fetchCurrentBrandConfig(filters.token, filters.configType, signal),
    enabled: enabled && Boolean(filters.token),
    retry: 1,
    staleTime: 60_000,
  })
}

export function useAllBrandConfigs(
  filters: BrandConfigFilters,
  enabled: boolean,
) {
  return useQuery({
    queryKey: brandConfigKeys.allConfigs(filters),
    queryFn: ({ signal }) =>
      fetchAllBrandConfigs(
        filters.token,
        filters.brokers,
        filters.configType,
        signal,
      ),
    enabled: enabled && Boolean(filters.token),
    retry: 1,
    staleTime: 60_000,
  })
}

export function usePatchCurrentBrandConfig(filters: BrandConfigFilters) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: BrandConfigObject) =>
      patchCurrentBrandConfig(filters.token, config),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: brandConfigKeys.current(filters),
      })
      void queryClient.invalidateQueries({
        queryKey: brandConfigKeys.allConfigs(filters),
      })
    },
  })
}

export function usePatchAllBrandConfigs(filters: BrandConfigFilters) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PatchAllConfigsBody) =>
      patchAllBrandConfigs(filters.token, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: brandConfigKeys.allConfigs(filters),
      })
      void queryClient.invalidateQueries({
        queryKey: brandConfigKeys.current(filters),
      })
    },
  })
}
