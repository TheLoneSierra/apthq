import { useEffect, useState } from 'react'
import { DynamicKeyValueEditor } from './DynamicKeyValueEditor'
import { formatBrandConfigJson, parseAllConfigsJson } from '../../lib/brandConfigApi'
import type { PatchAllConfigsBody } from '../../types/brandConfig'

interface MultiBrokerConfigEditorProps {
  jsonString: string
  onChange: (newJsonString: string) => void
}

export function MultiBrokerConfigEditor({
  jsonString,
  onChange,
}: MultiBrokerConfigEditorProps) {
  const [mode, setMode] = useState<'form' | 'json'>('form')
  const [parsedBody, setParsedBody] = useState<PatchAllConfigsBody>({ configs: [] })
  const [selectedBrokerIndex, setSelectedBrokerIndex] = useState(0)
  const [newBrokerName, setNewBrokerName] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const parsed = parseAllConfigsJson(jsonString)
      setParsedBody(parsed)
      setParseError(null)
      if (selectedBrokerIndex >= parsed.configs.length && parsed.configs.length > 0) {
        setSelectedBrokerIndex(0)
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }, [jsonString, selectedBrokerIndex])

  const syncBodyToJson = (updated: PatchAllConfigsBody) => {
    setParsedBody(updated)
    onChange(formatBrandConfigJson(updated))
  }

  const handleCurrentBrokerConfigChange = (newConfigJson: string) => {
    try {
      const newConfigObj = JSON.parse(newConfigJson) as Record<string, unknown>
      const updatedConfigs = [...parsedBody.configs]
      if (updatedConfigs[selectedBrokerIndex]) {
        updatedConfigs[selectedBrokerIndex] = {
          ...updatedConfigs[selectedBrokerIndex],
          config: newConfigObj,
        }
        syncBodyToJson({ configs: updatedConfigs })
      }
    } catch {
      // ignore in-flight parse issues
    }
  }

  const handleAddBroker = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = newBrokerName.trim()
    if (!trimmed) return

    // check if already exists
    if (parsedBody.configs.some((b) => b.brokerName.toLowerCase() === trimmed.toLowerCase())) {
      alert(`Broker ${trimmed} is already in the list`)
      return
    }

    const updated = [
      ...parsedBody.configs,
      {
        brokerName: trimmed,
        config: {
          key: trimmed.toLowerCase(),
          colors: { primary: '#8b5cf6' },
        },
      },
    ]
    syncBodyToJson({ configs: updated })
    setSelectedBrokerIndex(updated.length - 1)
    setNewBrokerName('')
  }

  const handleDeleteBroker = (index: number) => {
    if (parsedBody.configs.length <= 1) {
      alert('At least one broker configuration is required')
      return
    }
    const updated = parsedBody.configs.filter((_, i) => i !== index)
    syncBodyToJson({ configs: updated })
    setSelectedBrokerIndex(Math.max(0, index - 1))
  }

  const activeBroker = parsedBody.configs[selectedBrokerIndex]

  return (
    <div className="rounded-lg border border-[var(--border2)] bg-[var(--s2)] p-3">
      {/* Mode switcher bar */}
      <div className="mb-3 flex items-center justify-between border-b border-[var(--border2)] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text)]">Multi-Broker Form Editor</span>
          <span className="rounded-full bg-[var(--s1)] px-2 py-0.5 font-mono-dm text-[10px] text-[var(--text3)]">
            {parsedBody.configs.length} {parsedBody.configs.length === 1 ? 'broker' : 'brokers'}
          </span>
        </div>

        <div className="flex items-center rounded-lg border border-[var(--border2)] bg-[var(--s1)] p-0.5">
          <button
            type="button"
            onClick={() => setMode('form')}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
              mode === 'form'
                ? 'bg-[var(--purple)] text-white shadow-sm'
                : 'text-[var(--text3)] hover:text-[var(--text)]'
            }`}
          >
            📝 Form View
          </button>
          <button
            type="button"
            onClick={() => setMode('json')}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
              mode === 'json'
                ? 'bg-[var(--purple)] text-white shadow-sm'
                : 'text-[var(--text3)] hover:text-[var(--text)]'
            }`}
          >
            {'{ }'} Raw JSON
          </button>
        </div>
      </div>

      {mode === 'form' ? (
        <div className="space-y-3">
          {parseError && (
            <div className="rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-[var(--red)]">
              {parseError} — switch to Raw JSON to view format.
            </div>
          )}

          {/* Broker Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {parsedBody.configs.map((broker, idx) => (
              <div key={broker.brokerName} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setSelectedBrokerIndex(idx)}
                  className={`flex items-center gap-1.5 rounded-l-lg border px-3 py-1 font-mono-dm text-xs font-medium transition-all ${
                    idx === selectedBrokerIndex
                      ? 'border-[var(--purple)] bg-[var(--purple)] text-white'
                      : 'border-[var(--border2)] bg-[var(--s1)] text-[var(--text2)] hover:border-[var(--pur-bd)]'
                  }`}
                >
                  <span>{broker.brokerName}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteBroker(idx)}
                  title={`Delete ${broker.brokerName}`}
                  className={`rounded-r-lg border border-l-0 px-2 py-1 text-[10px] transition-colors ${
                    idx === selectedBrokerIndex
                      ? 'border-[var(--purple)] bg-[var(--purple)] text-white/80 hover:bg-red-600 hover:text-white'
                      : 'border-[var(--border2)] bg-[var(--s1)] text-[var(--text3)] hover:text-[var(--red)]'
                  }`}
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Add broker inline */}
            <form onSubmit={handleAddBroker} className="flex items-center gap-1">
              <input
                type="text"
                value={newBrokerName}
                onChange={(e) => setNewBrokerName(e.target.value)}
                placeholder="New broker name"
                className="h-7 rounded border border-[var(--border2)] bg-[var(--s1)] px-2 font-mono-dm text-xs text-[var(--text)] outline-none focus:border-[var(--purple)]"
              />
              <button type="submit" className="btn-csv h-7 px-2 text-xs">
                + Add Broker
              </button>
            </form>
          </div>

          {/* Active Broker Config Editor */}
          {activeBroker ? (
            <div className="rounded-lg border border-[var(--pur-bd)] bg-[var(--s1)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[var(--purple)]">
                  Editing Config for: <span className="font-mono-dm text-white">{activeBroker.brokerName}</span>
                </h4>
              </div>

              <DynamicKeyValueEditor
                jsonString={formatBrandConfigJson(activeBroker.config || {})}
                onChange={handleCurrentBrokerConfigChange}
                label={`Fields for ${activeBroker.brokerName}`}
                ariaLabel={`Config editor for ${activeBroker.brokerName}`}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--border2)] p-6 text-center text-xs text-[var(--text3)]">
              No brokers in payload. Add a broker above.
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="mb-1.5 text-[11px] text-[var(--text3)]">
            Direct multi-broker JSON payload:
          </p>
          <textarea
            value={jsonString}
            onChange={(e) => onChange(e.target.value)}
            rows={14}
            spellCheck={false}
            className="w-full rounded-lg border border-[var(--border2)] bg-[var(--s1)] p-3 font-mono-dm text-[11px] leading-snug text-[var(--text2)] outline-none focus:border-[var(--purple)]"
            aria-label="All brokers patch JSON"
          />
        </div>
      )}
    </div>
  )
}
