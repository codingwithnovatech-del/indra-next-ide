import { useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { FileNode } from '../types'

export function useCloudSync() {
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const syncingRef = useRef(false)

  const loadSnapshot = useCallback(async (projectId: string): Promise<FileNode | null> => {
    try {
      const { data, error } = await supabase
        .from('project_snapshots')
        .select('snapshot')
        .eq('project_id', projectId)
        .single()
      if (error || !data) return null
      return data.snapshot as unknown as FileNode
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : 'Failed to load snapshot')
      return null
    }
  }, [])

  const saveSnapshot = useCallback(async (projectId: string, root: FileNode) => {
    if (syncingRef.current) return
    syncingRef.current = true
    setSyncing(true)
    try {
      const { error } = await supabase.from('project_snapshots').upsert(
        { project_id: projectId, snapshot: root, updated_at: new Date().toISOString() },
        { onConflict: 'project_id' },
      )
      if (error) setSyncError(error.message)
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : 'Failed to save snapshot')
    } finally {
      setSyncing(false)
      syncingRef.current = false
    }
  }, [])

  const clearSyncError = useCallback(() => setSyncError(null), [])

  return { syncing, syncError, loadSnapshot, saveSnapshot, clearSyncError }
}
