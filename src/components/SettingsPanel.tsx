import { memo, useState, useEffect, useCallback, useMemo } from 'react'
import type { ThemeMode } from '../hooks/useTheme'

export interface Settings {
  fontSize: number
  tabSize: number
  wordWrap: boolean
  fontFamily: string
  minimap: boolean
  autoSave: boolean
  autoSaveDelay: number
  formatOnSave: boolean
  formatOnPaste: boolean
  linkedEditing: boolean
  stickyScroll: boolean
  suggestWhileTyping: boolean
  tabCompletion: 'off' | 'on' | 'onlySnippets'
  trimTrailingWhitespace: boolean
  insertFinalNewline: boolean
  cursorStyle: 'line' | 'block' | 'underline'
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid'
  lineHeight: number
  letterSpacing: number
  lineNumbers: 'on' | 'off' | 'relative'
  renderWhitespace: 'none' | 'boundary' | 'selection' | 'all'
  renderLineHighlight: 'none' | 'gutter' | 'line' | 'all'
  indentGuides: boolean
  bracketPairColorization: boolean
  overviewRuler: boolean
  activityBarPosition: 'left' | 'right' | 'hidden'
  sidebarPosition: 'left' | 'right'
  tabWrap: boolean
  autoCloseTags: boolean
  autoSurround: boolean
  terminalFontSize: number
  terminalFontFamily: string
  terminalCursorStyle: 'line' | 'block' | 'underline'
}

export const defaultSettings: Settings = {
  fontSize: 13,
  tabSize: 2,
  wordWrap: true,
  fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace",
  minimap: true,
  autoSave: false,
  autoSaveDelay: 1000,
  formatOnSave: false,
  formatOnPaste: true,
  linkedEditing: true,
  stickyScroll: true,
  suggestWhileTyping: true,
  tabCompletion: 'on',
  trimTrailingWhitespace: true,
  insertFinalNewline: true,
  cursorStyle: 'line',
  cursorBlinking: 'smooth',
  lineHeight: 1.5,
  letterSpacing: 0,
  lineNumbers: 'on',
  renderWhitespace: 'selection',
  renderLineHighlight: 'all',
  indentGuides: true,
  bracketPairColorization: true,
  overviewRuler: true,
  activityBarPosition: 'left',
  sidebarPosition: 'left',
  tabWrap: false,
  autoCloseTags: true,
  autoSurround: true,
  terminalFontSize: 13,
  terminalFontFamily: "Consolas, 'Courier New', monospace",
  terminalCursorStyle: 'line',
}

interface SettingsPanelProps {
  themeMode: ThemeMode
  onThemeChange: (mode: ThemeMode) => void
  settings: Settings
  onSettingsChange: (settings: Settings) => void
}

