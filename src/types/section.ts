export interface SectionSlice<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}
