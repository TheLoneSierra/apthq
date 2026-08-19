type SkeletonProps = {
  className?: string
}

export function SkeletonLine({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--s3)] ${className}`}
      aria-hidden
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="card c-base" aria-hidden>
      <SkeletonLine className="mb-2.5 h-7 w-7" />
      <SkeletonLine className="mb-2 h-3 w-2/3" />
      <SkeletonLine className="h-6 w-1/2" />
    </div>
  )
}

export function SkeletonGrid({
  count = 4,
  className = 'grid-kpi-4',
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={className} aria-busy="true" aria-label="Loading metrics">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function PanelFallback() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading panel">
      <SkeletonLine className="h-8 w-full max-w-xl" />
      <SkeletonGrid count={5} className="grid-kpi-5" />
      <SkeletonGrid count={4} />
    </div>
  )
}