function SettingsPanel({ themeMode, onThemeChange, settings, onSettingsChange }: SettingsPanelProps) {
  const [local, setLocal] = useState<Settings>(settings)
  const [search, setSearch] = useState('')

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

  const searchLower = search.toLowerCase()

  const sections = useMemo(() => {
    const all: Array<{ id: string; label: string; filterKey: string; render: () => React.ReactNode }> = [
      {
        id: 'appearance',
        label: 'Appearance',
        filterKey: 'appearance theme activity bar sidebar position',
        render: () => (
          <div className="space-y-2">
            <Row label="Theme">
              <select value={themeMode} onChange={(e) => onThemeChange(e.target.value as ThemeMode)}
                className="w-full h-[32px] rounded px-2 text-xs outline-none border"
                style={inputStyle}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </Row>
            <Row label="Activity Bar Position">
              <select value={local.activityBarPosition} onChange={(e) => update({ activityBarPosition: e.target.value as 'left' | 'right' | 'hidden' })}
                className="w-full h-[32px] rounded px-2 text-xs outline-none border"
                style={inputStyle}>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="hidden">Hidden</option>
              </select>
            </Row>
            <Row label="Sidebar Position">
              <select value={local.sidebarPosition} onChange={(e) => update({ sidebarPosition: e.target.value as 'left' | 'right' })}
                className="w-full h-[32px] rounded px-2 text-xs outline-none border"
                style={inputStyle}>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </Row>
          </div>
        ),
      },
      {
        id: 'editor-behavior',
        label: 'Editor \u00b7 Behavior',
        filterKey: 'editor behavior save format paste auto linked editing sticky scroll suggest tab completion trim whitespace newline close tags surround',
        render: () => (
          <div className="space-y-2">
            <Row label="Auto Save">
              <Toggle checked={local.autoSave} onChange={(v) => update({ autoSave: v })} />
            </Row>
            {local.autoSave && (
              <Row label="Auto Save Delay">
                <select value={local.autoSaveDelay} onChange={(e) => update({ autoSaveDelay: Number(e.target.value) })}
                  className="w-full h-[32px] rounded px-2 text-xs outline-none border"
                  style={inputStyle}>
                  <option value={500}>500ms</option>
                  <option value={1000}>1s</option>
                  <option value={2000}>2s</option>
                  <option value={5000}>5s</option>
                </select>
              </Row>
            )}
            <Row label="Format on Save">
              <Toggle checked={local.formatOnSave} onChange={(v) => update({ formatOnSave: v })} />
            </Row>
            <Row label="Format on Paste">
              <Toggle checked={local.formatOnPaste} onChange={(v) => update({ formatOnPaste: v })} />
            </Row>
            <Row label="Linked Editing">
              <Toggle checked={local.linkedEditing} onChange={(v) => update({ linkedEditing: v })} />
            </Row>
            <Row label="Sticky Scroll">
              <Toggle checked={local.stickyScroll} onChange={(v) => update({ stickyScroll: v })} />
            </Row>
            <Row label="Suggest While Typing">
              <Toggle checked={local.suggestWhileTyping} onChange={(v) => update({ suggestWhileTyping: v })} />
            </Row>
            <Row label="Tab Completion">
              <select value={local.tabCompletion} onChange={(e) => update({ tabCompletion: e.target.value as 'off' | 'on' | 'onlySnippets' })}
                className="w-full h-[32px] rounded px-2 text-xs outline-none border"
                style={inputStyle}>
                <option value="off">Off</option>
                <option value="on">On</option>
                <option value="onlySnippets">Only Snippets</option>
              </select>
            </Row>
            <Row label="Trim Trailing Whitespace">
              <Toggle checked={local.trimTrailingWhitespace} onChange={(v) => update({ trimTrailingWhitespace: v })} />
            </Row>
            <Row label="Insert Final Newline">
              <Toggle checked={local.insertFinalNewline} onChange={(v) => update({ insertFinalNewline: v })} />
            </Row>
            <Row label="Auto Close Tags">
              <Toggle checked={local.autoCloseTags} onChange={(v) => update({ autoCloseTags: v })} />
            </Row>
            <Row label="Auto Surround">
              <Toggle checked={local.autoSurround} onChange={(v) => update({ autoSurround: v })} />
            </Row>
          </div>
        ),
      },
      {
        id: 'editor-appearance',
        label: 'Editor \u00b7 Appearance',
        filterKey: 'editor appearance font cursor blink line height letter spacing numbers whitespace highlight indent guides bracket pair colorization overview ruler minimap word wrap tab size',
        render: () => (
          <div className="space-y-2">
            <Row label="Font Size">
              <div className="flex items-center gap-2">
                <input type="range" min="10" max="28" value={local.fontSize}
                  onChange={(e) => update({ fontSize: Number(e.target.value) })}
                  className="w-full" />
                <span className="text-xs w-[28px] text-right" style={{ color: 'var(--text-dim)' }}>{local.fontSize}</span>
              </div>
            </Row>
            <Row label="Font Family">
              <input value={local.fontFamily} onChange={(e) => update({ fontFamily: e.target.value })}
                className="w-full h-[32px] rounded px-2 text-xs outline-none border font-mono"
                style={inputStyle} />
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
            <Row label="Cursor Style">
              <select value={local.cursorStyle} onChange={(e) => update({ cursorStyle: e.target.value as 'line' | 'block' | 'underline' })}
                className="w-full h-[32px] rounded px-2 text-xs outline-none border"
                style={inputStyle}>
                <option value="line">Line</option>
                <option value="block">Block</option>
                <option value="underline">Underline</option>
              </select>
            </Row>
            <Row label="Cursor Blinking">
              <select value={local.cursorBlinking} onChange={(e) => update({ cursorBlinking: e.target.value as 'blink' | 'smooth' | 'phase' | 'expand' | 'solid' })}
                className="w-full h-[32px] rounded px-2 text-xs outline-none border"
                style={inputStyle}>
                <option value="blink">Blink</option>
                <option value="smooth">Smooth</option>
                <option value="phase">Phase</option>
                <option value="expand">Expand</option>
                <option value="solid">Solid</option>
              </select>
            </Row>
            <Row label="Line Height">
              <div className="flex items-center gap-2">
                <input type="range" min="10" max="22" step={1} value={Math.round(local.lineHeight * 10)}
                  onChange={(e) => update({ lineHeight: Number(e.target.value) / 10 })}
                  className="w-full" />
                <span className="text-xs w-[32px] text-right" style={{ color: 'var(--text-dim)' }}>{local.lineHeight.toFixed(1)}</span>
              </div>
            </Row>
            <Row label="Letter Spacing">
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="20" step={1} value={local.letterSpacing}
                  onChange={(e) => update({ letterSpacing: Number(e.target.value) })}
                  className="w-full" />
                <span className="text-xs w-[24px] text-right" style={{ color: 'var(--text-dim)' }}>{local.letterSpacing}</span>
              </div>
            </Row>
            <Row label="Line Numbers">
              <select value={local.lineNumbers} onChange={(e) => update({ lineNumbers: e.target.value as 'on' | 'off' | 'relative' })}
                className="w-full h-[32px] rounded px-2 text-xs outline-none border"
                style={inputStyle}>
                <option value="on">On</option>
                <option value="off">Off</option>
                <option value="relative">Relative</option>
              </select>
            </Row>
            <Row label="Render Whitespace">
              <select value={local.renderWhitespace} onChange={(e) => update({ renderWhitespace: e.target.value as 'none' | 'boundary' | 'selection' | 'all' })}
                className="w-full h-[32px] rounded px-2 text-xs outline-none border"
                style={inputStyle}>
                <option value="none">None</option>
                <option value="boundary">Boundary</option>
                <option value="selection">Selection</option>
                <option value="all">All</option>
              </select>
            </Row>
            <Row label="Render Line Highlight">
              <select value={local.renderLineHighlight} onChange={(e) => update({ renderLineHighlight: e.target.value as 'none' | 'gutter' | 'line' | 'all' })}
                className="w-full h-[32px] rounded px-2 text-xs outline-none border"
                style={inputStyle}>
                <option value="none">None</option>
                <option value="gutter">Gutter</option>
                <option value="line">Line</option>
                <option value="all">All</option>
              </select>
            </Row>
            <Row label="Indent Guides">
              <Toggle checked={local.indentGuides} onChange={(v) => update({ indentGuides: v })} />
            </Row>
            <Row label="Bracket Pair Colorization">
              <Toggle checked={local.bracketPairColorization} onChange={(v) => update({ bracketPairColorization: v })} />
            </Row>
            <Row label="Overview Ruler">
              <Toggle checked={local.overviewRuler} onChange={(v) => update({ overviewRuler: v })} />
            </Row>
          </div>
        ),
      },
      {
        id: 'terminal',
        label: 'Terminal',
        filterKey: 'terminal font cursor',
        render: () => (
          <div className="space-y-2">
            <Row label="Terminal Font Size">
              <div className="flex items-center gap-2">
                <input type="range" min="10" max="22" value={local.terminalFontSize}
                  onChange={(e) => update({ terminalFontSize: Number(e.target.value) })}
                  className="w-full" />
                <span className="text-xs w-[24px] text-right" style={{ color: 'var(--text-dim)' }}>{local.terminalFontSize}</span>
              </div>
            </Row>
            <Row label="Terminal Font Family">
              <input value={local.terminalFontFamily} onChange={(e) => update({ terminalFontFamily: e.target.value })}
                className="w-full h-[32px] rounded px-2 text-xs outline-none border font-mono"
                style={inputStyle} />
            </Row>
            <Row label="Terminal Cursor Style">
              <select value={local.terminalCursorStyle} onChange={(e) => update({ terminalCursorStyle: e.target.value as 'line' | 'block' | 'underline' })}
                className="w-full h-[32px] rounded px-2 text-xs outline-none border"
                style={inputStyle}>
                <option value="line">Line</option>
                <option value="block">Block</option>
                <option value="underline">Underline</option>
              </select>
            </Row>
          </div>
        ),
      },
    ]
    return all
  }, [local, themeMode, onThemeChange, update, inputStyle])

  const filteredSections = useMemo(() => {
    if (!searchLower) return sections
    return sections.filter(s => s.filterKey.includes(searchLower))
  }, [sections, searchLower])

  const resetSection = useCallback((id: string) => {
    if (id === 'appearance') {
      update({ activityBarPosition: defaultSettings.activityBarPosition, sidebarPosition: defaultSettings.sidebarPosition })
    } else if (id === 'editor-behavior') {
      update({
        autoSave: defaultSettings.autoSave,
        autoSaveDelay: defaultSettings.autoSaveDelay,
        formatOnSave: defaultSettings.formatOnSave,
        formatOnPaste: defaultSettings.formatOnPaste,
        linkedEditing: defaultSettings.linkedEditing,
        stickyScroll: defaultSettings.stickyScroll,
        suggestWhileTyping: defaultSettings.suggestWhileTyping,
        tabCompletion: defaultSettings.tabCompletion,
        trimTrailingWhitespace: defaultSettings.trimTrailingWhitespace,
        insertFinalNewline: defaultSettings.insertFinalNewline,
        autoCloseTags: defaultSettings.autoCloseTags,
        autoSurround: defaultSettings.autoSurround,
      })
    } else if (id === 'editor-appearance') {
      update({
        fontSize: defaultSettings.fontSize,
        tabSize: defaultSettings.tabSize,
        wordWrap: defaultSettings.wordWrap,
        fontFamily: defaultSettings.fontFamily,
        minimap: defaultSettings.minimap,
        cursorStyle: defaultSettings.cursorStyle,
        cursorBlinking: defaultSettings.cursorBlinking,
        lineHeight: defaultSettings.lineHeight,
        letterSpacing: defaultSettings.letterSpacing,
        lineNumbers: defaultSettings.lineNumbers,
        renderWhitespace: defaultSettings.renderWhitespace,
        renderLineHighlight: defaultSettings.renderLineHighlight,
        indentGuides: defaultSettings.indentGuides,
        bracketPairColorization: defaultSettings.bracketPairColorization,
        overviewRuler: defaultSettings.overviewRuler,
      })
    } else if (id === 'terminal') {
      update({
        terminalFontSize: defaultSettings.terminalFontSize,
        terminalFontFamily: defaultSettings.terminalFontFamily,
        terminalCursorStyle: defaultSettings.terminalCursorStyle,
      })
    }
  }, [update])

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
      <div className="px-3 h-[30px] flex items-center text-[11px] font-semibold uppercase tracking-wider select-none"
           style={{ color: 'var(--text-muted)' }}>
        Settings
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <svg className="absolute left-2 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 16 16" fill="var(--text-dim)">
            <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85-.017.016zm-5.242.156a5 5 0 110-10 5 5 0 010 10z" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[28px] rounded pl-7 pr-2 text-xs outline-none border"
            style={inputStyle}
            placeholder="Search settings..."
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--text-dim)' }}>
              {'\u2715'}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {filteredSections.length === 0 ? (
          <div className="text-xs text-center py-8" style={{ color: 'var(--text-dim)' }}>
            No settings found for "{search}"
          </div>
        ) : (
          <div className="space-y-5 text-sm">
            {filteredSections.map(s => (
              <div key={s.id}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {s.label}
                  </h4>
                  <button onClick={() => resetSection(s.id)}
                    className="text-[10px] underline hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--text-dim)' }}>
                    Reset
                  </button>
                </div>
                {s.render()}
              </div>
            ))}
          </div>
        )}
      </div>
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
