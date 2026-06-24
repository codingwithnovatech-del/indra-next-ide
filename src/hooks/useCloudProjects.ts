import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface Project {
  id: string
  name: string
  created_at: string
}

export function useCloudProjects(user: User | null) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setProjects(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const createProject = useCallback(async (name: string): Promise<string | null> => {
    if (!user) return null
    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user.id, name })
      .select('id')
      .single()
    if (error) { setError(error.message); return null }
    await fetchProjects()
    return data.id
  }, [user, fetchProjects])

  const deleteProject = useCallback(async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) setError(error.message)
    else setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return { projects, loading, error, createProject, deleteProject, fetchProjects }
}
