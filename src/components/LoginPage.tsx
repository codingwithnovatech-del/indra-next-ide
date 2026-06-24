import { memo, useState } from 'react'
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    if (isSignUp && !name.trim()) return
    if (isSignUp) onSignUp(email.trim(), password, name.trim())
    else onSignIn(email.trim(), password)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4"
         style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg width="32" height="32" viewBox="0 0 16 16" fill="#007acc">
              <path d="M9.5 3.5L7 8l2.5 4.5H11L8.5 8 11 3.5H9.5zM5 3.5L2.5 8 5 12.5H6.5L4 8l2.5-4.5H5z" />
            </svg>
            <h1 className="text-xl font-semibold">IndraNext IDE</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Cloud coding workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-dim)' }}>Name</label>
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                className="w-full h-[40px] rounded px-3 text-sm outline-none border"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-dim)' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[40px] rounded px-3 text-sm outline-none border"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-dim)' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[40px] rounded px-3 text-sm outline-none border"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              placeholder="Min 6 characters"
            />
          </div>

          {error && (
            <div className="text-xs p-2 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
              {error}
            </div>
          )}
          {message && (
            <div className="text-xs p-2 rounded" style={{ backgroundColor: 'rgba(0,122,204,0.15)', color: '#60a5fa' }}>
              {message}
            </div>
          )}

          <button type="submit"
            className="w-full h-[40px] rounded text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          <div className="text-center">
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
              className="text-xs underline hover:no-underline" style={{ color: 'var(--accent)' }}>
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>

        <div className="mt-8 flex justify-center">
          <button onClick={onToggleTheme}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors"
            style={{ color: 'var(--text-dim)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
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
    </div>
  )
}

export default memo(LoginPage)
