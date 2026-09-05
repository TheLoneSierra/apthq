import { useEffect, useRef, useState } from 'react'
import { BROKER_COLORS } from '../../lib/constants'
import type { BrokerKey } from '../../types/dashboard'

type BrokerOption = { value: BrokerKey; label: string }

export function BrokerSelect({
  value,
  options,
  onChange,
  brokerColor,
}: {
  value: BrokerKey
  options: BrokerOption[]
  onChange: (broker: BrokerKey) => void
  brokerColor: string
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value) ?? options[0]

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const pick = (broker: BrokerKey) => {
    onChange(broker)
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative min-w-0 max-w-[140px] sm:max-w-none">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-[34px] w-full min-w-[120px] cursor-pointer items-center gap-2 rounded-lg border border-[var(--border2)] bg-[var(--s2)] px-2.5 text-left transition-colors duration-150 hover:border-[var(--border3)] hover:bg-[var(--s3)] sm:min-w-[148px] sm:px-3"
      >
        <div
          className="h-[7px] w-[7px] shrink-0 rounded-full transition-colors duration-300"
          style={{ background: brokerColor }}
        />
        <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[var(--text)] sm:text-[13px]">
          {selected?.label ?? value}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-[var(--text3)] transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select broker"
          className="broker-select-menu absolute left-0 top-[calc(100%+6px)] z-[300] min-w-full overflow-hidden rounded-[var(--rlg)] border border-[var(--border2)] bg-[var(--s1)] py-1 shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
        >
          {options.map((option) => {
            const isActive = option.value === value
            const dotColor = BROKER_COLORS[option.value] ?? BROKER_COLORS.all
            return (
              <li key={option.value} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => pick(option.value)}
                  className={`flex w-full cursor-pointer items-center gap-2.5 border-none px-3 py-2 text-left text-[12px] font-medium transition-colors duration-150 sm:text-[13px] ${
                    isActive
                      ? 'bg-[var(--pur-dim)] text-[var(--purple)]'
                      : 'bg-transparent text-[var(--text2)] hover:bg-[var(--s2)] hover:text-[var(--text)]'
                  }`}
                >
                  <div
                    className="h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{ background: dotColor }}
                  />
                  <span className="truncate">{option.label}</span>
                  {isActive ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-auto shrink-0 text-[var(--purple)]"
                      aria-hidden
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
