import type {
  BrokerErrorPayload,
  FlatWebhookSignalRow,
  OrderPlacementBrokerPayload,
  OrderPlacementCard,
  OrderPlacementHealthResponse,
  OrphanDiagnosisBrokerPayload,
  OrphanDiagnosisResponse,
  WebhookSignalsBrokerPayload,
  WebhookSignalsResponse,
} from '../types/hqOps'

export function isBrokerError(
  payload: unknown,
): payload is BrokerErrorPayload {
  return Boolean(
    payload &&
      typeof payload === 'object' &&
      'error' in payload &&
      (payload as BrokerErrorPayload).error != null &&
      String((payload as BrokerErrorPayload).error).length > 0,
  )
}

export function brokerErrorDetail(payload: BrokerErrorPayload): string {
  const body = payload.body
  const detail =
    body && typeof body === 'object'
      ? body.detail || body.message
      : undefined
  const code =
    payload.status_code != null ? `HTTP ${payload.status_code}` : null
  const parts = [code, detail ? String(detail) : null, String(payload.error)]
  return parts.filter(Boolean).join(' · ')
}

/** Convert ISO-8601 UTC (or parseable) timestamps to IST display string. */
export function formatUtcToIst(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

/** Format New Relic ms epoch to IST. */
export function formatNrTimestamp(ms: number | undefined): string {
  if (ms == null || Number.isNaN(ms)) return '—'
  return formatUtcToIst(new Date(ms).toISOString())
}

/**
 * Build naive IST datetime for HQ query params from date + time inputs.
 * Date-only values are accepted; time defaults to start/end of day helpers.
 */
export function toNaiveIstDatetime(date: string, time: string): string {
  const d = date.trim()
  const t = time.trim() || '00:00'
  if (!d) return ''
  const normalizedTime = t.length === 5 ? `${t}:00` : t
  return `${d}T${normalizedTime}`
}

export function signalStatusChipClass(status: string | undefined): string {
  const s = (status || '').toUpperCase()
  if (s === 'EXECUTED') return 'ok'
  if (s === 'TRIGGERED') return 'warn'
  if (s === 'FAILED' || s === 'ERROR') return 'err'
  return ''
}

export function parseOrderPlacementCards(
  response: OrderPlacementHealthResponse | null | undefined,
): { cards: OrderPlacementCard[]; total: number; ok: number; issues: number; unreachable: number } {
  const brokers =
    response?.brokers && typeof response.brokers === 'object'
      ? Object.entries(response.brokers)
      : []

  let ok = 0
  let issues = 0
  let unreachable = 0

  const cards: OrderPlacementCard[] = brokers.map(([broker, payload]) => {
    const p = (payload || {}) as OrderPlacementBrokerPayload

    if (isBrokerError(p)) {
      unreachable += 1
      return {
        broker,
        uiStatus: 'unreachable' as const,
        message: brokerErrorDetail(p),
        failures: [],
        probes: { cash: null, fut: null, opt: null },
        payload: p,
      }
    }

    const data = p.data
    const statusOk =
      p.success === true && (data?.status || '').toLowerCase() === 'ok'
    const failures = Array.isArray(data?.failures)
      ? data.failures.map(String)
      : []
    const probes = data?.tokenIndexProbes

    if (statusOk) ok += 1
    else issues += 1

    return {
      broker,
      uiStatus: statusOk ? ('ok' as const) : ('not_ok' as const),
      message: String(p.message || data?.message || '—'),
      failures,
      probes: {
        cash: probes?.cash ?? null,
        fut: probes?.fut ?? null,
        opt: probes?.opt ?? null,
      },
      payload: p,
    }
  })

  return {
    cards,
    total: Number(response?.total) || cards.length,
    ok,
    issues,
    unreachable,
  }
}

export function flattenWebhookSignals(
  response: WebhookSignalsResponse | null | undefined,
): {
  rows: FlatWebhookSignalRow[]
  total: number
  brokerCount: number
  newRelicNotice: string | null
} {
  const brokers =
    response?.brokers && typeof response.brokers === 'object'
      ? Object.entries(response.brokers)
      : []

  const rows: FlatWebhookSignalRow[] = []
  let newRelicNotice: string | null = null

  for (const [broker, payload] of brokers) {
    const p = (payload || {}) as WebhookSignalsBrokerPayload
    if (isBrokerError(p)) continue

    const nr = p.new_relic
    if (nr && nr.attached === false && nr.reason && !newRelicNotice) {
      newRelicNotice = nr.reason
    }

    for (const signal of p.signals || []) {
      rows.push({ broker, signal, newRelic: nr ?? null })
    }
  }

  rows.sort((a, b) => {
    const ta = a.signal.created_at || a.signal.received_at || ''
    const tb = b.signal.created_at || b.signal.received_at || ''
    return tb.localeCompare(ta)
  })

  return {
    rows,
    total: Number(response?.total) || rows.length,
    brokerCount: Number(response?.broker_count) || brokers.length,
    newRelicNotice,
  }
}

export function successfulOrphanBrokers(
  response: OrphanDiagnosisResponse | null | undefined,
): { broker: string; payload: OrphanDiagnosisBrokerPayload }[] {
  const brokers =
    response?.brokers && typeof response.brokers === 'object'
      ? Object.entries(response.brokers)
      : []

  return brokers
    .filter(([, payload]) => !isBrokerError(payload))
    .map(([broker, payload]) => ({
      broker,
      payload: payload as OrphanDiagnosisBrokerPayload,
    }))
}

export function orphanBrokerErrors(
  response: OrphanDiagnosisResponse | null | undefined,
): { broker: string; detail: string }[] {
  const brokers =
    response?.brokers && typeof response.brokers === 'object'
      ? Object.entries(response.brokers)
      : []

  return brokers
    .filter(([, payload]) => isBrokerError(payload))
    .map(([broker, payload]) => ({
      broker,
      detail: brokerErrorDetail(payload as BrokerErrorPayload),
    }))
}

export function reasonLabel(reason: string): string {
  return reason.replaceAll('_', ' ')
}
