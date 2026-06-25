import { memo, useCallback, useState, useEffect } from 'react'
import Editor, { type BeforeMount } from '@monaco-editor/react'
import type { TabItem } from '../types'
import { emmetHTML, emmetCSS, emmetJSX } from 'emmet-monaco-es'

interface EditorAreaProps {
  activeTab: TabItem | undefined
  content: string
  onChange: (value: string | undefined) => void
  isDark?: boolean
  recentFiles?: { id: string; name: string }[]
  onFileSelect?: (id: string) => void
  onCreateFile?: (name: string) => void
}

const RECENT_KEY = 'indranext-recent-files'

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript',
    js: 'javascript', jsx: 'javascript',
    html: 'html', htm: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    py: 'python',
    vue: 'html',
    rs: 'rust',
    go: 'go',
  }
  return map[ext ?? ''] ?? 'plaintext'
}

const editorOptions = {
  minimap: { enabled: true, size: 'proportional', maxColumn: 60, showSlider: 'mouseover' },
  fontSize: 13,
  fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace",
  fontLigatures: true,
  lineNumbers: 'on',
  wordWrap: 'on',
  automaticLayout: true,
  bracketPairColorization: { enabled: true },
  padding: { top: 12 },
  renderWhitespace: 'selection',
  smoothScrolling: true,
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  multiCursorModifier: 'ctrlCmd',
  multiCursorMergeOverlapping: true,
  folding: true,
  foldingHighlight: true,
  foldingStrategy: 'indentation',
  autoClosingBrackets: 'always',
  autoClosingQuotes: 'always',
  formatOnPaste: true,
  linkedEditing: true,
  codeLens: true,
  colorDecorators: true,
  selectionHighlight: true,
  occurrenceHighlight: 'singleSel',
  renderLineHighlight: 'all',
  hideCursorInOverviewRuler: false,
  overviewRulerLanes: 2,
  inlayHints: { enabled: 'on', fontSize: 11 },
  find: { addExtraSpaceOnTop: false, autoFindInSelection: 'multiline' },
  contextmenu: true,
} as const

function EditorArea({ activeTab, content, onChange, isDark = true, recentFiles = [], onFileSelect, onCreateFile }: EditorAreaProps) {
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    if (activeTab) {
      try {
        const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') as { id: string; name: string; time: number }[]
        const updated = [{ id: activeTab.id, name: activeTab.name, time: Date.now() }, ...stored.filter(s => s.id !== activeTab.id)].slice(0, 10)
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
      } catch { /* ignore */ }
    }
  }, [activeTab])

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    emmetHTML(monaco)
    emmetCSS(monaco)
    emmetJSX(monaco)
    monaco.editor.defineTheme('indra-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
        'editorCursor.foreground': '#aeafad',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
      },
    })
    monaco.editor.defineTheme('indra-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#333333',
        'editor.lineHighlightBackground': '#e8e8e8',
        'editor.selectionBackground': '#add6ff',
        'editor.inactiveSelectionBackground': '#e0e0e0',
        'editorCursor.foreground': '#000000',
        'editorLineNumber.foreground': '#999999',
        'editorLineNumber.activeForeground': '#333333',
        'editorIndentGuide.background': '#dcdcdc',
        'editorIndentGuide.activeBackground': '#c0c0c0',
      },
    })
  }, [])

  const templates = ['index.html', 'style.css', 'app.js', 'App.tsx', 'data.json']

  const handleTemplateCreate = (name: string) => {
    onCreateFile?.(name)
    setShowTemplates(false)
  }

  const themeName = isDark ? 'indra-dark' : 'indra-light'

  if (!activeTab) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-auto" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="max-w-lg w-full px-8 py-12">
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl mb-4"
                 style={{ backgroundColor: 'rgba(0,122,204,0.15)' }}>
              <svg width="36" height="36" viewBox="0 0 16 16" fill="#007acc">
                <path d="M9.5 3.5L7 8l2.5 4.5H11L8.5 8 11 3.5H9.5zM5 3.5L2.5 8 5 12.5H6.5L4 8l2.5-4.5H5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome to IndraNext IDE</h2>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Open a file or create a new one to start coding</p>
          </div>

          <div className="grid gap-3 mb-8 animate-fade-in-up stagger-3">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Quick Start</h3>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button key={t} onClick={() => handleTemplateCreate(t)}
                    className="px-3 py-1.5 rounded text-xs transition-all duration-200 hover:scale-105"
                    style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                    + {t}
                  </button>
                ))}
                <button onClick={() => setShowTemplates(!showTemplates)}
                  className="px-3 py-1.5 rounded text-xs" style={{ color: 'var(--text-dim)' }}>
                  More...
                </button>
              </div>
            </div>

            {recentFiles.length > 0 && (
              <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Recent Files</h3>
                <div className="space-y-1">
                  {recentFiles.slice(0, 5).map((f) => (
                    <button key={f.id} onClick={() => onFileSelect?.(f.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors hover:bg-[var(--bg-hover)]"
                      style={{ color: 'var(--text-primary)' }}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="shrink-0 text-[#519aba]">
                        <path d="M1 2.5A1.5 1.5 0 012.5 1h3.207a1.5 1.5 0 011.06.44l3.754 3.753a1.5 1.5 0 01.44 1.06V13.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 13.5V2.5z" />
                      </svg>
                      <span className="truncate">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Keyboard Shortcuts</h3>
              <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
                {[
                  { keys: 'Ctrl+P', desc: 'Quick Open' },
                  { keys: 'Ctrl+Shift+P', desc: 'Command Palette' },
                  { keys: 'Ctrl+S', desc: 'Save' },
                  { keys: 'Ctrl+`', desc: 'Toggle Terminal' },
                  { keys: 'Ctrl+Shift+F', desc: 'Search' },
                  { keys: 'Alt+Click', desc: 'Multi Cursor' },
                ].map(s => (
                  <div key={s.keys} className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                         style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      {s.keys}
                    </kbd>
                    <span>{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
      <Editor
        key={activeTab.id}
        theme={themeName}
        language={getLanguage(activeTab.name)}
        value={content}
        onChange={onChange}
        beforeMount={handleBeforeMount}
        options={editorOptions}
        loading={
          <div className="flex h-full items-center justify-center" style={{ color: 'var(--text-dim)' }}>
            <div className="flex items-center gap-2">
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 110 16A8 8 0 018 0zm0 2a6 6 0 100 12A6 6 0 008 2z" opacity="0.3" />
                <path d="M8 0a8 8 0 018 8h-2a6 6 0 00-6-6V0z" />
              </svg>
              Loading editor...
            </div>
          </div>
        }
      />
    </div>
  )
}

export default memo(EditorArea)
