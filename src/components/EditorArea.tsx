import { memo, useCallback, useState, useEffect, useRef, useMemo } from 'react'
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react'
import type { TabItem } from '../types'
import { emmetHTML, emmetCSS, emmetJSX } from 'emmet-monaco-es'
import { updateProblems } from './ProblemsPanel'

import type { RecentProject } from '../types'

interface EditorAreaProps {
  activeTab: TabItem | undefined
  content: string
  onChange: (value: string | undefined) => void
  isDark?: boolean
  isMobile?: boolean
  recentFiles?: { id: string; name: string }[]
  onFileSelect?: (id: string) => void
  onCreateFile?: (name: string) => void
  onCursorChange?: (line: number, col: number, tabSize: number) => void
  onSave?: () => void
  onMonacoCommand?: (cmd: string) => void
  onOpenFolder?: () => void
  fsSupported?: boolean
  fsActive?: boolean
  folderName?: string
  recentProjects?: RecentProject[]
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

const baseEditorOptions = {
  fontSize: 13,
  fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace",
  fontLigatures: true,
  lineNumbers: 'on' as const,
  wordWrap: 'on' as const,
  automaticLayout: true,
  bracketPairColorization: { enabled: true },
  padding: { top: 12 },
  renderWhitespace: 'selection' as const,
  smoothScrolling: true,
  cursorBlinking: 'smooth' as const,
  cursorSmoothCaretAnimation: 'on' as const,
  multiCursorModifier: 'ctrlCmd' as const,
  multiCursorMergeOverlapping: true,
  folding: true,
  foldingHighlight: true,
  foldingStrategy: 'indentation' as const,
  autoClosingBrackets: 'always' as const,
  autoClosingQuotes: 'always' as const,
  formatOnPaste: true,
  linkedEditing: true,
  codeLens: true,
  colorDecorators: true,
  selectionHighlight: true,
  occurrenceHighlight: 'singleSel' as const,
  renderLineHighlight: 'all' as const,
  hideCursorInOverviewRuler: false,
  overviewRulerLanes: 2,
  inlayHints: { enabled: 'on' as const, fontSize: 11 },
  find: { addExtraSpaceOnTop: false, autoFindInSelection: 'multiline' as const },
  contextmenu: true,
}

function EditorArea({ activeTab, content, onChange, isDark = true, isMobile = false, recentFiles = [], onFileSelect, onCreateFile, onCursorChange, onSave, onMonacoCommand, onOpenFolder, fsSupported, fsActive, folderName, recentProjects = [] }: EditorAreaProps) {
  const [showTemplates, setShowTemplates] = useState(false)
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null)

