export interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  children?: FileNode[]
}

export interface TabItem {
  id: string
  name: string
  isActive: boolean
  isDirty?: boolean
}
