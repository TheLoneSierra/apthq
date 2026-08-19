import { useDashboard } from '../../context/DashboardContext'
import { fmt } from '../../lib/format'
import { StratTrendChart } from '../charts/DashboardCharts'
import {
  Badge,
  ChartCard,
  MetricCard,
  SectionHeader,
  SubLabel,
} from '../ui/Shared'
import { SectionShell } from '../ui/SectionState'
import { icon } from './helpers'

export function StrategiesSection() {
  const { sections } = useDashboard()
  const slice = sections.strategies
  const strategies = slice.data

  const channelCount = (name: string) =>
    fmt(
      strategies?.creation_by_channel?.find((c) => c.channel === name)
        ?.strategies_count ?? null,
    )

  return (
    <section className="mb-[30px]" aria-labelledby="strategies-section-title">
      <SectionHeader
        title="Strategies"
        titleColor="var(--purple)"
        badge={<Badge variant="strat">All Modes</Badge>}
        lineColor="var(--pur-bd)"
      />
      <SectionShell
        loading={slice.loading}
        error={slice.error}
        onRetry={slice.refetch}
        skeletonCount={4}
      >
        <SubLabel>Creation</SubLabel>
        <div className="grid-kpi-4 mb-3.5">
          <MetricCard variant="base" label="Total Strategies Created" value={fmt(strategies?.total_strategies_created)} icon={icon.purpleEdit()} />
          <MetricCard variant="base" label="Unique Strategy Creators" value={fmt(strategies?.unique_strategy_creators)} sub="Users who created strategies" icon={icon.purpleUsers()} />
          <MetricCard variant="base" label="AI-Assisted Strategies" value={fmt(strategies?.ai_assisted_strategies)} sub="Built with AI help" icon={icon.purpleSpark()} />
          <MetricCard variant="base" label="Manually Built Strategies" value={fmt(strategies?.manually_built_strategies)} sub="User-configured" icon={icon.purpleDoc()} />
        </div>
        <SubLabel>By Channel</SubLabel>
        <div className="grid-kpi-3 mb-3.5">
          <MetricCard variant="base" label="Strategy Builder" value={channelCount('Strategy Builder')} sub="Drag-drop builder" icon={icon.purpleGrid()} />
          <MetricCard variant="base" label="TradingView Import" value={channelCount('TradingView Import')} sub="From TradingView scripts" icon={icon.purpleTv()} />
          <MetricCard variant="base" label="Quick Options" value={channelCount('Quick Options')} sub="Quick options builder" icon={icon.purpleClock()} />
        </div>
        <SubLabel>Lifecycle</SubLabel>
        <div className="grid-kpi-4 mb-3.5">
          <MetricCard variant="base" label="Strategies Deleted" value={fmt(strategies?.strategies_deleted)} icon={icon.purpleTrash()} />
          <MetricCard variant="base" label="Strategies Duplicated" value={fmt(strategies?.strategies_duplicated)} icon={icon.purpleCopy()} />
          <MetricCard variant="base" label="Marketplace Subscriptions" value={fmt(strategies?.marketplace_subscriptions)} icon={icon.purpleHeart()} />
          <MetricCard variant="base" label="Marketplace Unsubscribed" value={fmt(strategies?.marketplace_unsubscribed)} icon={icon.purpleHeartOff()} />
        </div>
        <SubLabel>Backtesting</SubLabel>
        <div className="grid-split">
          <div className="grid-kpi-2">
            <MetricCard variant="base" label="Backtests Executed" value={fmt(strategies?.backtests_executed)} sub="Total backtest runs" icon={icon.purpleBacktest()} />
            <MetricCard variant="danger" label="Backtest Failures" value={fmt(strategies?.backtest_failures)} icon={icon.redAlert()} />
          </div>
          <ChartCard title="Strategy Creation — Monthly Trend by Type" className="m-0">
            <StratTrendChart strategies={strategies ?? null} />
          </ChartCard>
        </div>
      </SectionShell>
    </section>
  )
}
