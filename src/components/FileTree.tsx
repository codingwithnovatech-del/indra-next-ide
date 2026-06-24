import { memo } from 'react'
import type { FileNode } from '../types'
import FileTreeItem from './FileTreeItem'

interface FileTreeProps {
  nodes: FileNode[]
  activeFileId: string | null
  renamingId: string | null
  onFileClick: (id: string) => void
  onStartRename: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onCreateChild: (parentId: string, type: 'file' | 'folder') => void
}

function FileTree({
  nodes,
  activeFileId,
  renamingId,
  onFileClick,
  onStartRename,
  onRename,
  onDelete,
  onCreateChild,
}: FileTreeProps) {
  return (
    <div>
      {nodes.map((node) => (
        <FileTreeItem
          key={node.id}
          node={node}
          depth={0}
          activeFileId={activeFileId}
          renamingId={renamingId}
          onFileClick={onFileClick}
          onStartRename={onStartRename}
          onRename={onRename}
          onDelete={onDelete}
          onCreateChild={onCreateChild}
        />
      ))}
    </div>
  )
}

export { FileTree }
export default memo(FileTree)
