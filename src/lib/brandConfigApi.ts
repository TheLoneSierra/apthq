import { API_BASE } from './constants'
import { API_ROUTES } from './endpoints'
import { brandConfigAuthHeaders } from './brandConfigAuth'
import type {
  BrandConfigEnvelope,
  BrandConfigObject,
  BrokerBrandConfig,
  PatchAllConfigsBody,
} from '../types/brandConfig'

const TOKEN_STORAGE_KEY = 'apthq-brand-config-token'
export const BRAND_CONFIG_TOKEN_CHANGED = 'apthq-brand-config-token-changed'

export function getBrandConfigToken(): string {
  return localStorage.getItem(TOKEN_STORAGE_KEY)?.trim() ?? ''
}

export function setBrandConfigToken(token: string): void {
  const trimmed = token.trim()
  if (trimmed) localStorage.setItem(TOKEN_STORAGE_KEY, trimmed)
  else localStorage.removeItem(TOKEN_STORAGE_KEY)
  window.dispatchEvent(
    new CustomEvent(BRAND_CONFIG_TOKEN_CHANGED, { detail: trimmed }),
  )
}

function authHeaders(token: string): HeadersInit {
  return brandConfigAuthHeaders(token)
}

async function parseBrandConfigError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string; error?: string }
    return body.message || body.error || `${res.status} ${res.statusText}`
  } catch {
    return `${res.status} ${res.statusText}`
  }
}

async function brandConfigGet<T>(
  path: string,
  token: string,
  params?: URLSearchParams,
  signal?: AbortSignal,
): Promise<BrandConfigEnvelope<T>> {
  if (!token) throw new Error('Access token required — set it in the Brand Config panel')

  const qs = params?.toString()
  const url = qs ? `${API_BASE}${path}?${qs}` : `${API_BASE}${path}`
  const res = await fetch(url, { headers: authHeaders(token), signal })

  if (!res.ok) throw new Error(await parseBrandConfigError(res))
  return res.json() as Promise<BrandConfigEnvelope<T>>
}

async function brandConfigPatch<T>(
  path: string,
  token: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<BrandConfigEnvelope<T>> {
  if (!token) throw new Error('Access token required — set it in the Brand Config panel')

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })

  if (!res.ok) throw new Error(await parseBrandConfigError(res))
  return res.json() as Promise<BrandConfigEnvelope<T>>
}

export async function fetchCurrentBrandConfig(
  token: string,
  configType?: string,
  signal?: AbortSignal,
): Promise<BrandConfigObject> {
  const params = new URLSearchParams()
  if (configType?.trim()) params.set('config_type', configType.trim())

  const envelope = await brandConfigGet<BrandConfigObject>(
    API_ROUTES.brandConfig.config,
    token,
    params,
    signal,
  )
  return envelope.data ?? {}
}

export async function patchCurrentBrandConfig(
  token: string,
  config: BrandConfigObject,
  signal?: AbortSignal,
): Promise<BrandConfigObject> {
  if (!Object.keys(config).length) {
    throw new Error('Config must contain at least one key')
  }

  const envelope = await brandConfigPatch<BrandConfigObject>(
    API_ROUTES.brandConfig.config,
    token,
    config,
    signal,
  )
  return envelope.data ?? config
}

export async function fetchAllBrandConfigs(
  token: string,
  brokers?: string,
  configType?: string,
  signal?: AbortSignal,
): Promise<BrokerBrandConfig[]> {
  const params = new URLSearchParams()
  if (brokers?.trim()) params.set('brokers', brokers.trim())
  if (configType?.trim()) params.set('config_type', configType.trim())

  const envelope = await brandConfigGet<BrokerBrandConfig[]>(
    API_ROUTES.brandConfig.allConfigs,
    token,
    params,
    signal,
  )
  return envelope.data ?? []
}

export async function patchAllBrandConfigs(
  token: string,
  body: PatchAllConfigsBody,
  signal?: AbortSignal,
): Promise<BrokerBrandConfig[]> {
  if (!body.configs?.length) {
    throw new Error('configs must contain at least one broker entry')
  }

  const names = body.configs.map((c) => c.brokerName)
  if (new Set(names).size !== names.length) {
    throw new Error('Duplicate brokerName in configs')
  }

  for (const entry of body.configs) {
    if (!entry.brokerName?.trim()) throw new Error('Each config must have a brokerName')
    if (!entry.config || !Object.keys(entry.config).length) {
      throw new Error(`Config for ${entry.brokerName} must contain at least one key`)
    }
  }

  const envelope = await brandConfigPatch<BrokerBrandConfig[]>(
    API_ROUTES.brandConfig.allConfigs,
    token,
    body,
    signal,
  )
  return envelope.data ?? body.configs
}

export function parseBrandConfigJson(raw: string): BrandConfigObject {
  const parsed = JSON.parse(raw) as unknown
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Config must be a JSON object')
  }
  if (!Object.keys(parsed as object).length) {
    throw new Error('Config must contain at least one key')
  }
  return parsed as BrandConfigObject
}

export function parseAllConfigsJson(raw: string): PatchAllConfigsBody {
  const parsed = JSON.parse(raw) as unknown
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Body must be a JSON object with a configs array')
  }
  const configs = (parsed as PatchAllConfigsBody).configs
  if (!Array.isArray(configs) || !configs.length) {
    throw new Error('configs must be a non-empty array')
  }
  return parsed as PatchAllConfigsBody
}

export function formatBrandConfigJson(value: unknown): string {
  return JSON.stringify(value, null, 2)
}
