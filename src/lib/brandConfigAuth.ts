import type { LoginResponse } from '../types/auth'

const SESSION_TOKEN_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** session_token UUID from aptdemo Set-Cookie (not the JWT access_token). */
export function isSessionToken(token: string): boolean {
  return SESSION_TOKEN_RE.test(token.trim())
}

export function parseSessionTokenFromSetCookie(
  setCookie: string | string[] | null | undefined,
): string | null {
  const raw = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie ?? ''
  const match = raw.match(/session_token=([^;]+)/i)
  return match?.[1]?.trim() ?? null
}

/**
 * Token for /v2/aggregate/* on aptdemo.
 * Must be session_token (UUID) — access_token JWT returns "Session token is missing".
 */
export function extractBrandConfigToken(
  res: LoginResponse,
  sessionTokenFromHeader?: string | null,
): string | null {
  if (sessionTokenFromHeader?.trim()) return sessionTokenFromHeader.trim()

  if (res.data && typeof res.data === 'object') {
    const data = res.data as Record<string, unknown>
    if (typeof data.session_token === 'string' && data.session_token.trim()) {
      return data.session_token.trim()
    }
  }

  return null
}

export function normalizeSessionTokenInput(raw: string): string {
  const trimmed = raw.trim()
  const prefixed = trimmed.match(/^session_token=(.+)$/i)
  return (prefixed?.[1] ?? trimmed).trim()
}

export function brandConfigAuthHeaders(token: string): HeadersInit {
  const trimmed = normalizeSessionTokenInput(token)
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (!trimmed) return headers

  // Browsers block setting Cookie in fetch — send session UUID via Authorization;
  // Vite proxy rewrites it to Cookie: session_token=… for aptdemo.
  headers.Authorization = trimmed
  return headers
}
