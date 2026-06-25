import { memo } from 'react'
import type { ThemeMode } from '../hooks/useTheme'

interface StatusBarProps {
  tabName?: string
  language?: string
  themeMode: ThemeMode
  onThemeToggle: () => void
  line?: number
  col?: number
  tabSize?: number
  children?: React.ReactNode
}

const themeLabel: Record<ThemeMode, string> = { dark: 'Dark', light: 'Light', auto: 'Auto' }

function StatusBar({ tabName, language, themeMode, onThemeToggle, line, col, tabSize, children }: StatusBarProps) {
  return (
    <footer className="flex h-[24px] shrink-0 items-center px-3 text-xs text-white select-none"
            style={{ backgroundColor: 'var(--bg-statusbar)' }}>
      <span className="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M9.5 3.5L7 8l2.5 4.5H11L8.5 8 11 3.5H9.5zM5 3.5L2.5 8 5 12.5H6.5L4 8l2.5-4.5H5z" />
        </svg>
        IndraNext
        {children}
      </span>
      <span className="ml-auto flex items-center gap-3">
        <button onClick={onThemeToggle} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            {themeMode === 'dark' ? (
              <path d="M6 .278a.768.768 0 01.08.858 7.208 7.208 0 00-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 01.81.316.733.733 0 01-.031.893A8.349 8.349 0 018.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 016 .278z" />
            ) : (
              <path d="M8 1a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1A.5.5 0 018 1zm0 10a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1A.5.5 0 018 11zm6-3a.5.5 0 010 1h-1a.5.5 0 010-1h1zM3 8a.5.5 0 01-.5.5h-1a.5.5 0 010-1h1A.5.5 0 013 8zm10.657-5.657a.5.5 0 010 .707l-.707.707a.5.5 0 11-.707-.707l.707-.707a.5.5 0 01.707 0zm-9.193 9.193a.5.5 0 010 .707L3.757 13.25a.5.5 0 01-.707-.707l.707-.707a.5.5 0 01.707 0zm9.193 0a.5.5 0 01-.707 0l-.707-.707a.5.5 0 11.707-.707l.707.707a.5.5 0 010 .707zM3.464 3.464a.5.5 0 010 .707l-.707.707a.5.5 0 11-.707-.707l.707-.707a.5.5 0 01.707 0z" />
            )}
          </svg>
          {themeLabel[themeMode]}
        </button>
        <span>Ln {line ?? 1}, Col {col ?? 1}</span>
        <span>Spaces: {tabSize ?? 2}</span>
        <span>UTF-8</span>
        {language && <span>{language}</span>}
        {tabName && <span className="text-white/70">{tabName}</span>}
      </span>
    </footer>
  )
}

export default memo(StatusBar)
