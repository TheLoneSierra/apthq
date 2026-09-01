import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardProvider, useDashboard } from './context/DashboardContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { FooterBar, SubTabs, TopNav } from './components/layout/Layout'
import { PanelFallback } from './components/ui/Skeleton'

const AnalyticsPanel = lazy(() =>
  import('./components/panels/AnalyticsPanel').then((m) => ({
    default: m.AnalyticsPanel,
  })),
)
const TechPanel = lazy(() =>
  import('./components/panels/TechPanel').then((m) => ({ default: m.TechPanel })),
)
const HealthCheckPanel = lazy(() =>
  import('./components/panels/HealthCheckPanel').then((m) => ({
    default: m.HealthCheckPanel,
  })),
)
const BrandConfigPanel = lazy(() =>
  import('./components/panels/BrandConfigPanel').then((m) => ({
    default: m.BrandConfigPanel,
  })),
)
const HealthCheckV3Panel = lazy(() =>
  import('./components/panels/HealthCheckV3Panel').then((m) => ({
    default: m.HealthCheckV3Panel,
  })),
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 300_000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
})

function TabPanel() {
  const { activeTab } = useDashboard()

  const panel = {
    analytics: (
      <ErrorBoundary label="Analytics">
        <AnalyticsPanel />
      </ErrorBoundary>
    ),
    tech: (
      <ErrorBoundary label="Tech & System">
        <TechPanel />
      </ErrorBoundary>
    ),
    healthcheck: (
      <ErrorBoundary label="Health Check">
        <HealthCheckPanel />
      </ErrorBoundary>
    ),
    brandconfig: (
      <ErrorBoundary label="Brand Config">
        <BrandConfigPanel />
      </ErrorBoundary>
    ),
    healthcheckv3: (
      <ErrorBoundary label="Health Check v3">
        <HealthCheckV3Panel />
      </ErrorBoundary>
    ),
  }[activeTab]

  return (
    <Suspense fallback={<PanelFallback />}>
      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {panel}
      </div>
    </Suspense>
  )
}

function DashboardShell() {
  return (
    <>
      <TopNav />
      <SubTabs />
      <main className="px-4 pb-20 pt-4 sm:px-6 sm:pb-[60px] sm:pt-[22px]">
        <TabPanel />
      </main>
      <FooterBar />
    </>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardProvider>
        <DashboardShell />
      </DashboardProvider>
    </QueryClientProvider>
  )
}

export default App
