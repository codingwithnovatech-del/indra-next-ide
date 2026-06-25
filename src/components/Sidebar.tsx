import { memo, useCallback } from 'react'
import { FileTree } from './FileTree'
import SearchPanel from './SearchPanel'
import SettingsPanel from './SettingsPanel'
import GitPanel from './GitPanel'
import SnippetsPanel from './SnippetsPanel'
import HelpPanel from './HelpPanel'
import AIPanel from './AIPanel'
import type { FileNode } from '../types'
import type { ActivityBarView } from './ActivityBar'
import type { ThemeMode } from '../hooks/useTheme'
import type { Settings } from './SettingsPanel'

interface SidebarProps {
  root: FileNode
  activeFileId: string | null
  onFileClick: (id: string) => void
  onCreateItem: (parentId: string, type: 'file' | 'folder', name: string) => string
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  isOpen: boolean
  view: ActivityBarView
  renamingId: string | null
  onStartRename: (id: string | null) => void
  themeMode?: ThemeMode
  onThemeChange?: (mode: ThemeMode) => void
  settings?: Settings
  onSettingsChange?: (settings: Settings) => void
  onContextMenu?: (e: React.MouseEvent, fileId: string) => void
}

function Sidebar({
  root,
  activeFileId,
  onFileClick,
  onCreateItem,
  onRename,
  onDelete,
  isOpen,
  view,
  renamingId,
  onStartRename,
  themeMode,
  onThemeChange,
  settings,
  onSettingsChange,
  onContextMenu,
}: SidebarProps) {
  const handleCreateChild = useCallback(
    (parentId: string, type: 'file' | 'folder') => {
      const baseName = type === 'file' ? 'new-file.ts' : 'new-folder'
      const id = onCreateItem(parentId, type, baseName)
      onStartRename(id)
    },
    [onCreateItem, onStartRename],
  )

  const handleRename = useCallback(
    (id: string, name: string) => {
      onRename(id, name)
      onStartRename(null)
    },
    [onRename, onStartRename],
  )

  return (
    <aside
      className={`w-[260px] shrink-0 border-r flex flex-col
                  max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40
                  max-md:transition-transform max-md:duration-200 max-md:ease-out
                  ${isOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}`}
      style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
    >
      {view === 'explorer' && (
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
            {root.children && root.children.length > 0 ? (
              <FileTree
                nodes={root.children}
                activeFileId={activeFileId}
                renamingId={renamingId}
                onFileClick={onFileClick}
                onStartRename={onStartRename}
                onRename={handleRename}
                onDelete={onDelete}
                onCreateChild={handleCreateChild}
                onContextMenu={onContextMenu}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-xs p-4 text-center"
                   style={{ color: 'var(--text-dim)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2 opacity-40">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <p className="mb-2">No files in workspace</p>
                <button onClick={() => handleCreateChild(root.id, 'file')}
                  className="px-3 py-1 rounded text-xs"
                  style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
                  + New File
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {view === 'search' && (
        <SearchPanel root={root} onFileClick={onFileClick} onClose={() => onStartRename(null)} />
      )}

      {view === 'git' && (
        <GitPanel root={root} />
      )}

      {view === 'extensions' && (
        <div className="flex flex-1 items-center justify-center text-xs" style={{ color: 'var(--text-dim)' }}>
          <div className="text-center p-4">
            <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor" className="mx-auto mb-2 opacity-40">
              <path d="M3.5 0h5.707a1.5 1.5 0 011.06.44l2.793 2.793A1.5 1.5 0 0113.5 4.293V12.5a1.5 1.5 0 01-1.5 1.5h-1v-1h1a.5.5 0 00.5-.5V4.707a.5.5 0 00-.146-.353L9.646 1.646A.5.5 0 009.293 1.5H3.5a.5.5 0 00-.5.5v1h-1V2a2 2 0 012-2zm0 4h5.5v1H3.5V4zm0 3h5.5v1H3.5V7zm0 3h3.5v1H3.5v-1z" />
            </svg>
            <p className="text-sm font-medium mb-1">Extensions</p>
            <p className="text-xs opacity-60">Extension marketplace coming soon</p>
          </div>
        </div>
      )}

      {view === 'snippets' && (
        <SnippetsPanel visible={true} />
      )}

      {view === 'settings' && themeMode && onThemeChange && settings !== undefined && onSettingsChange && (
        <SettingsPanel
          themeMode={themeMode}
          onThemeChange={onThemeChange}
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      )}
      {view === 'help' && <HelpPanel />}
      {view === 'ai' && <AIPanel />}
    </aside>
  )
}

export default memo(Sidebar)
