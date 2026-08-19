import type { StrategyOrders } from '../types/dashboard'

export function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function fmt(n: unknown): string {
  if (n == null || Number.isNaN(Number(n))) return '—'
  const v = Number(n)
  if (Number.isInteger(v)) return v.toLocaleString()
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function fmtTurnover(n: unknown): string {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 4 })
}

export function normalizeStrategyOrders(value: number | StrategyOrders | null | undefined) {
  if (value == null) {
    return {
      display: '—',
      summary: null as string | null,
      metrics: { active: null, all: null, executed: null, failed: null },
    }
  }
  if (typeof value === 'number') {
    return {
      display: fmt(value),
      summary: null,
      metrics: { active: value, all: null, executed: null, failed: null },
    }
  }

  const active = value.active ?? value.all ?? value.executed ?? value.failed ?? 0
  const summaryParts: string[] = []
  if (value.all != null) summaryParts.push(`all ${fmt(value.all)}`)
  if (value.executed != null) summaryParts.push(`executed ${fmt(value.executed)}`)
  if (value.failed != null) summaryParts.push(`failed ${fmt(value.failed)}`)

  return {
    display: fmt(active),
    summary: summaryParts.length ? summaryParts.join(' • ') : null,
    metrics: {
      active,
      all: value.all ?? null,
      executed: value.executed ?? null,
      failed: value.failed ?? null,
    },
  }
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
