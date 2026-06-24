import { memo, useCallback } from 'react'
import Editor, { type BeforeMount } from '@monaco-editor/react'
import type { TabItem } from '../types'

interface EditorAreaProps {
  activeTab: TabItem | undefined
  content: string
  onChange: (value: string | undefined) => void
  isDark?: boolean
}

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
  minimap: { enabled: true, size: 'proportional' as const, maxColumn: 60, showSlider: 'mouseover' as const },
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
  multiCursorModifier: 'alt',
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
}

function EditorArea({ activeTab, content, onChange, isDark = true }: EditorAreaProps) {
  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
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

  const themeName = isDark ? 'indra-dark' : 'indra-light'

  if (!activeTab) {
    return (
      <div className="flex flex-1 items-center justify-center" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="text-center" style={{ color: 'var(--text-dim)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-50">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <p className="text-sm">Open a file to start editing</p>
          <p className="text-xs mt-2">Ctrl+P to search files</p>
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
            Loading editor...
          </div>
        }
      />
    </div>
  )
}

export default memo(EditorArea)
