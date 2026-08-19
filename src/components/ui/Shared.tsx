import type { ReactNode } from 'react'

type BadgeVariant = 'live' | 'prac' | 'strat' | 'user'

const variantClass: Record<BadgeVariant, string> = {
  live: 'b-live',
  prac: 'b-prac',
  strat: 'b-strat',
  user: 'b-user',
}

export function Badge({
  variant,
  children,
  className = '',
}: {
  variant: BadgeVariant
  children: ReactNode
  className?: string
}) {
  return (
    <span className={`badge ${variantClass[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function LiveDot({ size = 5 }: { size?: number }) {
  return (
    <div
      className="ldot rounded-full bg-[var(--live)]"
      style={{ width: size, height: size }}
    />
  )
}

export function SectionHeader({
  title,
  titleColor,
  badge,
  lineColor,
  actions,
}: {
  title: string
  titleColor: string
  badge: ReactNode
  lineColor?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-3.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.8px]"
          style={{ color: titleColor }}
        >
          {title}
        </span>
        {badge}
      </div>
      <div
        className="hidden h-px flex-1 sm:block"
        style={{ background: lineColor || 'var(--border)' }}
      />
      {actions && <div className="w-full sm:w-auto">{actions}</div>}
    </div>
  )
}

export function SubLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mb-2 pl-0.5 text-[10px] font-semibold uppercase tracking-[0.7px] text-[var(--text3)] ${className}`}>
      {children}
    </div>
  )
}

export function MetricCard({
  variant,
  label,
  value,
  sub,
  icon,
  children,
}: {
  variant: 'live' | 'prac' | 'base' | 'user' | 'danger'
  label: string
  value?: string
  sub?: string
  icon?: ReactNode
  children?: ReactNode
}) {
  const cardClass = {
    live: 'c-live',
    prac: 'c-prac',
    base: 'c-base',
    user: 'c-user',
    danger: 'c-danger',
  }[variant]

  return (
    <div className={`card ${cardClass}`}>
      {icon && (
        <div className="mb-2.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
          {icon}
        </div>
      )}
      <div className="mb-1.5 text-[11px] font-medium leading-snug text-[var(--text2)]">
        {label}
      </div>
      {value != null && (
        <div className="font-mono-dm text-xl font-semibold tracking-tight text-[var(--text)">
          {value}
        </div>
      )}
      {sub && (
        <div className="mt-[3px] text-[11px] text-[var(--text3)]">{sub}</div>
      )}
      {children}
    </div>
  )
}

export function ChartCard({
  title,
  children,
  actions,
  className = '',
}: {
  title: string
  children: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-[var(--rlg)] border border-[var(--border)] bg-[var(--s1)] p-[18px] ${className}`}
    >
      {actions ? (
        <div className="mb-3.5 flex flex-wrap items-center gap-2">
          <div className="flex-1 text-xs font-medium text-[var(--text2)]">{title}</div>
          {actions}
        </div>
      ) : (
        <div className="mb-3.5 text-xs font-medium text-[var(--text2)]">{title}</div>
      )}
      {children}
    </div>
  )
}

export function Pill({
  variant,
  children,
  mono = false,
}: {
  variant: 'green' | 'red' | 'amber' | 'blue' | 'gray'
  children: ReactNode
  mono?: boolean
}) {
  return (
    <span className={`pill pill-${variant} ${mono ? 'font-mono-dm' : ''}`}>
      {children}
    </span>
  )
}

export function MetricCell({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="metric-cell">
      <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-[var(--text3)]">
        {label}
      </span>
      <span className="font-mono-dm block text-base font-semibold tracking-tight text-[var(--text)]">
        {value}
      </span>
    </div>
  )
}

export function SegmentTable({
  rows,
  color,
  borderVariant,
}: {
  rows: { segment: string; orders: string; turnover: string; share: string; isTotal?: boolean }[]
  color: string
  borderVariant: 'live' | 'prac'
}) {
  const borderClass = borderVariant === 'live' ? 'border-[var(--live-bd)]' : 'border-[var(--prac-bd)]'
  const badgeVariant = borderVariant === 'live' ? 'live' : 'prac'

  return (
    <div className={`overflow-hidden rounded-[var(--rlg)] border bg-[var(--s1)] ${borderClass}`}>
      <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3">
        <Badge variant={badgeVariant} className="text-[9px]">
          {borderVariant === 'live' ? 'Live' : 'Practice'}
        </Badge>
        <div className="text-xs font-medium text-[var(--text2)]">
          Order Breakdown by Segment
        </div>
      </div>
      <div className="table-scroll">
        <table className="dtable">
        <thead>
          <tr>
            <th>Segment</th>
            <th>Orders</th>
            <th>Turnover ₹Cr</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-[var(--text3)]">
                No segment data
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.segment}
                style={
                  row.isTotal
                    ? {
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.02)',
                      }
                    : undefined
                }
              >
                <td style={row.isTotal ? { fontWeight: 600, color: 'var(--text)' } : undefined}>
                  {row.segment}
                </td>
                <td className="font-mono-dm" style={{ color }}>
                  {row.orders}
                </td>
                <td className="font-mono-dm">{row.turnover}</td>
                <td style={{ color: row.isTotal ? 'var(--text2)' : 'var(--text3)', fontWeight: row.isTotal ? 600 : undefined }}>
                  {row.share}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}
