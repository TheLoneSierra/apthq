import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { useTheme } from '../../hooks/useTheme'
import type { DashboardData } from '../../types/dashboard'
import { STRATEGY_CHANNEL_COLORS } from '../../lib/constants'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
)

function chartColors(isLight: boolean) {
  return {
    tick: isLight ? '#9ba3b0' : '#4e5668',
    grid: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.04)',
  }
}

export function DauChart({ users }: { users: DashboardData['users'] }) {
  const { isLight } = useTheme()
  const { tick, grid } = chartColors(isLight)
  const dauTrend = users?.dau_trend || []
  const labels = dauTrend.map((p) => {
    const d = new Date(p.date)
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  })
  const values = dauTrend.map((p) => p.value)

  return (
    <div
      className="relative h-[140px]"
      role="img"
      aria-label="Daily active users trend over 30 days"
    >
      <Line
        data={{
          labels,
          datasets: [
            {
              data: values,
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245,158,11,0.07)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointRadius: 0,
              pointHoverRadius: 4,
              pointHitRadius: 18,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: { legend: { display: false } },
          scales: {
            x: {
              ticks: { color: tick, font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
              grid: { display: false },
              border: { display: false },
            },
            y: {
              ticks: { color: tick, font: { size: 10 } },
              grid: { color: grid },
              border: { display: false },
            },
          },
        }}
      />
    </div>
  )
}

export function PeakHoursChart({
  peakHours,
  color,
  ariaLabel = 'Orders by time of day',
}: {
  peakHours: { slot_start: string; count?: number }[] | undefined
  color: string
  ariaLabel?: string
}) {
  const { isLight } = useTheme()
  const { tick, grid } = chartColors(isLight)
  const slots = (peakHours || []).map((p) => p.slot_start)
  const vals = (peakHours || []).map((p) => p.count || 0)
  const max = Math.max(...vals, 1)
  const barColors = vals.map((v) => (v === max ? color : `${color}99`))

  return (
    <div className="relative h-[180px]" role="img" aria-label={ariaLabel}>
      <Bar
        data={{
          labels: slots,
          datasets: [{ data: vals, backgroundColor: barColors, borderRadius: 2, borderSkipped: false }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${Number(ctx.raw).toLocaleString()} orders`,
              },
            },
          },
          scales: {
            x: {
              ticks: { color: tick, font: { size: 9 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 13 },
              grid: { display: false },
              border: { display: false },
            },
            y: {
              ticks: { color: tick, font: { size: 10 } },
              grid: { color: grid },
              border: { display: false },
            },
          },
        }}
      />
    </div>
  )
}

export function StratTrendChart({ strategies }: { strategies: DashboardData['strategies'] }) {
  const { isLight } = useTheme()
  const { tick, grid } = chartColors(isLight)
  const monthly = strategies?.monthly_trend || {}
  const months = Object.keys(monthly).sort()
  const monthLabels = months.map((m) => {
    const [y, mo] = m.split('-')
    return new Date(Number(y), Number(mo) - 1).toLocaleDateString('en-IN', { month: 'short' })
  })

  const datasets = Object.entries(STRATEGY_CHANNEL_COLORS).map(([channel, bg]) => ({
    label: channel.replace(' Import', '').replace(' Assist', ''),
    data: months.map((m) => (monthly[m] || []).find((c) => c.channel === channel)?.count || 0),
    backgroundColor: bg,
    borderRadius: 3,
    borderSkipped: false as const,
  }))

  return (
    <>
      <div className="mb-2.5 flex flex-wrap gap-3 text-[11px] text-[var(--text2)]">
        {Object.entries(STRATEGY_CHANNEL_COLORS).map(([channel, color]) => (
          <span key={channel} className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: color }} />
            {channel.replace(' Import', '').replace(' Assist', '')}
          </span>
        ))}
      </div>
      <div
        className="relative h-[140px]"
        role="img"
        aria-label="Strategy creation monthly trend by channel"
      >
        <Bar
          data={{ labels: monthLabels, datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                stacked: true,
                ticks: { color: tick, font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
                grid: { display: false },
                border: { display: false },
              },
              y: {
                stacked: true,
                ticks: { color: tick, font: { size: 10 } },
                grid: { color: grid },
                border: { display: false },
              },
            },
          }}
        />
      </div>
    </>
  )
}
