import { memo, useCallback, useState } from 'react'
import { FileTree } from './FileTree'
import SearchPanel from './SearchPanel'
import type { FileNode } from '../types'

type SidebarView = 'explorer' | 'search'

interface SidebarProps {
  root: FileNode
  activeFileId: string | null
  onFileClick: (id: string) => void
  onCreateItem: (parentId: string, type: 'file' | 'folder', name: string) => string
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  isOpen: boolean
}

function Sidebar({
  root,
  activeFileId,
  onFileClick,
  onCreateItem,
  onRename,
  onDelete,
  isOpen,
}: SidebarProps) {
  const [view, setView] = useState<SidebarView>('explorer')
  const [renamingId, setRenamingId] = useState<string | null>(null)

  const handleCreateChild = useCallback(
    (parentId: string, type: 'file' | 'folder') => {
      const baseName = type === 'file' ? 'new-file.ts' : 'new-folder'
      const id = onCreateItem(parentId, type, baseName)
      setRenamingId(id)
    },
    [onCreateItem],
  )

  const handleRename = useCallback(
    (id: string, name: string) => {
      onRename(id, name)
      setRenamingId(null)
    },
    [onRename],
  )

  return (
    <aside
      className={`w-[260px] shrink-0 border-r flex flex-col
                  max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40
                  max-md:transition-transform max-md:duration-200 max-md:ease-out
                  ${isOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}`}
      style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
    >
      <div className="flex shrink-0 border-b" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setView('explorer')}
          className="flex-1 flex items-center justify-center h-[36px] text-[11px] font-semibold uppercase tracking-wider gap-1.5 transition-colors"
          style={{
            color: view === 'explorer' ? 'var(--text-primary)' : 'var(--text-dim)',
            borderBottom: view === 'explorer' ? '2px solid var(--accent)' : '2px solid transparent',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 2.5A1.5 1.5 0 012.5 1h3.207a1.5 1.5 0 011.06.44l1.122 1.12H13.5A1.5 1.5 0 0115 4.06v8.44a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 011 12.5V2.5z" />
          </svg>
          Files
        </button>
        <button
          onClick={() => setView('search')}
          className="flex-1 flex items-center justify-center h-[36px] text-[11px] font-semibold uppercase tracking-wider gap-1.5 transition-colors"
          style={{
            color: view === 'search' ? 'var(--text-primary)' : 'var(--text-dim)',
            borderBottom: view === 'search' ? '2px solid var(--accent)' : '2px solid transparent',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398l3.85 3.85a1 1 0 001.415-1.414l-3.868-3.834zm-5.242.156a5 5 0 110-10 5 5 0 010 10z" />
          </svg>
          Search
        </button>
      </div>

      {view === 'explorer' ? (
        <>
          <div className="flex items-center justify-between px-3 h-[30px] text-[11px] font-semibold uppercase tracking-wider select-none"
               style={{ color: 'var(--text-muted)' }}>
            <span>Explorer</span>
            <span className="flex items-center gap-0.5">
              <button
                onClick={() => handleCreateChild(root.id, 'file')}
                className="flex size-5 items-center justify-center rounded hover:bg-[var(--bg-hover)] hover:text-white transition-colors"
                style={{ color: 'var(--text-dim)' }}
                title="New File"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </button>
              <button
                onClick={() => handleCreateChild(root.id, 'folder')}
                className="flex size-5 items-center justify-center rounded hover:bg-[var(--bg-hover)] hover:text-white transition-colors"
                style={{ color: 'var(--text-dim)' }}
                title="New Folder"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M.5 3.5A1.5 1.5 0 012 2h3.879a1.5 1.5 0 011.06.44l1.122 1.12H14a1.5 1.5 0 011.5 1.5v7.44a1.5 1.5 0 01-1.5 1.5H2a1.5 1.5 0 01-1.5-1.5V3.5z" />
                  <path d="M7 7h2v2H7z" fill="#252526" />
                </svg>
              </button>
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pt-1">
            {root.children && (
              <FileTree
                nodes={root.children}
                activeFileId={activeFileId}
                renamingId={renamingId}
                onFileClick={onFileClick}
                onStartRename={setRenamingId}
                onRename={handleRename}
                onDelete={onDelete}
                onCreateChild={handleCreateChild}
              />
            )}
          </div>
        </>
      ) : (
        <SearchPanel root={root} onFileClick={onFileClick} onClose={() => setView('explorer')} />
      )}
    </aside>
  )
}

export default memo(Sidebar)
