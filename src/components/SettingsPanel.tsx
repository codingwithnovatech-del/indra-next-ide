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
          <KeybindingEditor />
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

const KB_STORAGE_KEY = 'indranext-keybindings'

const defaultBindings = [
  { id: 'quick-open', desc: 'Quick Open', keys: 'Ctrl+P' },
  { id: 'command-palette', desc: 'Command Palette', keys: 'Ctrl+Shift+P' },
  { id: 'save', desc: 'Save', keys: 'Ctrl+S' },
  { id: 'toggle-terminal', desc: 'Toggle Terminal', keys: 'Ctrl+`' },
  { id: 'search', desc: 'Search', keys: 'Ctrl+Shift+F' },
  { id: 'find-replace', desc: 'Find & Replace', keys: 'Ctrl+H' },
  { id: 'format-doc', desc: 'Format Document', keys: 'Shift+Alt+F' },
  { id: 'zen-mode', desc: 'Zen Mode', keys: 'Ctrl+K Z' },
]

function loadKeybindings() {
  try {
    const saved = localStorage.getItem(KB_STORAGE_KEY)
    if (saved) return JSON.parse(saved) as typeof defaultBindings
  } catch { /* ignore */ }
  return [...defaultBindings]
}

function captureKeys(e: React.KeyboardEvent): string {
  const parts: string[] = []
  if (e.metaKey || e.ctrlKey) parts.push('Ctrl')
  if (e.shiftKey) parts.push('Shift')
  if (e.altKey) parts.push('Alt')
  const key = e.key === '`' ? '`' : e.key.length === 1 ? e.key.toUpperCase() : e.key
  if (key !== 'Control' && key !== 'Shift' && key !== 'Alt' && key !== 'Meta') parts.push(key)
  return parts.join('+')
}

function KeybindingEditor() {
  const [bindings, setBindings] = useState(loadKeybindings)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(KB_STORAGE_KEY, JSON.stringify(bindings))
    try { (window as unknown as Record<string, unknown>).__indranext_keybindings = bindings } catch { /* ignore */ }
  }, [bindings])

  const handleKeyCapture = useCallback((e: React.KeyboardEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    const captured = captureKeys(e)
    if (!captured) return
    setBindings((prev) => prev.map((b) => b.id === id ? { ...b, keys: captured } : b))
    setEditingId(null)
  }, [])

  const handleReset = useCallback(() => {
    setBindings([...defaultBindings])
    localStorage.removeItem(KB_STORAGE_KEY)
  }, [])

  return (
    <div>
      <div className="space-y-1 text-xs">
        {bindings.map((b) => (
          <div key={b.id} className="flex items-center justify-between">
            <span style={{ color: 'var(--text-primary)' }}>{b.desc}</span>
            {editingId === b.id ? (
              <input
                className="w-[120px] h-[24px] rounded px-2 text-[10px] font-mono text-center outline-none border"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--accent)', borderColor: 'var(--accent)' }}
                placeholder="Press keys..."
                onKeyDown={(e) => handleKeyCapture(e, b.id)}
                onBlur={() => setEditingId(null)}
                autoFocus
              />
            ) : (
              <button onClick={() => setEditingId(b.id)}
                className="px-2 py-0.5 rounded text-[10px] font-mono transition-colors hover:bg-[var(--bg-hover)]"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                {b.keys}
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={handleReset}
        className="mt-3 text-[10px] underline transition-opacity hover:opacity-80"
        style={{ color: 'var(--text-dim)' }}>
        Reset to defaults
      </button>
    </div>
  )
}

export default memo(SettingsPanel)
export type { Settings }
export { defaultSettings }
