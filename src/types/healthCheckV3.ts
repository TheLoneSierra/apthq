export interface HealthV3Section {
  status: string
  message: string
  details?: Record<string, unknown>
  errors?: string[]
}

export interface HealthV3Data {
  status: string
  message: string
  sections: Record<string, HealthV3Section>
}

export interface HealthV3Response {
  success: boolean
  message: string
  data: HealthV3Data
}

export interface HealthV3Row {
  section: string
  label: string
  status: string
  message: string
  detail: string
  chipCls: 'ok' | 'warn' | 'err'
  chipLabel: string
  payload: HealthV3Section
}

export interface HealthV3Stats {
  rows: HealthV3Row[]
  total: number
  ok: number
  issues: number
  overallStatus: string
  overallMessage: string
  apiSuccess: boolean
}

export interface HealthV3BrokerRow {
  broker: string
  label: string
  stats: HealthV3Stats
  chipCls: 'ok' | 'warn' | 'err'
  chipLabel: string
  payload: unknown
}

export interface HealthV3ViewModel {
  mode: 'sections' | 'brokers'
  broker: string
  rows: HealthV3Row[]
  brokerRows: HealthV3BrokerRow[]
  total: number
  ok: number
  issues: number
  overallStatus: string
  overallMessage: string
  apiSuccess: boolean
}
