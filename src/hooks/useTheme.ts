import { useState, useEffect, useCallback } from 'react'

export type ThemeMode = 'dark' | 'light' | 'auto'

const STORAGE_KEY = 'indranext-theme'

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function resolveTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'auto') return getSystemTheme()
  return mode
}

function loadTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light' || saved === 'auto') return saved
  } catch { /* ignore */ }
  return 'dark'
}

function applyTheme(resolved: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', resolved)
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(loadTheme)

  const toggleTheme = useCallback(() => {
    setMode((prev) => prev === 'dark' ? 'light' : prev === 'light' ? 'auto' : 'dark')
  }, [])

  useEffect(() => {
    applyTheme(resolveTheme(mode))
    try { localStorage.setItem(STORAGE_KEY, mode) } catch { /* ignore */ }
  }, [mode])

  useEffect(() => {
    if (mode !== 'auto') return
    const mql = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => applyTheme(resolveTheme('auto'))
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [mode])

  const resolved = resolveTheme(mode)

  return { mode, resolved, toggleTheme, setMode, isDark: resolved === 'dark', isLight: resolved === 'light' }
}
