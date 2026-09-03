import { useMemo, useState } from 'react'
import { useDebugStrategyFetch } from '../../hooks/useDebugStrategyQueries'
import {
  DEBUG_STRATEGY_API_ORIGIN,
  debugStrategyAptdemoFullUrl,
  debugStrategyFullUrl,
  extractStrategyData,
  flattenTopLevelFields,
  formatDebugJson,
  isApiErrorBody,
  summarizeDebugResult,
} from '../../lib/debugStrategyApi'
import type { DebugStrategyFieldRow } from '../../types/debugStrategy'
import { SectionError } from '../ui/SectionState'
import { Badge, MetricCard, SectionHeader } from '../ui/Shared'

function FieldTable({
  rows,
  expanded,
  onToggle,
}: {
  rows: DebugStrategyFieldRow[]
  expanded: Record<string, boolean>
  onToggle: (key: string) => void
}) {
  if (!rows.length) {
    return (
      <tr>
        <td colSpan={3} className="text-[var(--text3)]">
          No fields in response.
        </td>
      </tr>
    )
  }

  return rows.flatMap((row) => {
    const isOpen = expanded[row.key]
    return [
      <tr
        key={row.key}
        className={`${row.isJson ? 'cursor-pointer' : ''} ${isOpen ? 'expanded' : ''}`}
        onClick={() => row.isJson && onToggle(row.key)}
        aria-expanded={row.isJson ? isOpen : undefined}
      >
        <td className="font-mono-dm">
          {row.isJson && (
            <span
              className="mr-1.5 inline-block text-[10px] text-[var(--text3)] transition-transform duration-150"
              style={{ transform: isOpen ? 'rotate(90deg)' : undefined }}
            >
              ▶
            </span>
          )}
          {row.key}
        </td>
        <td className="text-[var(--text2)]">{row.value}</td>
        <td className="text-[var(--text3)]">{row.isJson ? 'object' : 'value'}</td>
      </tr>,
      isOpen && row.isJson ? (
        <tr key={`${row.key}-detail`}>
          <td colSpan={3} className="!pb-3 !pt-0 bg-[rgba(139,92,246,0.02)]">
            <pre className="m-0 max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border2)] bg-[var(--s2)] p-3 font-mono-dm text-[11px] leading-snug text-[var(--text2)]">
              {formatDebugJson(row.payload)}
            </pre>
          </td>
        </tr>
      ) : null,
    ].filter(Boolean)
  })
}

function CopyableTextRow({
  label,
  value,
  mono = true,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* fallback: user can still select the input */
    }
  }

  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--text3)]">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          onClick={(e) => e.currentTarget.select()}
          aria-label={label}
          className={`h-8 min-w-0 flex-1 rounded-lg border border-[var(--border2)] bg-[var(--s2)] px-2.5 text-xs text-[var(--text)] outline-none focus:border-[var(--purple)] ${mono ? 'font-mono-dm' : ''}`}
        />
        <button
          type="button"
          className="btn-csv shrink-0 px-3"
          onClick={copy}
          disabled={!value.trim()}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

