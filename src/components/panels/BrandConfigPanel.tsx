import { useEffect, useMemo, useState } from 'react'
import { useDashboard } from '../../context/DashboardContext'
import {
  useAllBrandConfigs,
  useCurrentBrandConfig,
  usePatchAllBrandConfigs,
  usePatchCurrentBrandConfig,
} from '../../hooks/useBrandConfigQueries'
import {
  formatBrandConfigJson,
  getBrandConfigToken,
  parseAllConfigsJson,
  parseBrandConfigJson,
  setBrandConfigToken,
} from '../../lib/brandConfigApi'
import type { BrokerBrandConfig } from '../../types/brandConfig'
import { SectionError } from '../ui/SectionState'
import { Badge, MetricCard, SectionHeader, SubLabel } from '../ui/Shared'

const DEFAULT_PATCH_ALL = `{
  "configs": [
    {
      "brokerName": "TradeSmart",
      "config": {
        "colors": { "primary": "#8b5cf6" }
      }
    }
  ]
}`

function ConfigPreview({
  value,
  emptyMessage,
  loading,
  loadingMessage,
  error,
  onRetry,
}: {
  value: unknown
  emptyMessage: string
  loading: boolean
  loadingMessage: string
  error: string | null
  onRetry?: () => void
}) {
  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--border2)] bg-[var(--s2)] p-4 text-xs text-[var(--text3)]">
        {loadingMessage}
      </div>
    )
  }

  if (error) {
    return <SectionError message={error} onRetry={onRetry || (() => {})} />
  }

  const isEmpty =
    value == null ||
    (typeof value === 'object' &&
      !Array.isArray(value) &&
      !Object.keys(value as object).length) ||
    (Array.isArray(value) && !value.length)

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-[var(--border2)] bg-[var(--s2)] p-4 text-xs text-[var(--text3)]">
        {emptyMessage}
      </div>
    )
  }

  return (
    <pre className="m-0 max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border2)] bg-[var(--s2)] p-3 font-mono-dm text-[11px] leading-snug text-[var(--text2)]">
      {formatBrandConfigJson(value)}
    </pre>
  )
}

function BrokerConfigTable({
  rows,
  loading,
  loadingMessage,
  error,
  onRetry,
  expanded,
  onToggle,
}: {
  rows: BrokerBrandConfig[]
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
        <td colSpan={3} className="text-[var(--text3)]">
          {loadingMessage}
        </td>
      </tr>
    )
  }

  if (error) {
    return (
      <tr>
        <td colSpan={3}>
          <SectionError message={error} onRetry={onRetry || (() => {})} />
        </td>
      </tr>
    )
  }

  if (!rows.length) {
    return (
      <tr>
        <td colSpan={3} className="text-[var(--text3)]">
          No broker configs returned.
        </td>
      </tr>
    )
  }

  return rows.flatMap((row) => {
    const isOpen = expanded[row.brokerName]
    const keyCount = Object.keys(row.config || {}).length
    return [
      <tr
        key={row.brokerName}
        className={`cursor-pointer ${isOpen ? 'expanded' : ''}`}
        onClick={() => onToggle(row.brokerName)}
        aria-expanded={isOpen}
      >
        <td className="font-mono-dm">
          <span
            className="mr-1.5 inline-block text-[10px] text-[var(--text3)] transition-transform duration-150"
            style={{ transform: isOpen ? 'rotate(90deg)' : undefined }}
          >
            ▶
          </span>
          {row.brokerName}
        </td>
        <td>
          <span className="hc-chip ok">{keyCount} keys</span>
        </td>
        <td className="text-[var(--text3)]">
          {keyCount ? Object.keys(row.config).slice(0, 4).join(', ') : '—'}
          {keyCount > 4 ? '…' : ''}
        </td>
      </tr>,
      isOpen ? (
        <tr key={`${row.brokerName}-detail`}>
          <td colSpan={3} className="!pb-3 !pt-0 bg-[rgba(139,92,246,0.02)]">
            <pre className="m-0 max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border2)] bg-[var(--s2)] p-3 font-mono-dm text-[11px] leading-snug text-[var(--text2)]">
              {formatBrandConfigJson(row.config)}
            </pre>
          </td>
        </tr>
      ) : null,
    ].filter(Boolean)
  })
}

