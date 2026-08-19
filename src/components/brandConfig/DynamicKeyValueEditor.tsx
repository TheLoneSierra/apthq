import { useEffect, useState } from 'react'
import {
  flattenObject,
  isHexColor,
  unflattenEntries,
  type KeyValueEntry,
} from '../../lib/jsonFlatten'
import { formatBrandConfigJson } from '../../lib/brandConfigApi'

interface DynamicKeyValueEditorProps {
  jsonString: string
  onChange: (newJsonString: string) => void
  label?: string
  ariaLabel?: string
}

export function DynamicKeyValueEditor({
  jsonString,
  onChange,
  label = 'Config Fields',
  ariaLabel = 'Dynamic Form Editor',
}: DynamicKeyValueEditorProps) {
  const [mode, setMode] = useState<'form' | 'json'>('form')
  const [entries, setEntries] = useState<KeyValueEntry[]>([])
  const [parseError, setParseError] = useState<string | null>(null)

  // Sync entries whenever incoming jsonString changes
  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonString || '{}') as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        setEntries(flattenObject(parsed as Record<string, unknown>))
        setParseError(null)
      } else {
        setEntries([])
      }
    } catch {
      setParseError('Invalid JSON structure')
    }
  }, [jsonString])

  const syncEntriesToJson = (updated: KeyValueEntry[]) => {
    setEntries(updated)
    const newObj = unflattenEntries(updated)
    const formatted = formatBrandConfigJson(newObj)
    onChange(formatted)
  }

  const handleKeyChange = (index: number, newKey: string) => {
    const updated = [...entries]
    updated[index] = { ...updated[index], key: newKey }
    syncEntriesToJson(updated)
  }

  const handleValueChange = (index: number, newValue: string) => {
    const updated = [...entries]
    const current = updated[index]
    let detectedType = current.type

    // Auto-detect color or boolean if type is still string
    if (detectedType === 'string' || detectedType === 'color') {
      if (isHexColor(newValue)) {
        detectedType = 'color'
      } else if (detectedType === 'color' && !isHexColor(newValue)) {
        detectedType = 'string'
      }
    }

    updated[index] = {
      ...current,
      value: newValue,
      type: detectedType,
    }
    syncEntriesToJson(updated)
  }

  const handleTypeChange = (index: number, newType: KeyValueEntry['type']) => {
    const updated = [...entries]
    let val = updated[index].value
    if (newType === 'color' && !val.startsWith('#')) {
      val = '#8b5cf6'
    } else if (newType === 'boolean') {
      val = val.toLowerCase() === 'true' ? 'true' : 'false'
    }
    updated[index] = { ...updated[index], type: newType, value: val }
    syncEntriesToJson(updated)
  }

  const handleAddEntry = (initialKey = '', initialValue = '', type: KeyValueEntry['type'] = 'string') => {
    const newEntry: KeyValueEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      key: initialKey,
      value: initialValue,
      type: isHexColor(initialValue) ? 'color' : type,
    }
    const updated = [...entries, newEntry]
    syncEntriesToJson(updated)
  }

  const handleDeleteEntry = (index: number) => {
    const updated = entries.filter((_, i) => i !== index)
    syncEntriesToJson(updated)
  }

  return (
    <div className="rounded-lg border border-[var(--border2)] bg-[var(--s2)] p-3" aria-label={ariaLabel}>
      {/* Header bar with Mode switcher */}
      <div className="mb-3 flex items-center justify-between border-b border-[var(--border2)] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text)]">{label}</span>
          <span className="rounded-full bg-[var(--s1)] px-2 py-0.5 font-mono-dm text-[10px] text-[var(--text3)]">
            {entries.length} {entries.length === 1 ? 'field' : 'fields'}
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
        <div className="space-y-2.5">
          {parseError && (
            <div className="rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-[var(--red)]">
              {parseError} — switch to Raw JSON to fix syntax errors.
            </div>
          )}

          {entries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--border2)] p-6 text-center">
              <p className="mb-2 text-xs text-[var(--text3)]">No fields yet. Add a key-value pair below.</p>
              <button
                type="button"
                onClick={() => handleAddEntry('key', 'smc')}
                className="btn-csv inline-flex items-center gap-1 text-xs"
              >
                + Add First Field
              </button>
            </div>
          ) : (
            <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {entries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-2 rounded-lg border border-[var(--border2)] bg-[var(--s1)] p-2.5 transition-all hover:border-[var(--pur-bd)] sm:flex-row sm:items-center"
                >
                  {/* Key input */}
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--text3)]">
                      Key Name
                    </label>
                    <input
                      type="text"
                      value={entry.key}
                      onChange={(e) => handleKeyChange(idx, e.target.value)}
                      placeholder="e.g. colors.primary"
                      className="h-7 w-full rounded border border-[var(--border2)] bg-[var(--s2)] px-2 font-mono-dm text-xs text-[var(--text)] outline-none focus:border-[var(--purple)]"
                    />
                  </div>

                  {/* Type selector */}
                  <div className="w-full sm:w-24">
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--text3)]">
                      Type
                    </label>
                    <select
                      value={entry.type}
                      onChange={(e) => handleTypeChange(idx, e.target.value as KeyValueEntry['type'])}
                      className="h-7 w-full rounded border border-[var(--border2)] bg-[var(--s2)] px-1.5 font-mono-dm text-[11px] text-[var(--text2)] outline-none focus:border-[var(--purple)]"
                    >
                      <option value="string">Text</option>
                      <option value="color">Color</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="json">JSON/Array</option>
                    </select>
                  </div>

                  {/* Value input */}
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--text3)]">
                      Value
                    </label>
                    <div className="flex items-center gap-1.5">
                      {entry.type === 'color' && (
                        <input
                          type="color"
                          value={isHexColor(entry.value) ? entry.value : '#8b5cf6'}
                          onChange={(e) => handleValueChange(idx, e.target.value)}
                          className="h-7 w-7 cursor-pointer rounded border border-[var(--border2)] bg-transparent p-0 outline-none"
                          title="Pick color"
                        />
                      )}

                      {entry.type === 'boolean' ? (
                        <select
                          value={entry.value.toLowerCase() === 'true' ? 'true' : 'false'}
                          onChange={(e) => handleValueChange(idx, e.target.value)}
                          className="h-7 w-full rounded border border-[var(--border2)] bg-[var(--s2)] px-2 font-mono-dm text-xs text-[var(--text)] outline-none focus:border-[var(--purple)]"
                        >
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : (
                        <input
                          type={entry.type === 'number' ? 'number' : 'text'}
                          value={entry.value}
                          onChange={(e) => handleValueChange(idx, e.target.value)}
                          placeholder="Value (no quotes needed)"
                          className="h-7 w-full rounded border border-[var(--border2)] bg-[var(--s2)] px-2 font-mono-dm text-xs text-[var(--text)] outline-none focus:border-[var(--purple)]"
                        />
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <div className="pt-2 sm:pt-4">
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(idx)}
                      title="Remove field"
                      className="flex h-7 w-7 items-center justify-center rounded border border-transparent text-[var(--text3)] transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-[var(--red)]"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action toolbar to add new keys or common presets */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border2)] pt-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAddEntry('', '')}
                className="btn-csv text-xs font-medium"
              >
                + Add Field
              </button>

              <span className="mx-1 text-xs text-[var(--text3)]">| Presets:</span>

              <button
                type="button"
                onClick={() => handleAddEntry('colors.primary', '#8b5cf6', 'color')}
                className="rounded border border-[var(--border2)] bg-[var(--s1)] px-2 py-1 font-mono-dm text-[11px] text-[var(--text2)] transition-colors hover:border-[var(--purple)] hover:text-white"
              >
                + Primary Color
              </button>
              <button
                type="button"
                onClick={() => handleAddEntry('typography.fontSans', '"Inter", sans-serif', 'string')}
                className="rounded border border-[var(--border2)] bg-[var(--s1)] px-2 py-1 font-mono-dm text-[11px] text-[var(--text2)] transition-colors hover:border-[var(--purple)] hover:text-white"
              >
                + Typography
              </button>
              <button
                type="button"
                onClick={() => handleAddEntry('colors.background', '#0b0f19', 'color')}
                className="rounded border border-[var(--border2)] bg-[var(--s1)] px-2 py-1 font-mono-dm text-[11px] text-[var(--text2)] transition-colors hover:border-[var(--purple)] hover:text-white"
              >
                + Background Color
              </button>
            </div>

            <p className="text-[11px] text-[var(--text3)]">
              No quotes needed — auto-converts to clean JSON.
            </p>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-1.5 text-[11px] text-[var(--text3)]">
            Direct raw JSON editing (quotes and brackets required):
          </p>
          <textarea
            value={jsonString}
            onChange={(e) => onChange(e.target.value)}
            rows={12}
            spellCheck={false}
            className="w-full rounded-lg border border-[var(--border2)] bg-[var(--s1)] p-3 font-mono-dm text-[11px] leading-snug text-[var(--text2)] outline-none focus:border-[var(--purple)]"
            aria-label="Raw config JSON editor"
          />
        </div>
      )}
    </div>
  )
}
