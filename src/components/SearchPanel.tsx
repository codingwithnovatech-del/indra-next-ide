import { memo, useState, useMemo, useRef } from 'react'
import type { FileNode } from '../types'

interface SearchPanelProps {
  root: FileNode
  onFileClick: (id: string) => void
  onClose: () => void
  onReplace?: (fileId: string, query: string, replacement: string) => void
}

interface SearchResult {
  fileId: string
  fileName: string
  line: number
  text: string
  matchStart: number
  matchEnd: number
}

function collectFiles(node: FileNode, results: FileNode[] = []): FileNode[] {
  if (node.type === 'file') results.push(node)
  node.children?.forEach((c) => collectFiles(c, results))
  return results
}

function searchInContent(content: string, query: string, fileId: string, fileName: string, caseSensitive: boolean, wholeWord: boolean): SearchResult[] {
  const results: SearchResult[] = []
  const source = caseSensitive ? content : content.toLowerCase()
  const search = caseSensitive ? query : query.toLowerCase()
  let pos = 0

  while (true) {
    const idx = source.indexOf(search, pos)
    if (idx === -1) break

    if (wholeWord) {
      const charBefore = idx > 0 ? source[idx - 1] : ' '
      const charAfter = idx + search.length < source.length ? source[idx + search.length] : ' '
      if (/\w/.test(charBefore) || /\w/.test(charAfter)) {
        pos = idx + 1
        continue
      }
    }

    let lineNum = 1
    let lineStart = 0
    for (let i = 0; i < idx; i++) {
      if (content[i] === '\n') { lineNum++; lineStart = i + 1 }
    }

    const lineEnd = content.indexOf('\n', idx)
    const lineText = content.slice(lineStart, lineEnd === -1 ? undefined : lineEnd)

    results.push({
      fileId,
      fileName,
      line: lineNum,
      text: lineText,
      matchStart: idx - lineStart,
      matchEnd: idx - lineStart + query.length,
    })

    pos = idx + query.length
  }

  return results
}

