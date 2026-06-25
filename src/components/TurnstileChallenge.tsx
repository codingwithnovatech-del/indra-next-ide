import { memo, useEffect, useRef, useState } from 'react'

interface TurnstileChallengeProps {
  onSuccess: () => void
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAADq-bbzZnWnGtK6F'

function TurnstileChallenge({ onSuccess }: TurnstileChallengeProps) {
  const [solved, setSolved] = useState(false)
  const widgetRef = useRef<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.turnstile && containerRef.current) {
      widgetRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: () => setSolved(true),
        theme: 'dark',
      })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (containerRef.current && window.turnstile) {
        widgetRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: () => setSolved(true),
          theme: 'dark',
        })
      }
    }
    document.head.appendChild(script)

    return () => {
      if (widgetRef.current && window.turnstile) {
        window.turnstile.remove(widgetRef.current)
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden"
         style={{ backgroundColor: 'var(--bg-app)' }}>
      <div className="absolute inset-0 animate-gradient opacity-30"
           style={{
             background: 'linear-gradient(135deg, #007acc, #1e1e1e, #0d47a1, #1a1a2e, #007acc)',
           }} />
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />

      <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-in-up">
        <div className="inline-flex items-center justify-center size-20 rounded-2xl animate-pulse-glow"
             style={{ backgroundColor: 'rgba(0,122,204,0.15)' }}>
          <svg width="44" height="44" viewBox="0 0 16 16" fill="#007acc">
            <path d="M9.5 3.5L7 8l2.5 4.5H11L8.5 8 11 3.5H9.5zM5 3.5L2.5 8 5 12.5H6.5L4 8l2.5-4.5H5z" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>IndraNext IDE</h1>

        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
          Verify you're human to continue
        </p>

        <div ref={containerRef} className="scale-125" />

        {solved && (
          <button onClick={onSuccess}
            className="px-8 h-[44px] rounded-lg text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}>
            Enter IDE
          </button>
        )}
      </div>
    </div>
  )
}

export default memo(TurnstileChallenge)
