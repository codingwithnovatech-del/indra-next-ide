import { useState, useCallback, useRef } from 'react'
import type { FileNode, RecentProject } from '../types'
import { generateId } from '../data/virtualFileSystem'

const RECENT_KEY = 'indranext-recent-folders'
const IGNORE_DIRS = new Set(['node_modules', '.git', '.next', 'dist', '.vscode', '.cache', '__pycache__', 'coverage', '.vercel'])
const ALLOWED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.html', '.htm', '.css', '.scss', '.less', '.json', '.md', '.py', '.rs', '.go', '.vue', '.svelte', '.yaml', '.yml', '.toml', '.xml', '.svg', '.txt', '.env', '.gitignore', '.editorconfig', '.prettierrc', '.eslintrc'])

interface TreeResult {
  root: FileNode
  idToPath: Map<string, string>
}

async function readDirectoryRecursive(
  dirHandle: FileSystemDirectoryHandle,
  parentPath = '',
  ignoreDotFiles: boolean,
): Promise<TreeResult> {
  const children: FileNode[] = []
  const idToPath = new Map<string, string>()
  const entries: [string, FileSystemHandle][] = []

  for await (const entry of dirHandle.entries()) {
    entries.push(entry)
  }

  entries.sort((a, b) => {
    if (a[1].kind !== b[1].kind) return a[1].kind === 'directory' ? -1 : 1
    return a[0].localeCompare(b[0])
  })

  for (const [name, handle] of entries) {
    if (ignoreDotFiles && name.startsWith('.')) continue
    if (handle.kind === 'directory' && IGNORE_DIRS.has(name)) continue

    const relativePath = parentPath ? `${parentPath}/${name}` : name
    const id = generateId()

    if (handle.kind === 'file') {
      try {
        const file = await (handle as FileSystemFileHandle).getFile()
        const ext = '.' + name.split('.').pop()?.toLowerCase()
        const content = ALLOWED_EXTENSIONS.has(ext) || ext === '.' + name ? await file.text() : ''
        children.push({ id, name, type: 'file', content, path: relativePath })
        idToPath.set(id, relativePath)
      } catch {
        children.push({ id, name, type: 'file', content: '', path: relativePath })
        idToPath.set(id, relativePath)
      }
    } else {
      const subResult = await readDirectoryRecursive(handle as FileSystemDirectoryHandle, relativePath, ignoreDotFiles)
      children.push({ id, name, type: 'folder', children: subResult.root.children, path: relativePath })
      for (const [subId, subPath] of subResult.idToPath) {
        idToPath.set(subId, subPath)
      }
    }
  }

  const rootId = generateId()
  const root: FileNode = { id: rootId, name: dirHandle.name, type: 'folder', children, path: '' }
  idToPath.set(rootId, '')
  return { root, idToPath }
}

async function getNestedHandle(
  rootHandle: FileSystemDirectoryHandle,
  relativePath: string,
  create = false,
): Promise<[FileSystemDirectoryHandle, string]> {
  const parts = relativePath.split('/')
  const fileName = parts.pop()!
  let dirHandle = rootHandle
  for (const part of parts) {
    dirHandle = await dirHandle.getDirectoryHandle(part, { create })
  }
  return [dirHandle, fileName]
}

