import { useState } from 'react'

export function CopyableTextRow({
  label,
  value,
  mono = true,
  editable = false,
  onChange,
  onRun,
  isRunning = false,
}: {
  label: string
  value: string
  mono?: boolean
  editable?: boolean
  onChange?: (value: string) => void
  onRun?: () => void
  isRunning?: boolean
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
          readOnly={!editable}
          value={value}
          onChange={editable && onChange ? (e) => onChange(e.target.value) : undefined}
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
        {onRun ? (
          <button
            type="button"
            className="btn-csv shrink-0 px-3"
            onClick={onRun}
            disabled={!value.trim() || isRunning}
          >
            {isRunning ? 'Running…' : 'Run'}
          </button>
        ) : null}
      </div>
    </div>
  )
}
