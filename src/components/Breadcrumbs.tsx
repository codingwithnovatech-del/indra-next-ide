import { memo, useMemo } from 'react'
import type { FileNode } from '../types'

interface BreadcrumbsProps {
  activeFileId: string | null
  root: FileNode
  onNavigate?: (id: string) => void
}

function buildPathToId(root: FileNode, targetId: string): { id: string; name: string }[] {
  const path: { id: string; name: string }[] = []

  function walk(node: FileNode): boolean {
    if (node.id === targetId) {
      path.push({ id: node.id, name: node.name })
      return true
    }
    if (!node.children) return false
    for (const child of node.children) {
      if (walk(child)) {
        path.unshift({ id: node.id, name: node.name })
        return true
      }
    }
    return false
  }

  walk(root)
  return path
}

function Breadcrumbs({ activeFileId, root, onNavigate }: BreadcrumbsProps) {
  const path = useMemo(
    () => (activeFileId ? buildPathToId(root, activeFileId) : []),
    [root, activeFileId],
  )

  if (path.length < 2) return null

  return (
    <div className="flex h-[22px] shrink-0 items-center gap-0.5 px-3 text-xs select-none overflow-x-auto scrollbar-hide"
         style={{ backgroundColor: 'var(--bg-tab-active)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
      {path.slice(0, -1).map((seg, i) => (
        <span key={seg.id} className="flex items-center gap-0.5 whitespace-nowrap">
          <button
            onClick={() => onNavigate?.(seg.id)}
            className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {seg.name}
          </button>
          {i < path.length - 2 && (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="opacity-50">
              <path d="M6 12L10 8 6 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          )}
        </span>
      ))}
      <span className="text-[var(--text-primary)] whitespace-nowrap">{path[path.length - 1]?.name}</span>
    </div>
  )
}

export default memo(Breadcrumbs)
