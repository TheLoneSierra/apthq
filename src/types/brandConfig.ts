export type BrandConfigObject = Record<string, unknown>

export interface BrandConfigEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export interface BrokerBrandConfig {
  brokerName: string
  config: BrandConfigObject
}

export interface PatchAllConfigsBody {
  configs: BrokerBrandConfig[]
}

export interface BrandConfigApiError {
  status: number
  message: string
}
