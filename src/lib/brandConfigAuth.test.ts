import { describe, expect, it } from 'vitest'
import {
  brandConfigAuthHeaders,
  extractBrandConfigToken,
  isSessionToken,
  parseSessionTokenFromSetCookie,
} from './brandConfigAuth'

describe('brandConfigAuth', () => {
  it('detects session token UUID', () => {
    expect(isSessionToken('98721855-1616-4512-a8a4-d739cb03802d')).toBe(true)
    expect(isSessionToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.x.y')).toBe(false)
  })

  it('parses session_token from Set-Cookie header', () => {
    expect(
      parseSessionTokenFromSetCookie(
        'session_token=abc-123; Path=/; HttpOnly, refresh_token=eyJ...',
      ),
    ).toBe('abc-123')
  })

  it('prefers session token from header then body', () => {
    expect(
      extractBrandConfigToken(
        { data: { session_token: 'from-body', access_token: 'jwt' } },
        'from-header',
      ),
    ).toBe('from-header')
    expect(
      extractBrandConfigToken({
        data: { session_token: 'from-body', access_token: 'jwt' },
      }),
    ).toBe('from-body')
    expect(
      extractBrandConfigToken({ data: { access_token: 'jwt-only' } }),
    ).toBeNull()
  })

  it('sends Authorization header for session token', () => {
    expect(
      brandConfigAuthHeaders('98721855-1616-4512-a8a4-d739cb03802d'),
    ).toEqual({
      Accept: 'application/json',
      Authorization: '98721855-1616-4512-a8a4-d739cb03802d',
    })
  })
})
