import { useMutation } from '@tanstack/react-query'
import {
  fetchOrphanDiagnosis,
  fetchWebhookSignals,
} from '../lib/hqOpsApi'
import type {
  OrphanDiagnosisQuery,
  WebhookSignalsQuery,
} from '../types/hqOps'

export function useWebhookSignalsSearch() {
  return useMutation({
    mutationFn: (query: WebhookSignalsQuery) => fetchWebhookSignals(query),
  })
}

export function useOrphanDiagnosis() {
  return useMutation({
    mutationFn: (query: OrphanDiagnosisQuery) => fetchOrphanDiagnosis(query),
  })
}
