import { API_BASE } from './constants'
import { userLoginUrl } from './endpoints'
import type { LoginResponse } from '../types/auth'

/**
 * Extracts access token from various API response shapes:
 * - { token: "..." }
 * - { accessToken: "..." }
 * - { access_token: "..." }
 * - { data: { token: "..." } }
 * - { data: { accessToken: "..." } }
 * - { data: "eyJhbGci..." }
 */
export function extractTokenFromLogin(res: LoginResponse): string | null {
  if (typeof res.data === 'string' && res.data.startsWith('ey')) {
    return res.data
  }
  if (res.token) return res.token
  if (res.accessToken) return res.accessToken
  if (res.access_token) return res.access_token

  if (res.data && typeof res.data === 'object') {
    const d = res.data as Record<string, unknown>
    if (typeof d.token === 'string') return d.token
    if (typeof d.accessToken === 'string') return d.accessToken
    if (typeof d.access_token === 'string') return d.access_token
  }

  return null
}

async function parseLoginError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string; error?: string; detail?: string }
    return body.message || body.error || body.detail || `${res.status} ${res.statusText}`
  } catch {
    return `${res.status} ${res.statusText}`
  }
}

/**
 * Executes POST /v2/users/login?userId={userId} (or with &from=main)
 *
 * @param userId - The user ID to authenticate
 * @param from - Optional origin source e.g. "main"
 * @param signal - Optional AbortSignal
 */
export async function loginUser(
  userId: string,
  from?: string,
  signal?: AbortSignal,
): Promise<LoginResponse> {
  const trimmed = userId.trim()
  if (!trimmed) {
    throw new Error('User ID is required for login')
  }

  const endpoint = userLoginUrl(trimmed, from?.trim() || undefined)
  const url = `${API_BASE}${endpoint}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    signal,
  })

  if (!res.ok) {
    throw new Error(await parseLoginError(res))
  }

  return res.json() as Promise<LoginResponse>
}
