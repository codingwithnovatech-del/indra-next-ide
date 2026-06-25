import { memo, useState, useRef, useEffect, useCallback } from 'react'
import type { FileNode } from '../types'
import { getFileIconColor, getFolderIconColor } from '../data/fileIcons'

interface FileTreeItemProps {
  node: FileNode
  depth: number
  activeFileId: string | null
  renamingId: string | null
  onFileClick: (id: string) => void
  onStartRename: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onCreateChild: (parentId: string, type: 'file' | 'folder') => void
  onContextMenu?: (e: React.MouseEvent, fileId: string) => void
}

function FileTreeItem({
  node,
  depth,
  activeFileId,
  renamingId,
  onFileClick,
  onStartRename,
  onRename,
  onDelete,
  onCreateChild,
  onContextMenu,
}: FileTreeItemProps) {
  const [expanded, setExpanded] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [localRenameValue, setLocalRenameValue] = useState(node.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const isFolder = node.type === 'folder'
  const isActive = node.id === activeFileId
  const isRenaming = node.id === renamingId

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  useEffect(() => {
    setLocalRenameValue(node.name)
  }, [node.name])

  const handleClick = useCallback(() => {
    if (isFolder) {
      setExpanded((prev) => !prev)
    } else {
      onFileClick(node.id)
    }
  }, [isFolder, node.id, onFileClick])

  const handleRenameSubmit = useCallback(() => {
    const trimmed = localRenameValue.trim()
    if (trimmed && trimmed !== node.name) {
      onRename(node.id, trimmed)
    }
  }, [localRenameValue, node.id, node.name, onRename])

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleRenameSubmit()
        onStartRename('')
      } else if (e.key === 'Escape') {
        setLocalRenameValue(node.name)
        onStartRename('')
      }
    },
    [handleRenameSubmit, node.name, onStartRename],
  )

  return (
    <>
      <div
        className={`group flex cursor-pointer items-center gap-1 pr-2 text-sm transition-colors duration-75`}
        style={{
          paddingLeft: `${8 + depth * 16}px`,
          minHeight: '28px',
          backgroundColor: isRenaming
            ? 'var(--bg-hover)'
            : isActive
              ? 'var(--bg-active)'
              : 'transparent',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu?.(e, node.id)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          className={`shrink-0 transition-transform duration-150 ${isFolder && expanded ? 'rotate-0' : ''}`}
          style={{ color: isFolder ? getFolderIconColor() : getFileIconColor(node.name) }}
        >
          {isFolder ? (
            expanded ? (
              <path d="M1 2.5A1.5 1.5 0 012.5 1h2.879a1.5 1.5 0 011.06.44l1.122 1.12H13.5A1.5 1.5 0 0115 4.06v8.44a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 011 12.5V2.5z" />
            ) : (
              <path d="M.5 3.5A1.5 1.5 0 012 2h3.879a1.5 1.5 0 011.06.44l1.122 1.12H14a1.5 1.5 0 011.5 1.5v7.44a1.5 1.5 0 01-1.5 1.5H2a1.5 1.5 0 01-1.5-1.5V3.5z" />
            )
          ) : (
            <path d="M1 2.5A1.5 1.5 0 012.5 1h3.207a1.5 1.5 0 011.06.44l3.754 3.753a1.5 1.5 0 01.44 1.06V13.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 13.5V2.5z" />
          )}
        </svg>

        {isRenaming ? (
          <input
            ref={inputRef}
            className="min-w-0 flex-1 px-1 py-[1px] text-sm rounded-none"
            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', outline: '1px solid var(--accent)' }}
            value={localRenameValue}
            onChange={(e) => setLocalRenameValue(e.target.value)}
            onBlur={() => { handleRenameSubmit(); onStartRename('') }}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{node.name}</span>
        )}

        {isHovered && !isRenaming && (
          <span className="ml-auto flex items-center gap-0.5">
            {isFolder && (
              <button
                onClick={(e) => { e.stopPropagation(); onCreateChild(node.id, 'file') }}
                className="flex size-4 items-center justify-center rounded hover:bg-[#ffffff1a] text-[#969696] hover:text-white transition-colors"
                title="New File"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </button>
            )}
            {isFolder && (
              <button
                onClick={(e) => { e.stopPropagation(); onCreateChild(node.id, 'folder') }}
                className="flex size-4 items-center justify-center rounded hover:bg-[#ffffff1a] text-[#969696] hover:text-white transition-colors"
                title="New Folder"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M.5 3.5A1.5 1.5 0 012 2h3.879a1.5 1.5 0 011.06.44l1.122 1.12H14a1.5 1.5 0 011.5 1.5v7.44a1.5 1.5 0 01-1.5 1.5H2a1.5 1.5 0 01-1.5-1.5V3.5z" />
                  <path d="M7 7h2v2H7z" fill="#252526" />
                </svg>
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onStartRename(node.id) }}
              className="flex size-4 items-center justify-center rounded hover:bg-[#ffffff1a] text-[#969696] hover:text-white transition-colors"
              title="Rename"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(node.id) }}
              className="flex size-4 items-center justify-center rounded hover:bg-[#ffffff1a] text-[#969696] hover:text-red-400 transition-colors"
              title="Delete"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
                <path d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1z" />
              </svg>
            </button>
          </span>
        )}
      </div>

      {isFolder && expanded && node.children?.map((child) => (
        <FileTreeItem
          key={child.id}
          node={child}
          depth={depth + 1}
          activeFileId={activeFileId}
          renamingId={renamingId}
          onFileClick={onFileClick}
          onStartRename={onStartRename}
          onRename={onRename}
          onDelete={onDelete}
          onCreateChild={onCreateChild}
          onContextMenu={onContextMenu}
        />
      ))}
    </>
  )
}

export default memo(FileTreeItem)
