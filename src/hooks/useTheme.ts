import { useEffect, useState } from 'react'

const STORAGE_KEY = 'apthq-theme'

function getInitialTheme(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light') return true
  if (stored === 'dark') return false
  return window.matchMedia('(prefers-color-scheme: light)').matches
}

export function useTheme() {
  const [isLight, setIsLight] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLight)
    localStorage.setItem(STORAGE_KEY, isLight ? 'light' : 'dark')
  }, [isLight])

  const toggleTheme = () => setIsLight((v) => !v)

  return { isLight, toggleTheme }
}
