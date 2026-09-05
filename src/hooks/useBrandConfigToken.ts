import { useEffect, useState } from 'react'
import {
  BRAND_CONFIG_TOKEN_CHANGED,
  getBrandConfigToken,
} from '../lib/brandConfigApi'

/** Reactive token for Brand Config + Health Check v3 (updates after Save token / login). */
export function useBrandConfigToken(): string {
  const [token, setToken] = useState(getBrandConfigToken)

  useEffect(() => {
    const sync = () => setToken(getBrandConfigToken())
    window.addEventListener(BRAND_CONFIG_TOKEN_CHANGED, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(BRAND_CONFIG_TOKEN_CHANGED, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return token
}
