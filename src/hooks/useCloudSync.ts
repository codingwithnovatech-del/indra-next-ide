import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { FileNode } from '../types'
import { saveSession } from '../data/virtualFileSystem'

export function useCloudSync() {
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  const loadSnapshot = useCallback(async (projectId: string): Promise<FileNode | null> => {
    const { data, error } = await supabase
      .from('project_snapshots')
      .select('snapshot')
      .eq('project_id', projectId)
      .single()
    if (error || !data) return null
    return data.snapshot as unknown as FileNode
  }, [])

  const saveSnapshot = useCallback(async (projectId: string, root: FileNode) => {
    setSyncing(true)
    const { error } = await supabase.from('project_snapshots').upsert(
      { project_id: projectId, snapshot: root, updated_at: new Date().toISOString() },
      { onConflict: 'project_id' },
    )
    if (error) setSyncError(error.message)
    setSyncing(false)
  }, [])

  const saveSessionState = useCallback(async (
    projectId: string,
    openFileIds: string[],
    activeFileId: string | null,
  ) => {
    await supabase.from('project_snapshots').upsert(
      { project_id: projectId, open_tabs: openFileIds, active_file_id: activeFileId },
      { onConflict: 'project_id' },
    )
  }, [])

  return { syncing, syncError, loadSnapshot, saveSnapshot, saveSessionState }
}