export function BrandConfigPanel() {
  const { activeTab, brokerLabel } = useDashboard()
  const tabActive = activeTab === 'brandconfig'

  const [tokenInput, setTokenInput] = useState(getBrandConfigToken())
  const [token, setToken] = useState(getBrandConfigToken())
  const [currentConfigType, setCurrentConfigType] = useState('')
  const [allBrokersFilter, setAllBrokersFilter] = useState('')
  const [allConfigType, setAllConfigType] = useState('')
  const [currentPatchJson, setCurrentPatchJson] = useState('{\n  \n}')
  const [allPatchJson, setAllPatchJson] = useState(DEFAULT_PATCH_ALL)
  const [patchError, setPatchError] = useState<string | null>(null)
  const [allPatchError, setAllPatchError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [summary, setSummary] = useState({
    endpoint: '—',
    count: '—',
    status: '—',
  })

  const currentFilters = useMemo(
    () => ({ token, configType: currentConfigType || undefined }),
    [token, currentConfigType],
  )

  const allFilters = useMemo(
    () => ({
      token,
      brokers: allBrokersFilter || undefined,
      configType: allConfigType || undefined,
    }),
    [token, allBrokersFilter, allConfigType],
  )

  const currentQuery = useCurrentBrandConfig(currentFilters, tabActive)
  const allQuery = useAllBrandConfigs(allFilters, tabActive)
  const patchCurrent = usePatchCurrentBrandConfig(currentFilters)
  const patchAll = usePatchAllBrandConfigs(allFilters)

  useEffect(() => {
    if (currentQuery.data && currentQuery.isSuccess && !currentQuery.isFetching) {
      setCurrentPatchJson(formatBrandConfigJson(currentQuery.data))
      setSummary({
        endpoint: 'GET /config',
        count: String(Object.keys(currentQuery.data).length),
        status: 'Loaded',
      })
    }
  }, [currentQuery.data, currentQuery.isSuccess, currentQuery.isFetching])

  useEffect(() => {
    if (allQuery.data && allQuery.isSuccess && !allQuery.isFetching) {
      setSummary({
        endpoint: 'GET /all_configs',
        count: String(allQuery.data.length),
        status: 'Loaded',
      })
    }
  }, [allQuery.data, allQuery.isSuccess, allQuery.isFetching])

  const saveToken = () => {
    setBrandConfigToken(tokenInput)
    setToken(tokenInput.trim())
  }

  const toggleRow = (broker: string) => {
    setExpanded((e) => ({ ...e, [broker]: !e[broker] }))
  }

  const runCurrentFetch = async () => {
    const result = await currentQuery.refetch()
    if (result.data) {
      setSummary({
        endpoint: 'GET /config',
        count: String(Object.keys(result.data).length),
        status: 'Loaded',
      })
    }
  }

  const runAllFetch = async () => {
    const result = await allQuery.refetch()
    if (result.data) {
      setSummary({
        endpoint: 'GET /all_configs',
        count: String(result.data.length),
        status: 'Loaded',
      })
    }
  }

  const submitCurrentPatch = () => {
    setPatchError(null)
    try {
      const config = parseBrandConfigJson(currentPatchJson)
      patchCurrent.mutate(config, {
        onSuccess: (data) => {
          setCurrentPatchJson(formatBrandConfigJson(data))
          setSummary({
            endpoint: 'PATCH /config',
            count: String(Object.keys(data).length),
            status: 'Saved',
          })
        },
        onError: (err) => {
          setPatchError(err.message)
        },
      })
    } catch (err) {
      setPatchError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }

  const submitAllPatch = () => {
    setAllPatchError(null)
    try {
      const body = parseAllConfigsJson(allPatchJson)
      patchAll.mutate(body, {
        onSuccess: (data) => {
          setAllPatchJson(formatBrandConfigJson({ configs: data }))
          setSummary({
            endpoint: 'PATCH /all_configs',
            count: String(data.length),
            status: 'Saved',
          })
          void allQuery.refetch()
        },
        onError: (err) => {
          setAllPatchError(err.message)
        },
      })
    } catch (err) {
      setAllPatchError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }

  const tokenReady = Boolean(token)

  return (
    <section>
      <SectionHeader
        title="Brand Config API — Theme & Broker Settings"
        titleColor="var(--purple)"
        badge={<Badge variant="strat">Configuration</Badge>}
        lineColor="var(--pur-bd)"
      />

      <div className="mb-3 rounded-[var(--rlg)] border border-[var(--border2)] bg-[var(--s1)] p-3 text-xs leading-relaxed text-[var(--text2)]">
        Manage per-broker brand configuration via{' '}
        <span className="font-mono-dm">/v2/aggregate</span>. All routes require{' '}
        <span className="font-mono-dm">Authorization: &lt;access_token&gt;</span>.
        PATCH replaces the stored config object — omitted keys are deleted.
      </div>

      <div className="mb-3 rounded-[var(--rlg)] border border-[var(--border)] bg-[var(--s1)] p-[18px]">
        <SubLabel>Access token</SubLabel>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Paste access token"
            className="h-8 w-full rounded-lg border border-[var(--border2)] bg-[var(--s2)] px-2.5 font-mono-dm text-xs text-[var(--text)] outline-none sm:flex-1"
            autoComplete="off"
          />
          <button type="button" className="btn-csv w-full justify-center sm:w-auto" onClick={saveToken}>
            Save token
          </button>
        </div>
        <p className="mt-2 text-[11px] text-[var(--text3)]">
          {tokenReady
            ? 'Token saved — requests will include Authorization header.'
            : 'No token set. Save a token or set VITE_BRAND_CONFIG_TOKEN in .env.'}
        </p>
      </div>

      <div className="grid-kpi-3 mb-3">
        <MetricCard variant="base" label="Last Action" value={summary.endpoint} />
        <MetricCard variant="base" label="Keys / Brokers" value={summary.count} />
        <MetricCard variant="base" label="Status" value={summary.status} />
      </div>

      <div className="grid-split mb-3">
        <div className="rounded-[var(--rlg)] border border-[var(--border)] bg-[var(--s1)] p-[18px]">
          <div className="mb-2.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex-1 text-xs font-medium text-[var(--text2)]">
              1. GET /v2/aggregate/config
            </div>
            <input
              type="text"
              value={currentConfigType}
              onChange={(e) => setCurrentConfigType(e.target.value)}
              placeholder="config_type (optional, comma-separated)"
              className="h-8 w-full rounded-lg border border-[var(--border2)] bg-[var(--s2)] px-2.5 font-mono-dm text-xs text-[var(--text)] outline-none sm:min-w-[220px] sm:w-auto"
            />
            <button
              type="button"
              className="btn-csv w-full justify-center sm:w-auto"
              disabled={!tokenReady || currentQuery.isFetching}
              onClick={() => void runCurrentFetch()}
            >
              Fetch current broker
            </button>
          </div>
          <p className="mb-2 text-[11px] text-[var(--text3)]">
            Current broker theme (server BROKER). Selected: {brokerLabel}.
          </p>
          <ConfigPreview
            value={currentQuery.data}
            emptyMessage={tokenReady ? 'Fetch to load current broker config.' : 'Save access token first.'}
            loading={currentQuery.isFetching && !currentQuery.data}
            loadingMessage="Loading current broker config..."
            error={currentQuery.isError ? currentQuery.error.message : null}
            onRetry={() => void runCurrentFetch()}
          />
        </div>

        <div className="rounded-[var(--rlg)] border border-[var(--border)] bg-[var(--s1)] p-[18px]">
          <div className="mb-2.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex-1 text-xs font-medium text-[var(--text2)]">
              2. PATCH /v2/aggregate/config
            </div>
            <button
              type="button"
              className="btn-csv w-full justify-center sm:w-auto"
              disabled={!tokenReady || patchCurrent.isPending}
              onClick={submitCurrentPatch}
            >
              Replace config
            </button>
          </div>
          <p className="mb-2 text-[11px] text-[var(--text3)]">
            Body is the config object directly (not wrapped). At least one key required.
          </p>
          {patchError && (
            <p className="mb-2 text-xs text-[var(--red)]" role="alert">
              {patchError}
            </p>
          )}
          <textarea
            value={currentPatchJson}
            onChange={(e) => {
              setCurrentPatchJson(e.target.value)
              setPatchError(null)
            }}
            rows={12}
            spellCheck={false}
            className="w-full rounded-lg border border-[var(--border2)] bg-[var(--s2)] p-3 font-mono-dm text-[11px] leading-snug text-[var(--text2)] outline-none"
            aria-label="Current broker config JSON"
          />
        </div>
      </div>

      <div className="mb-3 rounded-[var(--rlg)] border border-[var(--border)] bg-[var(--s1)] p-[18px]">
        <div className="mb-2.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex-1 text-xs font-medium text-[var(--text2)]">
            3. GET /v2/aggregate/all_configs
          </div>
          <input
            type="text"
            value={allBrokersFilter}
            onChange={(e) => setAllBrokersFilter(e.target.value)}
            placeholder="brokers (optional)"
            className="h-8 w-full rounded-lg border border-[var(--border2)] bg-[var(--s2)] px-2.5 font-mono-dm text-xs text-[var(--text)] outline-none sm:min-w-[160px] sm:w-auto"
          />
          <input
            type="text"
            value={allConfigType}
            onChange={(e) => setAllConfigType(e.target.value)}
            placeholder="config_type (optional)"
            className="h-8 w-full rounded-lg border border-[var(--border2)] bg-[var(--s2)] px-2.5 font-mono-dm text-xs text-[var(--text)] outline-none sm:min-w-[160px] sm:w-auto"
          />
          <button
            type="button"
            className="btn-csv w-full justify-center sm:w-auto"
            disabled={!tokenReady || allQuery.isFetching}
            onClick={() => void runAllFetch()}
          >
            Fetch all brokers
          </button>
        </div>
        <div className="overflow-hidden rounded-[var(--rlg)] border border-[var(--pur-bd)] bg-[var(--s1)]">
          <div className="table-scroll">
            <table className="dtable">
              <thead>
                <tr>
                  <th>Broker</th>
                  <th>Config</th>
                  <th>Keys preview</th>
                </tr>
              </thead>
              <tbody>
                <BrokerConfigTable
                  rows={allQuery.data ?? []}
                  loading={allQuery.isFetching && !allQuery.data}
                  loadingMessage="Loading all broker configs..."
                  error={allQuery.isError ? allQuery.error.message : null}
                  onRetry={() => void runAllFetch()}
                  expanded={expanded}
                  onToggle={toggleRow}
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-[var(--rlg)] border border-[var(--border)] bg-[var(--s1)] p-[18px]">
        <div className="mb-2.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex-1 text-xs font-medium text-[var(--text2)]">
            4. PATCH /v2/aggregate/all_configs
          </div>
          <button
            type="button"
            className="btn-csv w-full justify-center sm:w-auto"
            disabled={!tokenReady || patchAll.isPending}
            onClick={submitAllPatch}
          >
            Update listed brokers
          </button>
        </div>
        <p className="mb-2 text-[11px] text-[var(--text3)]">
          Replace configs for listed brokers only. Unlisted brokers are unchanged.
        </p>
        {allPatchError && (
          <p className="mb-2 text-xs text-[var(--red)]" role="alert">
            {allPatchError}
          </p>
        )}
        <textarea
          value={allPatchJson}
          onChange={(e) => {
            setAllPatchJson(e.target.value)
            setAllPatchError(null)
          }}
          rows={14}
          spellCheck={false}
          className="w-full rounded-lg border border-[var(--border2)] bg-[var(--s2)] p-3 font-mono-dm text-[11px] leading-snug text-[var(--text2)] outline-none"
          aria-label="All brokers patch JSON"
        />
      </div>
    </section>
  )
}