export function useFileSystemAccess() {
  const [isActive, setIsActive] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [, setFolderHandle] = useState<FileSystemDirectoryHandle | null>(null)
  const [ignoreDotFiles, setIgnoreDotFiles] = useState(true)

  const isSupported = 'showDirectoryPicker' in window
  const folderHandleRef = useRef<FileSystemDirectoryHandle | null>(null)

  const getRecentProjects = useCallback((): RecentProject[] => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    } catch { return [] }
  }, [])

  const addRecentProject = useCallback((name: string) => {
    try {
      const list = getRecentProjects().filter(p => p.name !== name)
      list.unshift({ name, lastOpened: Date.now() })
      localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 10)))
    } catch { /* ignore */ }
  }, [getRecentProjects])

  const checkPermission = useCallback(async (handle: FileSystemDirectoryHandle): Promise<boolean> => {
    try {
      const opts = { mode: 'readwrite' } as any
      if (await (handle as any).queryPermission(opts) === 'granted') return true
      const result = await (handle as any).requestPermission(opts)
      return result === 'granted'
    } catch { return false }
  }, [])

  const openFolder = useCallback(async (): Promise<TreeResult | null> => {
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' }) as FileSystemDirectoryHandle
      const hasPermission = await checkPermission(handle)
      if (!hasPermission) {
        throw new Error('Folder access permission denied. Please allow read/write access.')
      }

      setFolderHandle(handle)
      folderHandleRef.current = handle
      setFolderName(handle.name)
      addRecentProject(handle.name)

      const result = await readDirectoryRecursive(handle, '', ignoreDotFiles)
      setIsActive(true)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open folder'
      throw new Error(message)
    }
  }, [checkPermission, addRecentProject, ignoreDotFiles])

  const closeFolder = useCallback(() => {
    setIsActive(false)
    setFolderName('')
    setFolderHandle(null)
    folderHandleRef.current = null
  }, [])

  const ensurePermission = useCallback(async (): Promise<boolean> => {
    const handle = folderHandleRef.current
    if (!handle) return false
    const hasPerm = await checkPermission(handle)
    if (!hasPerm) {
      throw new Error('Permission revoked. Please reopen the folder.')
    }
    return true
  }, [checkPermission])

  const writeFile = useCallback(async (relativePath: string, content: string): Promise<void> => {
    const handle = folderHandleRef.current
    if (!handle) throw new Error('No folder open')
    await ensurePermission()
    const [dirHandle, fileName] = await getNestedHandle(handle, relativePath, true)
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(content)
    await writable.close()
  }, [ensurePermission])

  const createFile = useCallback(async (relativePath: string): Promise<void> => {
    const handle = folderHandleRef.current
    if (!handle) throw new Error('No folder open')
    await ensurePermission()
    const [dirHandle, fileName] = await getNestedHandle(handle, relativePath, true)
    await dirHandle.getFileHandle(fileName, { create: true })
  }, [ensurePermission])

  const createDirectory = useCallback(async (relativePath: string): Promise<void> => {
    const handle = folderHandleRef.current
    if (!handle) throw new Error('No folder open')
    await ensurePermission()
    const parts = relativePath.split('/')
    let dirHandle = handle
    for (const part of parts) {
      dirHandle = await dirHandle.getDirectoryHandle(part, { create: true })
    }
  }, [ensurePermission])

  const deleteEntry = useCallback(async (relativePath: string): Promise<void> => {
    const handle = folderHandleRef.current
    if (!handle) throw new Error('No folder open')
    await ensurePermission()
    const [dirHandle, name] = await getNestedHandle(handle, relativePath, false)
    await dirHandle.removeEntry(name, { recursive: true })
  }, [ensurePermission])

  const renameEntry = useCallback(async (oldPath: string, newPath: string): Promise<void> => {
    const handle = folderHandleRef.current
    if (!handle) throw new Error('No folder open')
    await ensurePermission()
    const content = await readFileContent(handle, oldPath)
    const [newDirHandle, newFileName] = await getNestedHandle(handle, newPath, true)
    const newFileHandle = await newDirHandle.getFileHandle(newFileName, { create: true })
    if (content !== null) {
      const writable = await newFileHandle.createWritable()
      await writable.write(content)
      await writable.close()
    }
    const [oldDirHandle, oldName] = await getNestedHandle(handle, oldPath, false)
    await oldDirHandle.removeEntry(oldName, { recursive: true })
  }, [ensurePermission])

  const resolvePath = useCallback((fileId: string, idToPath: Map<string, string>): string | undefined => {
    return idToPath.get(fileId)
  }, [])

  return {
    isSupported,
    isActive,
    folderName,
    ignoreDotFiles,
    setIgnoreDotFiles,
    recentProjects: getRecentProjects(),
    getRecentProjects,
    openFolder,
    closeFolder,
    writeFile,
    createFile,
    createDirectory,
    deleteEntry,
    renameEntry,
    resolvePath,
    ensurePermission,
  }
}

async function readFileContent(rootHandle: FileSystemDirectoryHandle, relativePath: string): Promise<string | null> {
  try {
    const [dirHandle, fileName] = await getNestedHandle(rootHandle, relativePath, false)
    const fileHandle = await dirHandle.getFileHandle(fileName)
    const file = await fileHandle.getFile()
    return await file.text()
  } catch { return null }
}
