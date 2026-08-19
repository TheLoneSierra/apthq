import { useDashboard } from '../../context/DashboardContext'
import { fmt } from '../../lib/format'
import { DauChart } from '../charts/DashboardCharts'
import { Badge, ChartCard, MetricCard, SectionHeader, SubLabel } from '../ui/Shared'
import { SectionShell } from '../ui/SectionState'
import { icon } from './helpers'

export function UsersSection() {
  const { sections } = useDashboard()
  const slice = sections.users
  const users = slice.data

  return (
    <section className="mb-[30px]" aria-labelledby="users-section-title">
      <SectionHeader
        title="Users"
        titleColor="var(--amber)"
        badge={<Badge variant="user">Platform</Badge>}
      />
      <SectionShell
        loading={slice.loading}
        error={slice.error}
        onRetry={slice.refetch}
        skeletonCount={4}
      >
        <div className="grid-kpi-4 mb-2.5">
          <MetricCard variant="user" label="Total Registered Users" value={fmt(users?.total_registered_users)} icon={icon.user()} />
          <MetricCard variant="user" label="Users with Live Setup" value={fmt(users?.currently_online)} sub="Configured live in selected range" icon={icon.userClock()} />
          <MetricCard variant="user" label="Logged in selected range" value={fmt(users?.live_active_users)} sub="Online with live strategies" icon={icon.userLive()} />
          <MetricCard variant="user" label="Paper Trade Users" value={fmt(users?.paper_trade_users)} sub="Online, practice mode" icon={icon.userPrac()} />
        </div>
        <div className="grid-kpi-4">
          <MetricCard variant="user" label="Avg Daily Users" value={fmt(users?.avg_daily_users)} sub="DAU average this period" icon={icon.user()} />
          <MetricCard variant="user" label="Peak Daily Users" value={fmt(users?.peak_daily_users)} sub="Highest DAU in period" icon={icon.user()} />
          <MetricCard variant="user" label="Minimum Daily Users" value={fmt(users?.minimum_daily_users)} sub="Lowest DAU in period" icon={icon.user()} />
          <MetricCard variant="user" label="User Profitability Split">
            <div className="mt-1.5 flex gap-4">
              <div>
                <div className="mb-[3px] text-[10px] font-semibold uppercase tracking-wide text-[var(--live)]">Profitable</div>
                <div className="font-mono-dm text-lg font-semibold text-[var(--live)]">{fmt(users?.profitable_users)}</div>
              </div>
              <div>
                <div className="mb-[3px] text-[10px] font-semibold uppercase tracking-wide text-[var(--red)]">Loss</div>
                <div className="font-mono-dm text-lg font-semibold text-[var(--red)]">{fmt(users?.loss_or_flat_users)}</div>
              </div>
            </div>
          </MetricCard>
        </div>
        <SubLabel className="mt-2.5">Average User Life</SubLabel>
        <div className="grid-kpi-4">
          <MetricCard variant="user" label="Average Life (Days)" value={fmt(users?.average_user_life?.avg_life_days)} />
          <MetricCard variant="user" label="Users Counted" value={fmt(users?.average_user_life?.total_users)} />
          <MetricCard variant="user" label="Minimum Life (Days)" value={fmt(users?.average_user_life?.min_life_days)} />
          <MetricCard variant="user" label="Maximum Life (Days)" value={fmt(users?.average_user_life?.max_life_days)} />
        </div>
        <ChartCard title="Daily Active Users — 30 Day Trend" className="mt-2.5">
          <DauChart users={users ?? null} />
        </ChartCard>
      </SectionShell>
    </section>
  )
}
