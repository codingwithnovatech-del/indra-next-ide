import { memo, useState, useEffect, useRef } from 'react'
import type { ThemeMode } from '../hooks/useTheme'
import TurnstileWidget from './TurnstileWidget'

interface LoginPageProps {
  onSignIn: (email: string, password: string, captchaToken?: string) => void
  onSignUp: (email: string, password: string, name: string, captchaToken?: string) => void
  onSignInWithOAuth?: (provider: 'github' | 'google') => void
  error: string | null
  message?: string | null
  setError: (msg: string | null) => void
  themeMode: ThemeMode
  onToggleTheme: () => void
}

function LoginPage({ onSignIn, onSignUp, onSignInWithOAuth, error, message, setError, themeMode, onToggleTheme }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaKeyRef = useRef(0)
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
      if (isSignUp) await onSignUp(email.trim(), password, name.trim(), captchaToken || undefined)
      else await onSignIn(email.trim(), password, captchaToken || undefined)
    } finally {
      setSubmitting(false)
      setCaptchaToken(null)
      captchaKeyRef.current++
    }
  }

  const handleCaptchaVerify = (token: string) => setCaptchaToken(token)
  const handleCaptchaExpire = () => setCaptchaToken(null)

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

          <div className="flex gap-3">
            <button type="button" onClick={() => onSignInWithOAuth?.('github')}
              className="flex-1 h-[44px] rounded-lg text-sm font-medium text-white transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#333' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub
            </button>
            <button type="button" onClick={() => onSignInWithOAuth?.('google')}
              className="flex-1 h-[44px] rounded-lg text-sm font-medium text-white transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#4285F4' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>

          <div className="relative flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
            <span>or continue with email</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          </div>

          <div className="flex justify-center">
            <TurnstileWidget key={captchaKeyRef.current} onVerify={handleCaptchaVerify} onExpire={handleCaptchaExpire} theme={themeMode === 'dark' ? 'dark' : 'light'} />
          </div>

          <button type="submit" disabled={submitting || !captchaToken}
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