  const editorOptions = useMemo(() => ({
    ...baseEditorOptions,
    minimap: { enabled: !isMobile, size: 'proportional' as const, maxColumn: 60, showSlider: 'mouseover' as const },
    fontSize: isMobile ? 11 : 13,
  }), [isMobile])

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
    try {
      const snippets = (window as unknown as Record<string, unknown>).__indranext_snippets as Array<{ name: string; prefix: string; body: string; description: string }> | undefined
      if (snippets && snippets.length > 0) {
        monaco.languages.registerCompletionItemProvider('*', {
          provideCompletionItems: (model: { getWordUntilPosition: (pos: { lineNumber: number; column: number }) => { startColumn: number; endColumn: number } }, position: { lineNumber: number; column: number }) => {
            const word = model.getWordUntilPosition(position)
            const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn }
            return {
              suggestions: snippets.filter(s => s.prefix).map(s => ({
                label: s.name,
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: s.body,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: s.description,
                range,
              })),
            }
          },
          triggerCharacters: [],
        })
      }
    } catch { /* ignore */ }
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

  const handleTemplateCreate = (name: string) => {
    onCreateFile?.(name)
    setShowTemplates(false)
  }

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco as unknown as typeof import('monaco-editor')

    const updateMarkerProblems = () => {
      const model = editor.getModel()
      if (!model) return
      const monacoNs = monaco as unknown as { editor: { getModelMarkers: (opts: { resource: unknown }) => Array<{ startLineNumber: number; startColumn: number; message: string; severity: number }>; onDidChangeMarkers: (cb: () => void) => { dispose: () => void } }; MarkerSeverity: { Error: number; Warning: number } }
      const markers = monacoNs.editor.getModelMarkers({ resource: model.uri })
      updateProblems(markers.map((m) => ({
        file: model.uri.path.split('/').pop() || model.uri.toString(),
        line: m.startLineNumber,
        column: m.startColumn,
        message: m.message,
        severity: m.severity === monacoNs.MarkerSeverity.Error ? 'error' as const
                : m.severity === monacoNs.MarkerSeverity.Warning ? 'warning' as const
                : 'info' as const,
      })))
    }

    const disposable = (monaco as unknown as { editor: { onDidChangeMarkers: (cb: () => void) => { dispose: () => void } } }).editor.onDidChangeMarkers(updateMarkerProblems)
    setTimeout(updateMarkerProblems, 500)

    const cursorDisposable = editor.onDidChangeCursorPosition((e) => {
      const model = editor.getModel()
      const tabSize = model?.getOptions().tabSize ?? 2
      onCursorChange?.(e.position.lineNumber, e.position.column, tabSize)
    })

    onCursorChange?.(
      editor.getPosition()?.lineNumber ?? 1,
      editor.getPosition()?.column ?? 1,
      editor.getModel()?.getOptions().tabSize ?? 2,
    )

    const disposables: { dispose: () => void }[] = [disposable, cursorDisposable]

    disposables.push(
      editor.addAction({
        id: 'indra.save', label: 'Save', keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
        run: () => onSave?.(),
      }),
      editor.addAction({
        id: 'indra.palette', label: 'Command Palette', keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP],
        run: () => onMonacoCommand?.('palette'),
      }),
      editor.addAction({
        id: 'indra.quickOpen', label: 'Quick Open', keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP],
        run: () => onMonacoCommand?.('quickOpen'),
      }),
      editor.addAction({
        id: 'indra.terminal', label: 'Toggle Terminal', keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Backquote],
        run: () => onMonacoCommand?.('terminal'),
      }),
      editor.addAction({
        id: 'indra.sidebar', label: 'Toggle Sidebar', keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB],
        run: () => onMonacoCommand?.('sidebar'),
      }),
    )

    return () => disposables.forEach(d => d.dispose())
  }, [onCursorChange, onSave, onMonacoCommand])

  const themeName = isDark ? 'indra-dark' : 'indra-light'

  if (!activeTab) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-auto" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="max-w-2xl w-full px-8 py-8">
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl mb-3 animate-pulse-glow"
                 style={{ backgroundColor: 'rgba(0,122,204,0.15)' }}>
              <svg width="36" height="36" viewBox="0 0 16 16" fill="#007acc">
                <path d="M9.5 3.5L7 8l2.5 4.5H11L8.5 8 11 3.5H9.5zM5 3.5L2.5 8 5 12.5H6.5L4 8l2.5-4.5H5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome to IndraNext IDE</h2>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              Developed by Ayush Kumar &middot; &copy; 2026 IndraNext Technologies
            </p>
          </div>

          <div className="flex gap-3 mb-6 animate-fade-in-up stagger-2">
            {[
              { icon: 'M8 2v12M2 8h12', label: 'New File', action: () => { const name = prompt('File name:'); if (name) handleTemplateCreate(name) }, color: '#4ec9b0' },
              { icon: 'M11.742 10.344a6.5 6.5 0 10-1.397 1.398l3.85 3.85a1 1 0 001.415-1.414l-3.868-3.834zm-5.242.156a5 5 0 110-10 5 5 0 010 10z', label: 'Open File', action: () => { /* Ctrl+P already handles this */ }, color: '#569cd6' },
              { icon: 'M4 2.5v11l9-5.5L4 2.5z', label: 'Run Preview', action: onFileSelect ? () => { if (recentFiles.length > 0) onFileSelect(recentFiles[0].id) } : undefined, color: '#dcdcaa' },
              { icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', label: 'AI Chat', action: () => { const btn = document.querySelector('[title="AI Chat"]') as HTMLButtonElement; btn?.click() }, color: '#007acc' },
              ...(fsSupported && !fsActive ? [{
                icon: 'M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z', label: 'Open Folder', action: () => onOpenFolder?.(), color: '#c586c0',
              }] : []),
            ].flat().map(card => (
              <button key={card.label} onClick={card.action}
                className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
                style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
                <div className="size-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${card.color}20` }}>
                  <svg width="20" height="20" viewBox="0 0 16 16" fill={card.color}>
                    <path d={card.icon} stroke={card.icon.includes('stroke') ? card.color : undefined} strokeWidth={card.icon.includes('stroke') ? '1.5' : undefined} />
                  </svg>
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{card.label}</span>
              </button>
            ))}
          </div>

          <div className="grid gap-3 mb-6 animate-fade-in-up stagger-3">
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Quick Start Templates</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  { name: 'index.html', icon: 'M1 2.5A1.5 1.5 0 012.5 1h3.207a1.5 1.5 0 011.06.44l3.754 3.753a1.5 1.5 0 01.44 1.06V13.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 13.5V2.5z', color: '#e44d26' },
                  { name: 'style.css', icon: 'M1 2.5A1.5 1.5 0 012.5 1h3.207a1.5 1.5 0 011.06.44l3.754 3.753a1.5 1.5 0 01.44 1.06V13.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 13.5V2.5z', color: '#264de4' },
                  { name: 'app.js', icon: 'M1 2.5A1.5 1.5 0 012.5 1h3.207a1.5 1.5 0 011.06.44l3.754 3.753a1.5 1.5 0 01.44 1.06V13.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 13.5V2.5z', color: '#f7df1e' },
                  { name: 'App.tsx', icon: 'M1 2.5A1.5 1.5 0 012.5 1h3.207a1.5 1.5 0 011.06.44l3.754 3.753a1.5 1.5 0 01.44 1.06V13.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 13.5V2.5z', color: '#3178c6' },
                  { name: 'data.json', icon: 'M1 2.5A1.5 1.5 0 012.5 1h3.207a1.5 1.5 0 011.06.44l3.754 3.753a1.5 1.5 0 01.44 1.06V13.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 13.5V2.5z', color: '#292929' },
                ].map(t => (
                  <button key={t.name} onClick={() => handleTemplateCreate(t.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 hover:scale-105"
                    style={{ backgroundColor: `${t.color}18`, color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill={t.color}><path d={t.icon} /></svg>
                    {t.name}
                  </button>
                ))}
                <button onClick={() => setShowTemplates(!showTemplates)}
                  className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-dim)' }}>
                  More...
                </button>
              </div>
              {showTemplates && (
                <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  {['server.py', 'main.go', 'config.yaml', 'README.md', 'app.py', 'server.js', 'component.tsx'].map(t => (
                    <button key={t} onClick={() => handleTemplateCreate(t)}
                      className="px-2.5 py-1 rounded text-xs hover:bg-[var(--bg-hover)] transition-colors"
                      style={{ color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
                      + {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {fsActive && folderName && (
              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(197,134,192,0.08)', borderColor: '#c586c0' }}>
                <div className="flex items-center gap-2 mb-2">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="#c586c0">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <span className="text-xs font-medium" style={{ color: '#c586c0' }}>Working in: {folderName}</span>
                </div>
                <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                  Files are saved directly to your computer. Open your file manager to see them.
                </p>
              </div>
            )}

            {recentProjects.length > 0 && !fsActive && fsSupported && (
              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Recent Projects</h3>
                <div className="space-y-1">
                  {recentProjects.slice(0, 5).map((p) => (
                    <div key={p.name} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs"
                         style={{ color: 'var(--text-primary)' }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="#c586c0">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                      <span className="truncate">{p.name}</span>
                      <span className="ml-auto text-[10px]" style={{ color: 'var(--text-dim)' }}>
                        {new Date(p.lastOpened).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recentFiles.length > 0 && (
              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Recent Files</h3>
                <div className="space-y-1">
                  {recentFiles.slice(0, 6).map((f) => (
                    <button key={f.id} onClick={() => onFileSelect?.(f.id)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors hover:bg-[var(--bg-hover)]"
                      style={{ color: 'var(--text-primary)' }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="#519aba"><path d="M1 2.5A1.5 1.5 0 012.5 1h3.207a1.5 1.5 0 011.06.44l3.754 3.753a1.5 1.5 0 01.44 1.06V13.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 13.5V2.5z" /></svg>
                      <span className="truncate">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Keyboard Shortcuts</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs" style={{ color: 'var(--text-dim)' }}>
                {[
                  { keys: 'Ctrl+P', desc: 'Quick Open' },
                  { keys: 'Ctrl+Shift+P', desc: 'Command Palette' },
                  { keys: 'Ctrl+S', desc: 'Save File' },
                  { keys: 'Ctrl+`', desc: 'Toggle Terminal' },
                  { keys: 'Ctrl+B', desc: 'Toggle Sidebar' },
                  { keys: 'Ctrl+Shift+F', desc: 'Search' },
                  { keys: 'Ctrl+Shift+`', desc: 'New Terminal' },
                  { keys: 'Ctrl+K Z', desc: 'Zen Mode' },
                ].map(s => (
                  <div key={s.keys} className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
                         style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      {s.keys}
                    </kbd>
                    <span className="truncate">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] animate-fade-in" style={{ color: 'var(--text-dim)' }}>
            <a href="https://indranextechnologies.in/" target="_blank" rel="noopener noreferrer"
              className="hover:underline transition-opacity">
              IndraNext Technologies
            </a>
            &nbsp;&middot; <a href="mailto:info@indranextechnologies.in" className="hover:underline">info@indranextechnologies.in</a>
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
        onMount={handleMount}
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
