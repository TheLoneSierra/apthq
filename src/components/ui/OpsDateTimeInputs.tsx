import { useEffect, useMemo, useRef, useState } from 'react'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function parseIsoDate(value: string): Date | null {
  const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDisplayDate(value: string): string {
  const d = parseIsoDate(value)
  if (!d) return value || 'Select date'
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

function buildCalendarDays(view: Date) {
  const first = new Date(view.getFullYear(), view.getMonth(), 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
  const cells: { date: Date; inMonth: boolean }[] = []

  for (let i = startPad - 1; i >= 0; i -= 1) {
    cells.push({
      date: new Date(view.getFullYear(), view.getMonth(), -i),
      inMonth: false,
    })
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      date: new Date(view.getFullYear(), view.getMonth(), day),
      inMonth: true,
    })
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1].date
    const next = new Date(last)
    next.setDate(last.getDate() + 1)
    cells.push({ date: next, inMonth: false })
  }
  return cells
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function OpsDateInput({
  value,
  onChange,
  'aria-label': ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  'aria-label'?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = parseIsoDate(value)
  const [view, setView] = useState(() => selected || new Date())
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const next = parseIsoDate(value)
    if (next) setView(next)
  }, [value])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const cells = useMemo(() => buildCalendarDays(view), [view])
  const today = new Date()

  return (
    <div ref={rootRef} className="ops-dt-root relative min-w-0 flex-1">
      <button
        type="button"
        aria-label={ariaLabel || 'Pick date'}
        aria-expanded={open}
        className="ops-dt-trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={value ? 'text-[var(--text)]' : 'text-[var(--text3)]'}>
          {formatDisplayDate(value)}
        </span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect
            x="2"
            y="3"
            width="12"
            height="11"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path d="M2 6.5h12M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>

      {open && (
        <div className="ops-dt-popover" role="dialog" aria-label="Calendar">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <button
              type="button"
              className="ops-dt-nav"
              aria-label="Previous month"
              onClick={() =>
                setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))
              }
            >
              ‹
            </button>
            <div className="text-xs font-semibold text-[var(--text)]">{monthLabel(view)}</div>
            <button
              type="button"
              className="ops-dt-nav"
              aria-label="Next month"
              onClick={() =>
                setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))
              }
            >
              ›
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {DAYS.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--text3)]"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map(({ date, inMonth }) => {
              const iso = toIsoDate(date)
              const isSelected = selected ? sameDay(date, selected) : false
              const isToday = sameDay(date, today)
              return (
                <button
                  key={iso + String(inMonth)}
                  type="button"
                  className={`ops-dt-day ${inMonth ? '' : 'out'} ${isSelected ? 'selected' : ''} ${isToday && !isSelected ? 'today' : ''}`}
                  onClick={() => {
                    onChange(iso)
                    setOpen(false)
                  }}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-[var(--border)] pt-2">
            <button
              type="button"
              className="ops-dt-footer-btn"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="ops-dt-footer-btn accent"
              onClick={() => {
                onChange(toIsoDate(today))
                setView(today)
                setOpen(false)
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

function TimeColumn({
  label,
  options,
  value,
  onSelect,
}: {
  label: string
  options: string[]
  value: string
  onSelect: (value: string) => void
}) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const selected = list.querySelector<HTMLElement>('[data-selected="true"]')
    if (!selected) return
    list.scrollTop =
      selected.offsetTop - list.clientHeight / 2 + selected.clientHeight / 2
  }, [value])

  return (
    <div className="flex min-w-0 flex-1 flex-col items-stretch gap-1">
      <div className="text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--text3)]">
        {label}
      </div>
      <div ref={listRef} className="ops-dt-time-column" role="listbox" aria-label={label}>
        {options.map((opt) => {
          const selected = opt === value
          return (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={selected}
              data-selected={selected ? 'true' : undefined}
              className={`ops-dt-time-option font-mono-dm ${selected ? 'selected' : ''}`}
              onClick={() => onSelect(opt)}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function OpsTimeInput({
  value,
  onChange,
  'aria-label': ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  'aria-label'?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const [hours, minutes] = (value || '00:00').split(':')
  const hour = hours?.padStart(2, '0') || '00'
  const minute = (minutes || '00').slice(0, 2).padStart(2, '0')

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const setPart = (nextHour: string, nextMinute: string) => {
    onChange(`${nextHour.padStart(2, '0')}:${nextMinute.padStart(2, '0')}`)
  }

  return (
    <div ref={rootRef} className="ops-dt-root relative w-[108px] shrink-0">
      <button
        type="button"
        aria-label={ariaLabel || 'Pick time'}
        aria-expanded={open}
        className="ops-dt-trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-mono-dm text-[var(--text)]">{value || '--:--'}</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M8 4.5V8l2.5 1.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="ops-dt-popover ops-dt-time-popover" role="dialog" aria-label="Time">
          <div className="flex items-stretch gap-2">
            <TimeColumn
              label="Hour"
              options={HOURS}
              value={hour}
              onSelect={(h) => setPart(h, minute)}
            />
            <div className="flex items-center pt-5 text-base text-[var(--text3)]">:</div>
            <TimeColumn
              label="Min"
              options={MINUTES}
              value={minute}
              onSelect={(m) => setPart(hour, m)}
            />
          </div>
          <button
            type="button"
            className="ops-dt-footer-btn accent mt-3 w-full"
            onClick={() => setOpen(false)}
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}
