import { useEffect, useState } from 'react'
import { useDashboard } from '../../context/DashboardContext'
import {
  useHealthCheckIndicator,
  useHealthCheckLtp,
  useHealthCheckPosition,
} from '../../hooks/useHealthCheckQueries'
import { HEALTH_CHECK_LABELS } from '../../lib/endpoints'
import { parseHealthRows } from '../../lib/health'
import type { HealthRow } from '../../types/dashboard'
import { SectionError } from '../ui/SectionState'
import { Badge, MetricCard, SectionHeader } from '../ui/Shared'

function HealthTable({
  rows,
  emptyMessage,
  loading,
  loadingMessage,
  error,
  onRetry,
  expanded,
  onToggle,
}: {
  rows: HealthRow[]
  emptyMessage: string
  loading: boolean
  loadingMessage: string
  error: string | null
  onRetry?: () => void
  expanded: Record<string, boolean>
  onToggle: (broker: string) => void
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
          {emptyMessage}
        </td>
      </tr>
    )
  }

  return rows.flatMap((row) => {
    const isOpen = expanded[row.broker]
    return [
      <tr
        key={row.broker}
        className={`cursor-pointer ${isOpen ? 'expanded' : ''}`}
        onClick={() => onToggle(row.broker)}
        aria-expanded={isOpen}
      >
        <td className="font-mono-dm">
          <span
            className="mr-1.5 inline-block text-[10px] text-[var(--text3)] transition-transform duration-150"
            style={{ transform: isOpen ? 'rotate(90deg)' : undefined }}
          >
            ▶
          </span>
          {row.broker}
        </td>
        <td>
          <span className={`hc-chip ${row.summary.cls}`}>{row.summary.label}</span>
        </td>
        <td className="text-[var(--text2)]">{row.summary.msg}</td>
        <td className="text-[var(--text3)]">{row.summary.detail}</td>
      </tr>,
      isOpen ? (
        <tr key={`${row.broker}-detail`}>
          <td colSpan={4} className="!pb-3 !pt-0 bg-[rgba(139,92,246,0.02)]">
            <pre className="m-0 max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border2)] bg-[var(--s2)] p-3 font-mono-dm text-[11px] leading-snug text-[var(--text2)]">
              {JSON.stringify(row.payload, null, 2)}
            </pre>
          </td>
        </tr>
      ) : null,
    ].filter(Boolean)
  })
}

