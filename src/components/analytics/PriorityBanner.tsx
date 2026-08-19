import { useDashboard } from '../../context/DashboardContext'
import { fmt, fmtTurnover } from '../../lib/format'
import { SkeletonLine } from '../ui/Skeleton'

export function PriorityBanner() {
  const { sections, loading } = useDashboard()
  const main = sections.mainActivity.data

  const items = [
    { label: 'Live Orders', value: fmt(main?.live_orders_today), sub: 'Executed' },
    { label: 'Active Live Traders', value: fmt(main?.active_live_traders), sub: 'Online with live strategies' },
    { label: 'Live Strategies Running', value: fmt(main?.live_strategies_running), sub: 'With open orders' },
    { label: 'Options Turnover', value: fmtTurnover(main?.options_turnover_cr), sub: '₹ Crore' },
    { label: 'Profitable Users', value: fmt(main?.profitable_users), sub: 'Positive P&L' },
  ]

  return (
    <div className="banner" aria-label="Live priority metrics">
      {items.map((item) => (
        <div key={item.label} className="banner-item">
          <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[rgba(34,197,94,0.55)]">
            {item.label}
          </div>
          {loading && !main ? (
            <SkeletonLine className="mb-1 h-7 w-20" />
          ) : (
            <div className="font-mono-dm text-[22px] font-semibold tracking-tight text-[var(--live)]">
              {item.value}
            </div>
          )}
          <div className="mt-0.5 text-[10px] text-[rgba(34,197,94,0.4)]">{item.sub}</div>
        </div>
      ))}
    </div>
  )
}
