export interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  children?: FileNode[]
  path?: string
}

export interface RecentProject {
  name: string
  lastOpened: number
}

export interface TabItem {
  id: string
  name: string
  isActive: boolean
  isDirty?: boolean
}
