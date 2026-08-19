import { useDashboard } from '../../context/DashboardContext'
import { fmt, normalizeStrategyOrders } from '../../lib/format'
import { PeakHoursChart } from '../charts/DashboardCharts'
import {
  Badge,
  ChartCard,
  LiveDot,
  MetricCard,
  SectionHeader,
  SegmentTable,
  SubLabel,
} from '../ui/Shared'
import { SectionShell } from '../ui/SectionState'
import { buildSegmentRows, icon } from './helpers'

export function LiveTradingSection() {
  const { sections } = useDashboard()
  const slice = sections.liveTrading
  const live = slice.data
  const liveSc = normalizeStrategyOrders(live?.strategies_with_orders)

  return (
    <section className="mb-[30px]" aria-labelledby="live-section-title">
      <SectionHeader
        title="Live Trading"
        titleColor="var(--live)"
        badge={<Badge variant="live"><LiveDot />Live</Badge>}
        lineColor="var(--live-bd)"
      />
      <SectionShell
        loading={slice.loading}
        error={slice.error}
        onRetry={slice.refetch}
        skeletonCount={5}
        skeletonClass="grid-kpi-5"
      >
        <div className="grid-kpi-5 mb-2.5">
          <MetricCard variant="live" label="Total Live Orders (Success and Partial)" value={fmt(live?.total_live_orders)} icon={icon.livePulse()} />
          <MetricCard variant="live" label="Unique Trading Users" value={fmt(live?.unique_trading_users)} sub="Users with live orders" icon={icon.liveUser()} />
          <MetricCard variant="live" label="Avg Orders / User" value={fmt(live?.avg_orders_per_user)} sub="Per active trader" icon={icon.liveBars()} />
          <MetricCard variant="live" label="Strategies w/ Orders" value={liveSc.display} sub={liveSc.summary || 'Active, running orders'} icon={icon.liveBolt()} />
          <MetricCard variant="live" label="Total Live Strategies" value={fmt(live?.total_live_strategies)} sub="All live (logged-in users)" icon={icon.liveGrid()} />
        </div>
        <div className="grid-split mb-2.5">
          <SegmentTable rows={buildSegmentRows(live?.segment_breakdown, '#22c55e')} color="#22c55e" borderVariant="live" />
          <ChartCard title="Live Orders — Peak Hours (Market Day)" className="m-0">
            <PeakHoursChart peakHours={live?.peak_hours} color="#22c55e" ariaLabel="Live orders by time of day" />
          </ChartCard>
        </div>
        <SubLabel>Live strategies by type</SubLabel>
        <div className="grid-kpi-3">
          <MetricCard variant="live" label="Strategy Builder — Running" value={fmt(live?.strategy_builder_running)} sub="Builder strategies live" />
          <MetricCard variant="live" label="Quick Options — Running" value={fmt(live?.quick_options_running)} sub="Quick options strategies live" />
          <MetricCard variant="live" label="TradingView — Running" value={fmt(live?.tradingview_running)} sub="TV script strategies live" />
        </div>
      </SectionShell>
    </section>
  )
}
