import { useEffect, useState } from 'react'
import { useDashboard } from '../../context/DashboardContext'
import { useHealthCheckV3Position } from '../../hooks/useHealthCheckV3Queries'
import { HEALTH_V3_POSITION_SERVICE_PATH } from '../../lib/healthCheckV3'
import type { HealthV3Row } from '../../types/healthCheckV3'
import { SectionError } from '../ui/SectionState'
import { Badge, MetricCard, SectionHeader } from '../ui/Shared'

function SectionTable({
  rows,
  loading,
  loadingMessage,
  error,
  onRetry,
  expanded,
  onToggle,
}: {
  rows: HealthV3Row[]
  loading: boolean
  loadingMessage: string
  error: string | null
  onRetry?: () => void
  expanded: Record<string, boolean>
  onToggle: (section: string) => void
}) {
  if (loading) {
    return (
      <tr>
        <td colSpan={4} className="text-[var(--text3)]">
          {loadingMessage}
        </td>
      </tr>
    )
  }

  if (error) {
    return (
      <tr>
        <td colSpan={4}>
          <SectionError message={error} onRetry={onRetry || (() => {})} />
        </td>
      </tr>
    )
  }

  if (!rows.length) {
    return (
      <tr>
        <td colSpan={4} className="text-[var(--text3)]">
          No sections returned.
        </td>
      </tr>
    )
  }

  return rows.flatMap((row) => {
    const isOpen = expanded[row.section]
    return [
      <tr
        key={row.section}
        className={`cursor-pointer ${isOpen ? 'expanded' : ''}`}
        onClick={() => onToggle(row.section)}
        aria-expanded={isOpen}
      >
        <td className="font-mono-dm">
          <span
            className="mr-1.5 inline-block text-[10px] text-[var(--text3)] transition-transform duration-150"
            style={{ transform: isOpen ? 'rotate(90deg)' : undefined }}
          >
            ▶
          </span>
          {row.label}
        </td>
        <td>
          <span className={`hc-chip ${row.chipCls}`}>{row.chipLabel}</span>
        </td>
        <td className="text-[var(--text2)]">{row.message}</td>
        <td className="text-[var(--text3)]">{row.detail}</td>
      </tr>,
      isOpen ? (
        <tr key={`${row.section}-detail`}>
          <td colSpan={4} className="!pb-3 !pt-0 bg-[rgba(139,92,246,0.02)]">
            {row.payload.errors?.length ? (
              <div className="mb-2 rounded-lg border border-[var(--amber)]/30 bg-[rgba(245,158,11,0.08)] p-2.5">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--amber)]">
                  Errors
                </div>
                <ul className="m-0 list-disc space-y-1 pl-4 text-[11px] text-[var(--text2)]">
                  {row.payload.errors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <pre className="m-0 max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border2)] bg-[var(--s2)] p-3 font-mono-dm text-[11px] leading-snug text-[var(--text2)]">
              {JSON.stringify(row.payload, null, 2)}
            </pre>
          </td>
        </tr>
      ) : null,
    ].filter(Boolean)
  })
}

export function HealthCheckV3Panel() {
  const { activeTab } = useDashboard()
  const tabActive = activeTab === 'healthcheckv3'

  const query = useHealthCheckV3Position(tabActive)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [summary, setSummary] = useState({
    endpoint: '—',
    total: '—',
    status: '—',
  })

  const toggleRow = (section: string) => {
    setExpanded((e) => ({ ...e, [section]: !e[section] }))
  }

  const applySummary = (stats: NonNullable<typeof query.data>) => {
    setSummary({
      endpoint: 'Position Service',
      total: String(stats.total),
      status: `${stats.ok}/${stats.issues}`,
    })
  }

  const runCheck = async () => {
    const result = await query.refetch()
    if (result.data) applySummary(result.data)
  }

  useEffect(() => {
    if (query.data && query.isSuccess && !query.isFetching) {
      applySummary(query.data)
    }
  }, [query.data, query.isSuccess, query.isFetching])

  const overallChip =
    query.data?.overallStatus.toLowerCase() === 'ok'
      ? 'ok'
      : query.data?.overallStatus.toLowerCase() === 'not_ok'
        ? 'warn'
        : 'err'

  return (
    <section>
      <SectionHeader
        title="Health Check v3 — Position Service"
        titleColor="var(--purple)"
        badge={<Badge variant="strat">Operations</Badge>}
        lineColor="var(--pur-bd)"
      />

      <div className="mb-3 rounded-[var(--rlg)] border border-[var(--border2)] bg-[var(--s1)] p-3 text-xs leading-relaxed text-[var(--text2)]">
        Reads the v3 position-service health check from{' '}
        <span className="font-mono-dm">{HEALTH_V3_POSITION_SERVICE_PATH}</span>.
        Expand any section row to view full details and error messages.
      </div>

      <div className="grid-kpi-3 mb-3">
        <MetricCard variant="base" label="Last Run Endpoint" value={summary.endpoint} />
        <MetricCard variant="base" label="Total Sections" value={summary.total} />
        <MetricCard variant="base" label="Healthy / Error" value={summary.status} />
      </div>

      {query.data && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-[var(--rlg)] border border-[var(--border)] bg-[var(--s1)] px-3 py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text3)]">
            Overall
          </span>
          <span className={`hc-chip ${overallChip}`}>
            {query.data.overallStatus.toUpperCase().replace('_', ' ')}
          </span>
          <span className="text-xs text-[var(--text2)]">{query.data.overallMessage}</span>
          {!query.data.apiSuccess && (
            <span className="text-[11px] text-[var(--amber)]">API success: false</span>
          )}
        </div>
      )}

      <div className="rounded-[var(--rlg)] border border-[var(--border)] bg-[var(--s1)] p-[18px]">
        <div className="mb-2.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex-1 text-xs font-medium text-[var(--text2)]">
            Position Service Health Check (v3)
          </div>
          <button
            type="button"
            className="btn-csv w-full justify-center sm:w-auto"
            disabled={query.isFetching}
            onClick={() => void runCheck()}
          >
            Run Position Service Check
          </button>
        </div>

        <div className="overflow-hidden rounded-[var(--rlg)] border border-[var(--pur-bd)] bg-[var(--s1)]">
          <div className="table-scroll">
            <table className="dtable">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Status</th>
                  <th>Message</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <SectionTable
                  rows={query.data?.rows ?? []}
                  loading={query.isFetching && !query.data}
                  loadingMessage="Running position service health check..."
                  error={query.isError ? query.error.message : null}
                  onRetry={() => void runCheck()}
                  expanded={expanded}
                  onToggle={toggleRow}
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
