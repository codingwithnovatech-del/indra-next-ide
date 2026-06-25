import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(() => {
      if (cancelled) return
      setError('Failed to connect to authentication server')
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => { cancelled = true; listener?.subscription.unsubscribe() }
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string, captchaToken?: string) => {
    setError(null)
    setMessage(null)
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name }, captchaToken } })
    if (error) setError(error.message)
    else setMessage('Check your email for the confirmation link.')
  }, [])

  const signIn = useCallback(async (email: string, password: string, captchaToken?: string) => {
    setError(null)
    setMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken } })
    if (error) setError(error.message)
  }, [])

  const signInWithOAuth = useCallback(async (provider: 'github' | 'google') => {
    setError(null)
    setMessage(null)
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) setError(error.message)
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    setMessage(null)
    await supabase.auth.signOut()
  }, [])

  return { session, user, loading, error, message, signUp, signIn, signInWithOAuth, signOut, setError }
}
