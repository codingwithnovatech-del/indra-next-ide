import { memo, useState, useEffect, useCallback } from 'react'
import type { ThemeMode } from '../hooks/useTheme'

interface Settings {
  fontSize: number
  tabSize: number
  wordWrap: boolean
  fontFamily: string
  minimap: boolean
  autoSave: boolean
  formatOnSave: boolean
}

interface SettingsPanelProps {
  themeMode: ThemeMode
  onThemeChange: (mode: ThemeMode) => void
  settings: Settings
  onSettingsChange: (settings: Settings) => void
}

const defaultSettings: Settings = {
  fontSize: 13,
  tabSize: 2,
  wordWrap: true,
  fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace",
  minimap: true,
  autoSave: true,
  formatOnSave: false,
}

function SettingsPanel({ themeMode, onThemeChange, settings, onSettingsChange }: SettingsPanelProps) {
  const [local, setLocal] = useState<Settings>(settings)

  useEffect(() => { setLocal(settings) }, [settings])

  const update = useCallback((partial: Partial<Settings>) => {
    setLocal(prev => {
      const next = { ...prev, ...partial }
      onSettingsChange(next)
      return next
    })
  }, [onSettingsChange])

  const inputStyle = {
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-primary)',
    borderColor: 'var(--border)',
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
      <div className="px-3 h-[30px] flex items-center text-[11px] font-semibold uppercase tracking-wider select-none"
           style={{ color: 'var(--text-muted)' }}>
        Settings
      </div>

      <div className="p-3 space-y-4 text-sm">
        <Section title="Appearance">
          <Row label="Theme">
            <select value={themeMode} onChange={(e) => onThemeChange(e.target.value as ThemeMode)}
              className="w-full h-[32px] rounded px-2 text-xs outline-none border"
              style={inputStyle}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </Row>
        </Section>

        <Section title="Editor">
          <Row label="Font Size">
            <div className="flex items-center gap-2">
              <input type="range" min="10" max="24" value={local.fontSize}
                onChange={(e) => update({ fontSize: Number(e.target.value) })}
                className="w-full" />
              <span className="text-xs w-[24px] text-right" style={{ color: 'var(--text-dim)' }}>{local.fontSize}</span>
            </div>
          </Row>
          <Row label="Tab Size">
            <select value={local.tabSize} onChange={(e) => update({ tabSize: Number(e.target.value) })}
              className="w-full h-[32px] rounded px-2 text-xs outline-none border"
              style={inputStyle}>
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </Row>
          <Row label="Word Wrap">
            <Toggle checked={local.wordWrap} onChange={(v) => update({ wordWrap: v })} />
          </Row>
          <Row label="Minimap">
            <Toggle checked={local.minimap} onChange={(v) => update({ minimap: v })} />
          </Row>
          <Row label="Auto Save">
            <Toggle checked={local.autoSave} onChange={(v) => update({ autoSave: v })} />
          </Row>
          <Row label="Format on Save">
            <Toggle checked={local.formatOnSave} onChange={(v) => update({ formatOnSave: v })} />
          </Row>
          <Row label="Font Family">
            <input value={local.fontFamily} onChange={(e) => update({ fontFamily: e.target.value })}
              className="w-full h-[32px] rounded px-2 text-xs outline-none border font-mono"
              style={inputStyle} />
          </Row>
        </Section>

        <Section title="Keyboard Shortcuts">
          <div className="space-y-2 text-xs" style={{ color: 'var(--text-dim)' }}>
            {[
              ['Ctrl+P', 'Quick Open'],
              ['Ctrl+Shift+P', 'Command Palette'],
              ['Ctrl+S', 'Save'],
              ['Ctrl+`', 'Toggle Terminal'],
              ['Ctrl+Shift+F', 'Search'],
              ['Ctrl+H', 'Find & Replace'],
              ['Shift+Alt+F', 'Format Document'],
              ['Ctrl+K Z', 'Zen Mode'],
            ].map(([keys, desc]) => (
              <div key={keys} className="flex items-center justify-between">
                <span>{desc}</span>
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                     style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                  {keys}
                </kbd>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 min-h-[32px]">
      <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{label}</span>
      <div className="w-[200px] shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className="relative w-[36px] h-[20px] rounded-full transition-colors"
      style={{ backgroundColor: checked ? 'var(--accent)' : 'var(--bg-input)' }}>
      <div className="absolute top-[2px] size-[16px] rounded-full bg-white transition-transform"
           style={{ transform: `translateX(${checked ? '18px' : '2px'})` }} />
    </button>
  )
}

export default memo(SettingsPanel)
export type { Settings }
export { defaultSettings }
