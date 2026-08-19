import { useDashboard } from '../../context/DashboardContext'
import { fmt, normalizeStrategyOrders } from '../../lib/format'
import { PeakHoursChart } from '../charts/DashboardCharts'
import {
  Badge,
  ChartCard,
  MetricCard,
  MetricCell,
  SectionHeader,
  SegmentTable,
  SubLabel,
} from '../ui/Shared'
import { SectionShell } from '../ui/SectionState'
import { buildSegmentRows, icon } from './helpers'

export function PaperTradingSection() {
  const { sections } = useDashboard()
  const slice = sections.paperTrading
  const paper = slice.data
  const paperSc = normalizeStrategyOrders(
    paper?.strategies_with_orders ?? paper?.strategies_with_practice_orders,
  )

  return (
    <section className="mb-[30px]" aria-labelledby="paper-section-title">
      <SectionHeader
        title="Paper Trading"
        titleColor="var(--prac)"
        badge={<Badge variant="prac">Practice Mode</Badge>}
        lineColor="var(--prac-bd)"
      />
      <SectionShell
        loading={slice.loading}
        error={slice.error}
        onRetry={slice.refetch}
        skeletonCount={5}
        skeletonClass="grid-kpi-5"
      >
        <div className="grid-kpi-5 mb-2.5">
          <MetricCard variant="prac" label="Total Practice Orders" value={fmt(paper?.total_practice_orders)} sub="Simulated only" icon={icon.pracPulse()} />
          <MetricCard variant="prac" label="Unique Practice Users" value={fmt(paper?.unique_practice_users)} sub="Users with practice orders" icon={icon.pracUser()} />
          <MetricCard variant="prac" label="Avg Orders / User" value={fmt(paper?.avg_orders_per_user)} sub="Per practice trader" icon={icon.pracBars()} />
          <MetricCard variant="prac" label="Strategies w/ Orders" icon={icon.pracBolt()}>
            <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <MetricCell label="Active" value={fmt(paperSc.metrics.active)} />
              <MetricCell label="All" value={fmt(paperSc.metrics.all)} />
              <MetricCell label="Executed" value={fmt(paperSc.metrics.executed)} />
              <MetricCell label="Failed" value={fmt(paperSc.metrics.failed)} />
            </div>
          </MetricCard>
          <MetricCard variant="prac" label="Total Practice Strategies" value={fmt(paper?.total_practice_strategies)} sub="All practice strategies" icon={icon.pracGrid()} />
        </div>
        <div className="grid-split mb-2.5">
          <SegmentTable rows={buildSegmentRows(paper?.segment_breakdown, '#3b82f6')} color="#3b82f6" borderVariant="prac" />
          <ChartCard title="Practice Orders — Peak Hours (Market Day)" className="m-0">
            <PeakHoursChart peakHours={paper?.peak_hours} color="#3b82f6" ariaLabel="Practice orders by time of day" />
          </ChartCard>
        </div>
        <SubLabel>Practice strategies by type</SubLabel>
        <div className="grid-kpi-3">
          <MetricCard variant="prac" label="Strategy Builder — Active" value={fmt(paper?.strategy_builder_active)} sub="Builder strategies in practice" />
          <MetricCard variant="prac" label="Quick Options — Active" value={fmt(paper?.quick_options_active)} sub="Quick options strategies in practice" />
          <MetricCard variant="prac" label="TradingView — Active" value={fmt(paper?.tradingview_active)} sub="TV script strategies in practice" />
        </div>
      </SectionShell>
    </section>
  )
}
