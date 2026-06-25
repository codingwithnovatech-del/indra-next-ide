import { useState, useCallback, useEffect } from 'react'
import type { Settings } from '../components/SettingsPanel'
import { defaultSettings } from '../components/SettingsPanel'

const STORAGE_KEY = 'indranext-settings'

function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) }
  } catch { /* ignore */ }
  return defaultSettings
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)) } catch { /* ignore */ }
  }, [settings])

  const updateSettings = useCallback((next: Settings) => setSettings(next), [])

  return { settings, updateSettings }
}
