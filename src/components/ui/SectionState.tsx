import type { ReactNode } from 'react'
import { SkeletonGrid } from './Skeleton'

export function SectionError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div
      className="mb-3 rounded-[var(--rlg)] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)] px-4 py-3 text-xs text-[var(--text2)]"
      role="alert"
    >
      <span>{message}</span>
      <button
        type="button"
        className="act-btn act-btn-primary ml-2"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  )
}

export function SectionShell({
  loading,
  error,
  onRetry,
  skeletonCount = 4,
  skeletonClass = 'grid-kpi-4',
  children,
}: {
  loading: boolean
  error: string | null
  onRetry: () => void
  skeletonCount?: number
  skeletonClass?: string
  children: ReactNode
}) {
  if (loading && !error) {
    return <SkeletonGrid count={skeletonCount} className={skeletonClass} />
  }

  return (
    <>
      {error && (
        <SectionError message={`Failed to load: ${error}`} onRetry={onRetry} />
      )}
      {!error && children}
    </>
  )
}
