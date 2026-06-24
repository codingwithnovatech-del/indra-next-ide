import { memo, useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { FileNode } from '../types'

export interface Command {
  id: string
  label: string
  description?: string
  category?: string
  action: () => void
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  mode: 'files' | 'commands'
  files: FileNode[]
  commands: Command[]
  activeFileId: string | null
  onFileClick: (id: string) => void
  onCreateFile: (name: string) => void
}

function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  let qi = 0
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) qi++
  }
  return qi === q.length
}

function flattenFiles(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = []
  function walk(list: FileNode[]) {
    for (const n of list) {
      if (n.type === 'file') result.push(n)
      if (n.children) walk(n.children)
    }
  }
  walk(nodes)
  return result
}

function CommandPalette({
  isOpen,
  onClose,
  mode: paletteMode,
  files,
  commands,
  activeFileId,
  onFileClick,
  onCreateFile,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen, paletteMode])

  const flatFiles = useMemo(() => flattenFiles(files), [files])

  const filteredItems = useMemo(() => {
    if (paletteMode === 'files') {
      if (!query.trim()) return flatFiles.slice(0, 50)
      return flatFiles.filter((f) => fuzzyMatch(f.name, query)).slice(0, 50)
    }
    if (!query.trim()) return commands
    return commands.filter(
      (c) => fuzzyMatch(c.label, query) || (c.description && fuzzyMatch(c.description, query)),
    )
  }, [paletteMode, flatFiles, commands, query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query, paletteMode])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const item = filteredItems[selectedIndex]
        if (!item) return
        if (paletteMode === 'files') {
          const f = item as FileNode
          if (f.id !== activeFileId) onFileClick(f.id)
        } else {
          const c = item as Command
          c.action()
        }
        onClose()
      }
    },
    [filteredItems, selectedIndex, paletteMode, activeFileId, onFileClick, onClose],
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh]" onClick={onClose}>
      <div
        className="w-full max-w-[600px] mx-4 rounded-lg shadow-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b px-3" style={{ borderColor: 'var(--border)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--text-dim)" className="shrink-0 mr-2">
            <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398l3.85 3.85a1 1 0 001.415-1.414l-3.868-3.834zm-5.242.156a5 5 0 110-10 5 5 0 010 10z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={paletteMode === 'files' ? 'Search files by name...' : 'Type a command...'}
            className="flex-1 h-[44px] bg-transparent text-sm outline-none placeholder:text-[var(--text-dim)]"
            style={{ color: 'var(--text-primary)' }}
          />
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-dim)' }}>
            {paletteMode === 'files' ? 'Ctrl+P' : 'Ctrl+Shift+P'}
          </span>
        </div>

        <div ref={listRef} className="max-h-[320px] overflow-y-auto py-1">
          {filteredItems.length === 0 && (
            <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-dim)' }}>
              {paletteMode === 'files' ? (
                <div>
                  <p>No files found</p>
                  <button
                    onClick={() => {
                      if (query.trim()) onCreateFile(query.trim())
                      onClose()
                    }}
                    className="mt-2 text-xs underline hover:no-underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    Create "{query.trim()}"
                  </button>
                </div>
              ) : (
                <p>No commands found</p>
              )}
            </div>
          )}
          {filteredItems.map((item, i) => {
            const isFile = paletteMode === 'files'
            const f = item as FileNode
            const c = item as Command
            const isSelected = i === selectedIndex
            return (
              <div
                key={isFile ? f.id : c.id}
                className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer"
                style={{
                  backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={() => {
                  if (isFile) {
                    if (f.id !== activeFileId) onFileClick(f.id)
                  } else {
                    c.action()
                  }
                  onClose()
                }}
              >
                {isFile ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="#519aba" className="shrink-0">
                      <path d="M1 2.5A1.5 1.5 0 012.5 1h3.207a1.5 1.5 0 011.06.44l3.754 3.753a1.5 1.5 0 01.44 1.06V13.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 13.5V2.5z" />
                    </svg>
                    <span className="flex-1 truncate">{f.name}</span>
                  </>
                ) : (
                  <>
                    <span className="flex-1 truncate">{c.label}</span>
                    {c.description && (
                      <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{c.description}</span>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default memo(CommandPalette)