function SearchPanel({ root, onFileClick, onClose, onReplace }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [showReplace, setShowReplace] = useState(false)
  const [isCaseSensitive, setIsCaseSensitive] = useState(false)
  const [isWholeWord, setIsWholeWord] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const allFiles = useMemo(() => collectFiles(root), [root])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const all: SearchResult[] = []
    for (const file of allFiles) {
      if (!file.content) continue
      const matches = searchInContent(file.content, query, file.id, file.name, isCaseSensitive, isWholeWord)
      all.push(...matches)
    }
    return all
  }, [allFiles, query, isCaseSensitive, isWholeWord])

  const fileCount = useMemo(() => {
    const ids = new Set(results.map((r) => r.fileId))
    return ids.size
  }, [results])

  const handleReplaceAll = () => {
    if (!onReplace || !query.trim()) return
    const seen = new Set<string>()
    for (const r of results) {
      if (!seen.has(r.fileId)) {
        seen.add(r.fileId)
        onReplace(r.fileId, query, replaceText)
      }
    }
  }

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b text-xs font-semibold uppercase tracking-wider select-none"
           style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        <span>Search</span>
        <div className="flex items-center gap-1">
          {onReplace && (
            <button onClick={() => setShowReplace(p => !p)}
              className="flex size-5 items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
              style={{ color: showReplace ? 'var(--accent)' : 'var(--text-dim)' }}
              title="Toggle replace">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2h12v12H2V2zm1 1v10h10V3H3zm2 3h6v1H5V6zm0 2h4v1H5V8zm0 2h6v1H5v-1z" />
              </svg>
             </button>
          )}
          <button onClick={onClose} className="flex size-5 items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-2">
        <div className="flex items-center gap-1 rounded px-2" style={{ backgroundColor: 'var(--bg-input)' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="var(--text-dim)" className="shrink-0">
            <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398l3.85 3.85a1 1 0 001.415-1.414l-3.868-3.834zm-5.242.156a5 5 0 110-10 5 5 0 010 10z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files..."
            className="flex-1 h-[28px] bg-transparent text-xs outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
        {showReplace && onReplace && (
          <div className="flex items-center gap-1 rounded px-2 mt-1" style={{ backgroundColor: 'var(--bg-input)' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="var(--text-dim)" className="shrink-0">
              <path d="M.5 3.5A1.5 1.5 0 012 2h12a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0114 14H2a1.5 1.5 0 01-1.5-1.5v-9zM2 3a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h12a.5.5 0 00.5-.5v-9A.5.5 0 0014 3H2zm2 2.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm0 3a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5z" />
            </svg>
            <input value={replaceText} onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace with..."
              className="flex-1 h-[28px] bg-transparent text-xs outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <label className="flex cursor-pointer items-center gap-1 text-xs" style={{ color: 'var(--text-dim)' }}>
            <input type="checkbox" checked={isCaseSensitive} onChange={(e) => setIsCaseSensitive(e.target.checked)}
                   className="size-3 accent-[var(--accent)]" />
            Aa
          </label>
          <label className="flex cursor-pointer items-center gap-1 text-xs" style={{ color: 'var(--text-dim)' }}>
            <input type="checkbox" checked={isWholeWord} onChange={(e) => setIsWholeWord(e.target.checked)}
                   className="size-3 accent-[var(--accent)]" />
            W
          </label>
        </div>
      </div>

      {query && (
        <div className="flex items-center justify-between px-3 py-1 text-xs" style={{ color: 'var(--text-dim)' }}>
          <span>{results.length} results in {fileCount} files</span>
          {showReplace && onReplace && results.length > 0 && (
            <button onClick={handleReplaceAll}
              className="text-[10px] px-2 py-0.5 rounded hover:bg-[var(--bg-hover)] transition-colors"
              style={{ color: 'var(--accent)' }}>
              Replace All
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {results.map((r, i) => {
          const isFirstInFile = i === 0 || results[i - 1].fileId !== r.fileId
          return (
            <div key={`${r.fileId}-${r.line}-${i}`}>
              {isFirstInFile && (
                <div className="flex items-center justify-between gap-1.5 px-3 py-1 text-xs font-medium"
                     style={{ color: 'var(--text-primary)' }}>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="#519aba" className="shrink-0">
                      <path d="M1 2.5A1.5 1.5 0 012.5 1h3.207a1.5 1.5 0 011.06.44l3.754 3.753a1.5 1.5 0 01.44 1.06V13.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 13.5V2.5z" />
                    </svg>
                    <span className="truncate">{r.fileName}</span>
                  </div>
                  {showReplace && onReplace && (
                    <button onClick={() => onReplace(r.fileId, query, replaceText)}
                      className="shrink-0 text-[10px] px-1.5 py-0.5 rounded hover:bg-[var(--bg-hover)] transition-colors"
                      style={{ color: 'var(--accent)' }}>
                      Replace
                    </button>
                  )}
                </div>
              )}
              <div
                className="flex cursor-pointer gap-2 px-3 py-0.5 text-xs hover:bg-[var(--bg-hover)] transition-colors"
                onClick={() => onFileClick(r.fileId)}
              >
                <span className="shrink-0 w-6 text-right" style={{ color: 'var(--text-dim)' }}>{r.line}</span>
                <span className="truncate whitespace-pre" style={{ color: 'var(--text-muted)' }}>
                  {r.text.slice(0, Math.max(0, r.matchStart))}
                  {r.matchStart <= r.text.length && (
                    <span style={{ backgroundColor: 'rgba(0,122,204,0.3)' }}>
                      {r.text.slice(Math.max(0, r.matchStart), Math.min(r.text.length, Math.max(0, r.matchEnd)))}
                    </span>
                  )}
                  {r.text.slice(Math.min(r.text.length, Math.max(0, r.matchEnd)))}
                </span>
              </div>
            </div>
          )
        })}
        {query && results.length === 0 && (
          <div className="px-3 py-4 text-center text-xs" style={{ color: 'var(--text-dim)' }}>
            No results found
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(SearchPanel)
