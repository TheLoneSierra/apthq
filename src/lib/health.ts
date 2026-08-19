import type { HealthRow, HealthSummary } from '../types/dashboard'
import type { HealthCheckResponse } from '../types/dashboard'

export function summarizeHealthPayload(
  payload: Record<string, unknown> | null | undefined,
  mode: 'service' | 'position',
): HealthSummary {
  if (!payload || typeof payload !== 'object') {
    return { cls: 'warn', label: 'Unknown', msg: 'No data', detail: 'No payload' }
  }
  if (payload.error) {
    const code =
      payload.status_code != null ? `HTTP ${payload.status_code}` : 'Error'
    const body = payload.body as { message?: string } | undefined
    const bodyMsg = body?.message ? ` • ${body.message}` : ''
    return {
      cls: 'err',
      label: code,
      msg: String(payload.error),
      detail: `${code}${bodyMsg}`,
    }
  }

  const data = payload.data as { status?: string; failures?: unknown[]; position?: Record<string, unknown> } | undefined
  const statusRaw = (data?.status || '').toString().toLowerCase()
  const isOk = payload.success === true || statusRaw === 'ok'
  const cls = isOk ? 'ok' : 'warn'
  const label = isOk ? 'OK' : statusRaw === 'not_ok' ? 'Not OK' : 'Issue'
  const msg = String(payload.message || 'No message')

  if (mode === 'position') {
    const pos = data?.position
    if (pos) {
      return {
        cls,
        label,
        msg,
        detail: `${pos.instrument || '—'} | qty ${pos.quantity ?? '—'} | pnl ${pos.pnl ?? '—'}`,
      }
    }
    return { cls, label, msg, detail: 'Position not found for broker' }
  }

  const failures = Array.isArray(data?.failures) ? data.failures.length : 0
  const detailParts: string[] = []
  if (data?.status) detailParts.push(`status: ${data.status}`)
  if (failures) detailParts.push(`failures: ${failures}`)
  return {
    cls,
    label,
    msg,
    detail: detailParts.join(' • ') || 'Response received',
  }
}

export function parseHealthRows(
  response: HealthCheckResponse | null,
  mode: 'service' | 'position',
): { rows: HealthRow[]; total: number; ok: number; issues: number } {
  const brokers =
    response?.brokers && typeof response.brokers === 'object'
      ? Object.entries(response.brokers)
      : []

  if (!brokers.length) {
    return { rows: [], total: Number(response?.total) || 0, ok: 0, issues: 0 }
  }

  let ok = 0
  let issues = 0
  const rows = brokers.map(([broker, payload]) => {
    const summary = summarizeHealthPayload(
      payload as Record<string, unknown>,
      mode,
    )
    if (summary.cls === 'ok') ok += 1
    else issues += 1
    return { broker, summary, payload }
  })

  return {
    rows,
    total: Number(response?.total) || brokers.length,
    ok,
    issues,
  }
}