export function HealthCheckPanel() {
  const { activeTab } = useDashboard()
  const tabActive = activeTab === 'healthcheck'

  const ltpQuery = useHealthCheckLtp(tabActive)
  const indicatorQuery = useHealthCheckIndicator(tabActive)
  const positionMutation = useHealthCheckPosition()

  const [positionId, setPositionId] = useState('')
  const [positionInputError, setPositionInputError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [summary, setSummary] = useState({
    endpoint: '—',
    total: '—',
    status: '—',
  })

  const toggleRow = (broker: string) => {
    setExpanded((e) => ({ ...e, [broker]: !e[broker] }))
  }

  const applySummary = (
    label: string,
    stats: { total: number; ok: number; issues: number },
  ) => {
    setSummary({
      endpoint: label,
      total: String(stats.total),
      status: `${stats.ok}/${stats.issues}`,
    })
  }

  const runLtp = async () => {
    const result = await ltpQuery.refetch()
    if (result.data) applySummary(HEALTH_CHECK_LABELS.ltp, result.data)
    else if (result.error)
      applySummary(HEALTH_CHECK_LABELS.ltp, { total: 0, ok: 0, issues: 0 })
  }

  const runIndicator = async () => {
    const result = await indicatorQuery.refetch()
    if (result.data) applySummary(HEALTH_CHECK_LABELS.indicator, result.data)
    else if (result.error)
      applySummary(HEALTH_CHECK_LABELS.indicator, { total: 0, ok: 0, issues: 0 })
  }

  const runPosition = () => {
    const id = positionId.trim()
    if (!id) {
      setPositionInputError('Enter a position UUID to run lookup.')
      return
    }
    setPositionInputError(null)
    positionMutation.mutate(id, {
      onSuccess: (data) => {
        const stats = parseHealthRows(data, 'position')
        applySummary(HEALTH_CHECK_LABELS.position, stats)
      },
      onError: () => {
        applySummary(HEALTH_CHECK_LABELS.position, { total: 0, ok: 0, issues: 0 })
      },
    })
  }

  const positionStats = positionMutation.data
    ? parseHealthRows(positionMutation.data, 'position')
    : null

  useEffect(() => {
    if (ltpQuery.data && ltpQuery.isSuccess && !ltpQuery.isFetching) {
      applySummary(HEALTH_CHECK_LABELS.ltp, ltpQuery.data)
    }
  }, [ltpQuery.data, ltpQuery.isSuccess, ltpQuery.isFetching])

  useEffect(() => {
    if (indicatorQuery.data && indicatorQuery.isSuccess && !indicatorQuery.isFetching) {
      applySummary(HEALTH_CHECK_LABELS.indicator, indicatorQuery.data)
    }
  }, [indicatorQuery.data, indicatorQuery.isSuccess, indicatorQuery.isFetching])

  return (
    <section>
      <SectionHeader
        title="Health Check API — LTP, Indicator & Position"
        titleColor="var(--purple)"
        badge={<Badge variant="strat">Operations</Badge>}
        lineColor="var(--pur-bd)"
      />

      <div className="mb-3 rounded-[var(--rlg)] border border-[var(--border2)] bg-[var(--s1)] p-3 text-xs leading-relaxed text-[var(--text2)]">
        Operational health-check endpoints for Apt HQ. These routes fan out to all configured broker APIs and return per-broker responses as-is under the{' '}
        <span className="font-mono-dm">brokers</span> key.
      </div>

      <div className="grid-kpi-3 mb-3">
        <MetricCard variant="base" label="Last Run Endpoint" value={summary.endpoint} />
        <MetricCard variant="base" label="Total Brokers Queried" value={summary.total} />
        <MetricCard variant="base" label="Healthy / Error" value={summary.status} />
      </div>

      <div className="grid-split mb-3">
        <HealthBlock
          title="LTP Service Health Check"
          buttonLabel="Run LTP Check"
          loading={ltpQuery.isFetching}
          onRun={() => void runLtp()}
          rows={ltpQuery.data?.rows ?? []}
          error={ltpQuery.isError ? ltpQuery.error.message : null}
          onRetry={() => void runLtp()}
          emptyMessage="Run LTP check to view broker statuses."
          loadingMessage={`Running ${HEALTH_CHECK_LABELS.ltp} health check...`}
          expanded={expanded}
          onToggle={toggleRow}
          lastCol="Details"
        />
        <HealthBlock
          title="Indicator Service Health Check"
          buttonLabel="Run Indicator Check"
          loading={indicatorQuery.isFetching}
          onRun={() => void runIndicator()}
          rows={indicatorQuery.data?.rows ?? []}
          error={indicatorQuery.isError ? indicatorQuery.error.message : null}
          onRetry={() => void runIndicator()}
          emptyMessage="Run Indicator check to view broker statuses."
          loadingMessage={`Running ${HEALTH_CHECK_LABELS.indicator} health check...`}
          expanded={expanded}
          onToggle={toggleRow}
          lastCol="Details"
        />
      </div>

      <div className="rounded-[var(--rlg)] border border-[var(--border)] bg-[var(--s1)] p-[18px]">
        <div className="mb-2.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex-1 text-xs font-medium text-[var(--text2)]">
            Position Lookup (Across All Brokers)
          </div>
          <input
            type="text"
            value={positionId}
            onChange={(e) => {
              setPositionId(e.target.value)
              setPositionInputError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                runPosition()
              }
            }}
            placeholder="Enter position UUID (id)"
            className="h-8 w-full rounded-lg border border-[var(--border2)] bg-[var(--s2)] px-2.5 font-mono-dm text-xs text-[var(--text)] outline-none sm:min-w-[320px] sm:w-auto"
            aria-invalid={Boolean(positionInputError)}
          />
          <button
            type="button"
            className="btn-csv w-full justify-center sm:w-auto"
            disabled={positionMutation.isPending}
            onClick={runPosition}
          >
            Run Position Lookup
          </button>
        </div>
        {positionInputError && (
          <p className="mb-2 text-xs text-[var(--red)]" role="alert">
            {positionInputError}
          </p>
        )}
        <div className="overflow-hidden rounded-[var(--rlg)] border border-[var(--pur-bd)] bg-[var(--s1)]">
          <div className="table-scroll">
            <table className="dtable">
              <thead>
                <tr>
                  <th>Broker</th>
                  <th>Status</th>
                  <th>Message</th>
                  <th>Position / Error</th>
                </tr>
              </thead>
              <tbody>
                <HealthTable
                  rows={positionStats?.rows ?? []}
                  emptyMessage="Enter a position UUID and run lookup."
                  loading={positionMutation.isPending}
                  loadingMessage="Running position lookup across brokers..."
                  error={
                    positionMutation.isError
                      ? positionMutation.error.message
                      : null
                  }
                  onRetry={runPosition}
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

function HealthBlock({
  title,
  buttonLabel,
  loading,
  onRun,
  rows,
  emptyMessage,
  loadingMessage,
  error,
  onRetry,
  expanded,
  onToggle,
  lastCol,
}: {
  title: string
  buttonLabel: string
  loading: boolean
  onRun: () => void
  rows: HealthRow[]
  emptyMessage: string
  loadingMessage: string
  error: string | null
  onRetry: () => void
  expanded: Record<string, boolean>
  onToggle: (broker: string) => void
  lastCol: string
}) {
  return (
    <div className="rounded-[var(--rlg)] border border-[var(--border)] bg-[var(--s1)] p-[18px]">
      <div className="mb-2.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex-1 text-xs font-medium text-[var(--text2)]">{title}</div>
        <button
          type="button"
          className="btn-csv w-full justify-center sm:w-auto"
          disabled={loading}
          onClick={onRun}
        >
          {buttonLabel}
        </button>
      </div>
      <div className="overflow-hidden rounded-[var(--rlg)] border border-[var(--pur-bd)] bg-[var(--s1)]">
        <div className="table-scroll">
          <table className="dtable">
            <thead>
              <tr>
                <th>Broker</th>
                <th>Status</th>
                <th>Message</th>
                <th>{lastCol}</th>
              </tr>
            </thead>
            <tbody>
              <HealthTable
                rows={rows}
                emptyMessage={emptyMessage}
                loading={loading}
                loadingMessage={loadingMessage}
                error={error}
                onRetry={onRetry}
                expanded={expanded}
                onToggle={onToggle}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
