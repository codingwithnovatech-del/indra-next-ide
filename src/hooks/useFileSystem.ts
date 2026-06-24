import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import type { FileNode } from '../types'
import type { TabItem } from '../types'
import {
  initialVFS,
  flattenTree,
  updateNodeContent,
  addChild,
  removeNode,
  renameNode,
  generateId,
  ensureIdCounter,
  loadSession,
  saveSession,
  debounceSave,
} from '../data/virtualFileSystem'
import { suggestTemplate } from '../data/templates'

const SESSION_KEY = (wid: string) => `indranext-session-${wid}`

interface SessionData {
  root: FileNode
  openFileIds: string[]
  activeFileId: string | null
}

function findMaxId(root: FileNode): number {
  let max = 0
  function walk(node: FileNode) {
    const num = parseInt(node.id.replace('n_', ''), 10)
    if (!isNaN(num) && num > max) max = num
    node.children?.forEach(walk)
  }
  walk(root)
  return max
}

export function useFileSystem(workspaceId = 'default') {
  const initialized = useRef(false)
  const storageKey = SESSION_KEY(workspaceId)

  const [root, setRoot] = useState<FileNode>(() => {
    const saved = loadSession<SessionData | null>(storageKey, null)
    if (saved?.root) {
      ensureIdCounter(findMaxId(saved.root))
      return saved.root
    }
    const fresh = JSON.parse(JSON.stringify(initialVFS))
    return fresh
  })

  const [openFileIds, setOpenFileIds] = useState<string[]>(() => {
    const saved = loadSession<SessionData | null>(storageKey, null)
    return saved?.openFileIds ?? []
  })

  const [activeFileId, setActiveFileId] = useState<string | null>(() => {
    const saved = loadSession<SessionData | null>(storageKey, null)
    return saved?.activeFileId ?? null
  })

  const flat = useMemo(() => flattenTree(root), [root])

  const openFiles: TabItem[] = useMemo(
    () =>
      openFileIds.map((id) => ({
        id,
        name: flat.get(id)?.name ?? 'unknown',
        isActive: id === activeFileId,
      })),
    [openFileIds, activeFileId, flat],
  )

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      return
    }
    debounceSave(storageKey, { root, openFileIds, activeFileId } satisfies SessionData)
  }, [root, openFileIds, activeFileId, storageKey])

  const openFile = useCallback(
    (id: string) => {
      const node = flat.get(id)
      if (!node || node.type !== 'file') return
      setOpenFileIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      setActiveFileId(id)
    },
    [flat],
  )

  const closeFile = useCallback((id: string) => {
    setOpenFileIds((prev) => prev.filter((fid) => fid !== id))
    setActiveFileId((prev) => {
      if (prev !== id) return prev
      const next = openFileIds.filter((fid) => fid !== id)
      if (next.length === 0) return null
      const idx = openFileIds.indexOf(id)
      return next[Math.min(idx, next.length - 1)] ?? next[0]
    })
  }, [openFileIds])

  const updateContent = useCallback((id: string, content: string) => {
    setRoot((prev) => updateNodeContent(prev, id, content))
  }, [])

  const createItem = useCallback(
    (parentId: string, type: 'file' | 'folder', name: string): string => {
      const id = generateId()
      const template = type === 'file' ? suggestTemplate(name) : null
      const child: FileNode =
        type === 'folder'
          ? { id, name, type: 'folder', children: [] }
          : { id, name, type: 'file', content: template ?? '' }
      setRoot((prev) => addChild(prev, parentId, child))
      return id
    },
    [],
  )

  const deleteItem = useCallback(
    (id: string) => {
      setRoot((prev) => removeNode(prev, id) ?? prev)
      setOpenFileIds((prev) => prev.filter((fid) => fid !== id))
      setActiveFileId((prev) => (prev === id ? null : prev))
    },
    [],
  )

  const renameItem = useCallback((id: string, newName: string) => {
    setRoot((prev) => renameNode(prev, id, newName))
  }, [])

  const replaceRoot = useCallback((newRoot: FileNode, openIds: string[], active: string | null) => {
    setRoot(newRoot)
    setOpenFileIds(openIds)
    setActiveFileId(active)
    saveSession(storageKey, { root: newRoot, openFileIds: openIds, activeFileId: active } satisfies SessionData)
  }, [storageKey])

  return {
    root,
    flat,
    openFiles,
    activeFileId,
    openFile,
    closeFile,
    updateContent,
    createItem,
    deleteItem,
    renameItem,
    workspaceId,
    replaceRoot,
  }
}