export function DebugStrategyPanel() {
  const [strategyId, setStrategyId] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const mutation = useDebugStrategyFetch()

  const summary = useMemo(
    () => summarizeDebugResult(mutation.data ?? null),
    [mutation.data],
  )

  const fieldRows = useMemo(
    () => flattenTopLevelFields(mutation.data?.body),
    [mutation.data?.body],
  )

  const strategyData = useMemo(
    () => extractStrategyData(mutation.data?.body),
    [mutation.data?.body],
  )

  const strategyFieldRows = useMemo(
    () => flattenTopLevelFields(strategyData),
    [strategyData],
  )

  const isErrorResponse =
    mutation.data != null &&
    (!mutation.data.ok || isApiErrorBody(mutation.data.body))

  const toggleRow = (key: string) => {
    setExpanded((e) => ({ ...e, [key]: !e[key] }))
  }

  const runDebug = () => {
    if (!strategyId.trim()) {
      setInputError('Strategy ID is required.')
      return
    }
    if (!sessionId.trim()) {
      setInputError('Session UUID is required.')
      return
    }
    setInputError(null)
    mutation.mutate({ strategyId, sessionId })
  }

  const chipCls = mutation.data?.ok ? 'ok' : mutation.data ? 'warn' : 'ok'

  const apiFullUrl =
    strategyId.trim() && sessionId.trim()
      ? debugStrategyFullUrl(strategyId, sessionId)
      : ''
  const aptdemoFullUrl =
    strategyId.trim() && sessionId.trim()
      ? debugStrategyAptdemoFullUrl(strategyId, sessionId)
      : ''

  return (
    <section>
      <SectionHeader
        title="Debug Strategy — Lambda Lookup"
        titleColor="var(--purple)"
        badge={<Badge variant="strat">Debug</Badge>}
        lineColor="var(--pur-bd)"
      />

      <div className="mb-3 rounded-[var(--rlg)] border border-[var(--border2)] bg-[var(--s1)] p-3 text-xs leading-relaxed text-[var(--text2)]">
        Uses the Apt HQ Lambda API:{' '}
        <span className="font-mono-dm">GET /api/v3/strategies/&#123;strategyId&#125;/&#123;sessionId&#125;</span>.
        Enter Strategy ID and Session UUID — the Lambda returns the strategy JSON. Base:{' '}
        <span className="font-mono-dm break-all">{DEBUG_STRATEGY_API_ORIGIN}</span>
      </div>

      <div className="mb-3 rounded-[var(--rlg)] border border-[var(--border)] bg-[var(--s1)] p-[18px]">
        <div className="mb-2.5 grid gap-2 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--text3)]">
              Strategy ID
            </label>
            <input
              type="text"
              value={strategyId}
              onChange={(e) => {
                setStrategyId(e.target.value)
                setInputError(null)
              }}
              placeholder="Strategy UUID"
              className="h-8 w-full rounded-lg border border-[var(--border2)] bg-[var(--s2)] px-2.5 font-mono-dm text-xs text-[var(--text)] outline-none focus:border-[var(--purple)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--text3)]">
              Session UUID
            </label>
            <input
              type="text"
              value={sessionId}
              onChange={(e) => {
                setSessionId(e.target.value)
                setInputError(null)
              }}
              className="h-8 w-full rounded-lg border border-[var(--border2)] bg-[var(--s2)] px-2.5 font-mono-dm text-xs text-[var(--text)] outline-none focus:border-[var(--purple)]"
            />
          </div>
        </div>

        <div className="space-y-2">
          {apiFullUrl ? (
            <CopyableTextRow label="Full URL (Lambda)" value={apiFullUrl} />
          ) : null}
          {aptdemoFullUrl ? (
            <CopyableTextRow label="Full URL (aptdemo)" value={aptdemoFullUrl} />
          ) : null}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              className="btn-csv w-full justify-center sm:w-auto"
              disabled={mutation.isPending}
              onClick={runDebug}
            >
              {mutation.isPending ? 'Fetching…' : 'Debug Strategy'}
            </button>
          </div>
        </div>

        {inputError && (
          <p className="mt-2 text-xs text-[var(--red)]" role="alert">
            {inputError}
          </p>
        )}
      </div>

      <div className="grid-kpi-3 mb-3">
        <MetricCard variant="base" label="HTTP Status" value={summary.status} />
        <MetricCard variant="base" label="Message" value={summary.message} />
        <MetricCard variant="base" label="Request ID" value={summary.requestId} />
      </div>

      {mutation.isError && (
        <div className="mb-3">
          <SectionError message={mutation.error.message} onRetry={runDebug} />
        </div>
      )}

      {mutation.data && (
        <>
          {isErrorResponse && (
            <div className="mb-3 rounded-[var(--rlg)] border border-[var(--amber)]/40 bg-[rgba(245,158,11,0.08)] p-3 text-xs leading-relaxed text-[var(--text2)]">
              <strong className="text-[var(--amber)]">Lookup returned errors.</strong> The Lambda
              API responded — expand broker rows below for per-broker details.
            </div>
          )}

          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-[var(--rlg)] border border-[var(--border)] bg-[var(--s1)] px-3 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text3)]">
              Result
            </span>
            <span className={`hc-chip ${chipCls}`}>
              {mutation.data.ok ? 'SUCCESS' : `HTTP ${mutation.data.status}`}
            </span>
            {summary.hasStrategyData && (
              <span className="hc-chip ok">Broker data present</span>
            )}
          </div>

          {strategyData != null && (
            <div className="mb-3 overflow-hidden rounded-[var(--rlg)] border border-[var(--pur-bd)] bg-[var(--s1)] p-[18px]">
              <div className="mb-2.5 text-xs font-medium text-[var(--purple)]">
                Broker responses
              </div>
              {strategyFieldRows.length > 0 ? (
                <div className="overflow-hidden rounded-[var(--rlg)] border border-[var(--border)] bg-[var(--s1)]">
                  <div className="table-scroll">
                    <table className="dtable">
                      <thead>
                        <tr>
                          <th>Field</th>
                          <th>Preview</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        <FieldTable
                          rows={strategyFieldRows}
                          expanded={expanded}
                          onToggle={toggleRow}
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <pre className="m-0 max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border2)] bg-[var(--s2)] p-3 font-mono-dm text-[11px] leading-snug text-[var(--text2)]">
                  {formatDebugJson(strategyData)}
                </pre>
              )}
            </div>
          )}

          <div className="mb-3 overflow-hidden rounded-[var(--rlg)] border border-[var(--border)] bg-[var(--s1)] p-[18px]">
            <div className="mb-2.5 text-xs font-medium text-[var(--text2)]">
              {isErrorResponse ? 'Error response fields' : 'Response fields'}
            </div>
            <div className="overflow-hidden rounded-[var(--rlg)] border border-[var(--pur-bd)] bg-[var(--s1)]">
              <div className="table-scroll">
                <table className="dtable">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Preview</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <FieldTable
                      rows={fieldRows}
                      expanded={expanded}
                      onToggle={toggleRow}
                    />
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="rounded-[var(--rlg)] border border-[var(--border)] bg-[var(--s1)] p-[18px]">
            <div className="mb-2.5 text-xs font-medium text-[var(--text2)]">
              Full JSON response
            </div>
            <pre className="m-0 max-h-[520px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border2)] bg-[var(--s2)] p-3 font-mono-dm text-[11px] leading-snug text-[var(--text2)]">
              {formatDebugJson(mutation.data.body)}
            </pre>
          </div>
        </>
      )}

      {!mutation.data && !mutation.isPending && !mutation.isError && (
        <div className="rounded-[var(--rlg)] border border-dashed border-[var(--border2)] bg-[var(--s1)] p-8 text-center text-xs text-[var(--text3)]">
          Enter Strategy ID and Session UUID, then click Debug Strategy. Requests go to the Lambda
          Apt HQ API via{' '}
          <span className="font-mono-dm">/api/v3/strategies/&#123;strategyId&#125;/&#123;sessionId&#125;</span>.
        </div>
      )}
    </section>
  )
}
