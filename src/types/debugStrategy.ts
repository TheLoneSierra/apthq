export type DebugStrategyParams = {
  strategyId: string
  sessionId: string
}

export interface DebugStrategyResult {
  ok: boolean
  status: number
  body: unknown
}

export interface DebugStrategyFieldRow {
  key: string
  value: string
  isJson: boolean
  payload: unknown
}
