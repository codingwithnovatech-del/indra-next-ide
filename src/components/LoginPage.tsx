import { memo, useState, useEffect, useRef } from 'react'
import type { ThemeMode } from '../hooks/useTheme'

interface LoginPageProps {
  onSignIn: (email: string, password: string) => void
  onSignUp: (email: string, password: string, name: string) => void
  error: string | null
  message?: string | null
  setError: (msg: string | null) => void
  themeMode: ThemeMode
  onToggleTheme: () => void
}

function LoginPage({ onSignIn, onSignUp, error, message, setError, themeMode, onToggleTheme }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [isSignUp])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    if (isSignUp && !name.trim()) return
    setSubmitting(true)
    try {
      if (isSignUp) await onSignUp(email.trim(), password, name.trim())
      else await onSignIn(email.trim(), password)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden"
         style={{ backgroundColor: 'var(--bg-app)' }}>
      <div className="absolute inset-0 animate-gradient opacity-30"
           style={{
             background: 'linear-gradient(135deg, #007acc, #1e1e1e, #0d47a1, #1a1a2e, #007acc)',
           }} />
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl mb-4 animate-pulse-glow"
               style={{ backgroundColor: 'rgba(0,122,204,0.15)' }}>
            <svg width="36" height="36" viewBox="0 0 16 16" fill="#007acc">
              <path d="M9.5 3.5L7 8l2.5 4.5H11L8.5 8 11 3.5H9.5zM5 3.5L2.5 8 5 12.5H6.5L4 8l2.5-4.5H5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>IndraNext IDE</h1>
          <p className="text-sm overflow-hidden whitespace-nowrap border-r-2 inline-block"
             style={{ color: 'var(--text-dim)', borderColor: 'var(--accent)', maxWidth: 'fit-content', animation: 'typewriter 2s steps(30) 1s forwards, blink 0.8s step-end infinite' }}>
            Cloud coding workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up stagger-3">
          <div className="overflow-hidden" style={{ maxHeight: isSignUp ? '80px' : '0', transition: 'max-height 0.3s ease, opacity 0.3s ease', opacity: isSignUp ? 1 : 0 }}>
            <div className={isSignUp ? '' : 'pointer-events-none'}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-dim)' }}>Name</label>
              <input ref={isSignUp ? inputRef : undefined} value={name} onChange={(e) => setName(e.target.value)}
                className="w-full h-[44px] rounded-lg px-4 text-sm outline-none border transition-all duration-200"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                placeholder="Your name"
                tabIndex={isSignUp ? 0 : -1}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-dim)' }}>Email</label>
            <input ref={!isSignUp ? inputRef : undefined} type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[44px] rounded-lg px-4 text-sm outline-none border transition-all duration-200"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-dim)' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[44px] rounded-lg px-4 text-sm outline-none border transition-all duration-200"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              placeholder="Min 6 characters"
            />
          </div>

          {error && (
            <div className="text-xs p-3 rounded-lg animate-fade-in" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: 'var(--error)' }}>
              {error}
            </div>
          )}
          {message && (
            <div className="text-xs p-3 rounded-lg animate-fade-in" style={{ backgroundColor: 'rgba(0,122,204,0.15)', color: 'var(--info)' }}>
              {message}
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full h-[44px] rounded-lg text-sm font-medium text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--accent)' }}>
            {submitting && (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 110 16A8 8 0 018 0zm0 2a6 6 0 100 12A6 6 0 008 2z" opacity="0.3" />
                <path d="M8 0a8 8 0 018 8h-2a6 6 0 00-6-6V0z" />
              </svg>
            )}
            {submitting ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          <div className="text-center pt-2">
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
              className="text-xs hover:underline transition-opacity" style={{ color: 'var(--accent)' }}>
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>

      <div className="fixed bottom-6 right-6 z-10">
        <button onClick={onToggleTheme}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all duration-200 hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-dim)', backgroundColor: 'var(--bg-sidebar)', border: '1px solid var(--border)' }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            {themeMode === 'dark' ? (
              <path d="M6 .278a.768.768 0 01.08.858 7.208 7.208 0 00-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 01.81.316.733.733 0 01-.031.893A8.349 8.349 0 018.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 016 .278z" />
            ) : (
              <path d="M8 1a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1A.5.5 0 018 1zm0 10a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1A.5.5 0 018 11zm6-3a.5.5 0 010 1h-1a.5.5 0 010-1h1zM3 8a.5.5 0 01-.5.5h-1a.5.5 0 010-1h1A.5.5 0 013 8zm10.657-5.657a.5.5 0 010 .707l-.707.707a.5.5 0 11-.707-.707l.707-.707a.5.5 0 01.707 0zm-9.193 9.193a.5.5 0 010 .707L3.757 13.25a.5.5 0 01-.707-.707l.707-.707a.5.5 0 01.707 0zm9.193 0a.5.5 0 01-.707 0l-.707-.707a.5.5 0 11.707-.707l.707.707a.5.5 0 010 .707zM3.464 3.464a.5.5 0 010 .707l-.707.707a.5.5 0 11-.707-.707l.707-.707a.5.5 0 01.707 0z" />
            )}
          </svg>
          {themeMode === 'dark' ? 'Dark' : themeMode === 'light' ? 'Light' : 'Auto'}
        </button>
      </div>
    </div>
  )
}

export default memo(LoginPage)
