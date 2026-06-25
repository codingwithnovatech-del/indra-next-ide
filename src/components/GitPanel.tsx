import { memo, useState, useCallback } from 'react'
import type { FileNode } from '../types'

interface ChangedFile {
  path: string
  status: 'modified' | 'added' | 'deleted'
}

interface GitPanelProps {
  root: FileNode
}

let fileIndex: Record<string, string> = {}

function buildFileIndex(root: FileNode): Record<string, string> {
  const idx: Record<string, string> = {}
  function walk(nodes: FileNode[], prefix: string) {
    for (const n of nodes) {
      const path = prefix + n.name
      if (n.type === 'file' && n.content !== undefined) {
        idx[path] = n.content
      }
      if (n.children) walk(n.children, path + '/')
    }
  }
  if (root.children) walk(root.children, '')
  return idx
}

function GitPanel({ root }: GitPanelProps) {
  const [commitMsg, setCommitMsg] = useState('')
  const [branch] = useState('main')
  const [stagedFiles, setStagedFiles] = useState<Set<string>>(new Set())
  const [commitCount, setCommitCount] = useState(0)
  const [showCommitInput, setShowCommitInput] = useState(false)

  const currentIndex = buildFileIndex(root)

  const changedFiles: ChangedFile[] = []
  const allPaths = new Set([...Object.keys(fileIndex), ...Object.keys(currentIndex)])
  for (const p of allPaths) {
    if (!fileIndex[p]) changedFiles.push({ path: p, status: 'added' as const })
    else if (!currentIndex[p]) changedFiles.push({ path: p, status: 'deleted' as const })
    else if (fileIndex[p] !== currentIndex[p]) changedFiles.push({ path: p, status: 'modified' as const })
  }

  const toggleStage = useCallback((path: string) => {
    setStagedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const handleStageAll = useCallback(() => {
    setStagedFiles(new Set(changedFiles.map((f) => f.path)))
  }, [changedFiles])

  const handleUnstageAll = useCallback(() => {
    setStagedFiles(new Set())
  }, [])

  const handleCommit = useCallback(() => {
    if (!commitMsg.trim()) return
    fileIndex = { ...currentIndex }
    setCommitCount((c) => c + 1)
    setCommitMsg('')
    setStagedFiles(new Set())
    setShowCommitInput(false)
  }, [commitMsg, currentIndex])

  const statusIcons: Record<string, string> = {
    modified: 'M2 2v12h4V2H2zm1 1h2v3H3V3zm0 4h2v7H3V7zm5-5v12h4V2H8zm1 1h2v7H9V3zm0 8h2v3H9v-3zm5-5v9h4V6h-4zm1 1h2v7h-2V7zm0 8h2v2h-2v-2z',
    added: 'M8 2v12M2 8h12',
    deleted: 'M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1',
  }
  const statusColors: Record<string, string> = { modified: '#cca700', added: '#4ec9b0', deleted: '#f48771' }

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
      <div className="flex items-center justify-between px-3 h-[30px] text-[11px] font-semibold uppercase tracking-wider select-none"
           style={{ color: 'var(--text-muted)' }}>
        <span>SOURCE CONTROL</span>
        <span className="text-[10px] normal-case font-normal" style={{ color: 'var(--text-dim)' }}>{branch}</span>
      </div>

      {commitCount === 0 && Object.keys(fileIndex).length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-xs p-4 text-center" style={{ color: 'var(--text-dim)' }}>
          <div>
            <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor" className="mx-auto mb-2 opacity-40">
              <path d="M2 2v12h4V2H2zm1 1h2v3H3V3zm0 4h2v7H3V7zm5-5v12h4V2H8zm1 1h2v7H9V3zm0 8h2v3H9v-3zm5-5v9h4V6h-4zm1 1h2v7h-2V7zm0 8h2v2h-2v-2z" />
            </svg>
            <p className="text-sm font-medium mb-1">Initialize Repository</p>
            <p className="text-xs opacity-60 mb-3">Track changes to your files</p>
            <button onClick={() => { fileIndex = { ...currentIndex }; setCommitCount(0) }}
              className="px-4 py-1.5 rounded text-xs text-white"
              style={{ backgroundColor: 'var(--accent)' }}>
              Initialize Git
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 px-3 py-2 text-xs" style={{ color: 'var(--text-dim)' }}>
            <span>{changedFiles.length} change{changedFiles.length !== 1 ? 's' : ''}</span>
            {changedFiles.length > 0 && (
              <>
                <button onClick={handleStageAll} className="hover:text-white transition-colors">+</button>
                <button onClick={handleUnstageAll} className="hover:text-white transition-colors">-</button>
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {changedFiles.map((f) => (
              <div key={f.path}
                className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
                onClick={() => toggleStage(f.path)}>
                <div className="size-4 flex items-center justify-center rounded-sm border"
                     style={{
                       borderColor: 'var(--border)',
                       backgroundColor: stagedFiles.has(f.path) ? 'var(--accent)' : 'transparent',
                     }}>
                  {stagedFiles.has(f.path) && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" />
                    </svg>
                  )}
                </div>
                <svg width="12" height="12" viewBox="0 0 16 16" fill={statusColors[f.status]} className="shrink-0">
                  <path d={statusIcons[f.status]} />
                </svg>
                <span className="truncate flex-1">{f.path}</span>
              </div>
            ))}
          </div>

          <div className="border-t p-3" style={{ borderColor: 'var(--border)' }}>
            {showCommitInput ? (
              <div className="space-y-2">
                <textarea value={commitMsg} onChange={(e) => setCommitMsg(e.target.value)}
                  placeholder="Commit message..."
                  className="w-full h-[60px] rounded px-3 py-2 text-xs outline-none border resize-none"
                  style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                  onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleCommit() }}
                />
                <div className="flex gap-2">
                  <button onClick={() => { setShowCommitInput(false); setCommitMsg('') }}
                    className="flex-1 h-[30px] rounded text-xs transition-colors hover:bg-[var(--bg-hover)]"
                    style={{ color: 'var(--text-primary)' }}>
                    Cancel
                  </button>
                  <button onClick={handleCommit} disabled={!commitMsg.trim() || stagedFiles.size === 0}
                    className="flex-1 h-[30px] rounded text-xs text-white transition-opacity disabled:opacity-40"
                    style={{ backgroundColor: 'var(--accent)' }}>
                    Commit
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowCommitInput(true)} disabled={stagedFiles.size === 0}
                className="w-full h-[32px] rounded text-xs text-white transition-opacity disabled:opacity-40"
                style={{ backgroundColor: 'var(--accent)' }}>
                Commit ({stagedFiles.size} file{stagedFiles.size !== 1 ? 's' : ''})
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default memo(GitPanel)
