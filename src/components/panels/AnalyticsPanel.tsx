import { PeriodFilters } from '../layout/Layout'
import { LiveTradingSection } from '../analytics/LiveTradingSection'
import { PaperTradingSection } from '../analytics/PaperTradingSection'
import { PriorityBanner } from '../analytics/PriorityBanner'
import { StrategiesSection } from '../analytics/StrategiesSection'
import { UsersSection } from '../analytics/UsersSection'

export function AnalyticsPanel() {
  return (
    <>
      <PeriodFilters />
      <PriorityBanner />
      <UsersSection />
      <LiveTradingSection />
      <PaperTradingSection />
      <StrategiesSection />
    </>
  )
}
