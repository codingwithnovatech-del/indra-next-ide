import { memo, useRef, useEffect, useState, useCallback } from 'react'

interface LivePreviewProps {
  content: string
  autoRefresh: boolean
  fileName?: string
  onClose: () => void
  onToggleAutoRefresh: () => void
  onRun: () => void
  refreshKey?: number
}

type DeviceSize = 'mobile' | 'tablet' | 'desktop'

function LivePreview({
  content,
  autoRefresh,
  fileName,
  onClose,
  onToggleAutoRefresh,
  onRun,
  refreshKey,
}: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hasContent = content.length > 0
  const [device, setDevice] = useState<DeviceSize>('desktop')
  const [error, setError] = useState<string | null>(null)
  const [showConsole, setShowConsole] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [refreshCount, setRefreshCount] = useState(0)

  const deviceWidths: Record<DeviceSize, string> = {
    mobile: '375px',
    tablet: '768px',
    desktop: '100%',
  }

  useEffect(() => {
    if (iframeRef.current && hasContent) {
      iframeRef.current.srcdoc = content
      setRefreshCount(prev => prev + 1)
      setError(null)
      setConsoleOutput([])
    }
  }, [content, hasContent, refreshKey])

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'indranext-console') {
        setConsoleOutput(prev => [...prev.slice(-99), e.data.text])
      }
      if (e.data?.type === 'indranext-error') {
        setError(e.data.text)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const openInNewTab = useCallback(() => {
    if (!content) return
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  }, [content])

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: 'var(--bg-app)' }}>
      <div className="flex h-[36px] shrink-0 items-center justify-between border-b px-3 select-none"
           style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="#89d185">
            <path d="M8 1a1 1 0 011 1v4h4a1 1 0 010 2H9v4a1 1 0 01-2 0V8H3a1 1 0 010-2h4V2a1 1 0 011-1z" />
          </svg>
          <span>Preview</span>
          {fileName && <span style={{ color: 'var(--text-dim)' }}>— {fileName}</span>}
          {refreshCount > 0 && (
            <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>Refreshed {refreshCount}x</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <div className="flex gap-0.5 mr-2 border-r pr-2" style={{ borderColor: 'var(--border)' }}>
            {(['mobile', 'tablet', 'desktop'] as DeviceSize[]).map(d => (
              <button key={d} onClick={() => setDevice(d)}
                className="size-5 flex items-center justify-center rounded text-[9px] transition-colors"
                style={{
                  backgroundColor: device === d ? 'var(--bg-input)' : 'transparent',
                  color: device === d ? 'var(--text-primary)' : 'var(--text-dim)',
                }}
                title={d.charAt(0).toUpperCase() + d.slice(1)}>
                {d === 'mobile' ? (
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 1A1.5 1.5 0 005 2.5v11A1.5 1.5 0 006.5 15h3a1.5 1.5 0 001.5-1.5v-11A1.5 1.5 0 009.5 1h-3zm.5 1.5h2a.5.5 0 010 1H7a.5.5 0 010-1zM8 13a1 1 0 110-2 1 1 0 010 2z" /></svg>
                ) : d === 'tablet' ? (
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M5 1a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V3a2 2 0 00-2-2H5zm0 1h6a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1zm1 10.5a.5.5 0 100 1h4a.5.5 0 100-1H6z" /></svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M1 3a1 1 0 011-1h12a1 1 0 011 1v10a1 1 0 01-1 1H2a1 1 0 01-1-1V3zm1 0v10h12V3H2z" /></svg>
                )}
              </button>
            ))}
          </div>

          <button onClick={onRun}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Refresh preview">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3a5 5 0 00-5 5h2a3 3 0 013-3V3zm4 5a5 5 0 00-5-5v2a3 3 0 013 3h2zm-9 0a5 5 0 005 5v-2a3 3 0 01-3-3H3zm9 0h2a5 5 0 01-5 5v-2a3 3 0 003-3z" />
            </svg>
            Refresh
          </button>
          <label className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs transition-colors"
                 style={{ color: 'var(--text-muted)' }}>
            <input type="checkbox" checked={autoRefresh} onChange={onToggleAutoRefresh}
                   className="size-3" style={{ accentColor: 'var(--accent)' }} />
            Auto
          </label>
          <button onClick={openInNewTab}
            className="flex size-6 items-center justify-center rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Open in new tab">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.5 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
          <button onClick={() => setShowConsole(p => !p)}
            className="flex size-6 items-center justify-center rounded transition-colors"
            style={{ color: showConsole ? 'var(--accent)' : 'var(--text-muted)' }}
            title={showConsole ? 'Hide console' : 'Show console'}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2v12h4V2H2zm1 1h2v3H3V3zm0 4h2v7H3V7zm5-5v12h4V2H8zm1 1h2v7H9V3zm0 8h2v3H9v-3zm5-5v9h4V6h-4zm1 1h2v7h-2V7zm0 8h2v2h-2v-2z" />
            </svg>
          </button>
          <button onClick={onClose}
            className="flex size-6 items-center justify-center rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Close preview">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 items-center justify-center overflow-hidden bg-white"
             style={{ justifyContent: device !== 'desktop' ? 'center' : undefined }}>
          {hasContent ? (
            <div style={{ width: deviceWidths[device], height: '100%', transition: 'width 0.2s ease' }}>
              <iframe
                ref={iframeRef}
                title="Live Preview"
                className="h-full w-full border-0"
                sandbox="allow-scripts allow-modals allow-same-origin"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center" style={{ color: 'var(--text-dim)' }}>
              <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor" className="opacity-40">
                <path d="M8 1a1 1 0 011 1v4h4a1 1 0 010 2H9v4a1 1 0 01-2 0V8H3a1 1 0 010-2h4V2a1 1 0 011-1z" />
              </svg>
              <p className="text-sm">Open an HTML/CSS/JS file and press <strong>Run</strong></p>
            </div>
          )}
        </div>

        {error && (
          <div className="shrink-0 px-3 py-1.5 text-xs flex items-center gap-2"
               style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', borderTop: '1px solid rgba(239,68,68,0.3)' }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
              <path d="M8 1L1 14h14L8 1zm0 3.5h1v4.5H8V4.5zm0 6h1v1.5H8V10.5z" />
            </svg>
            <span className="truncate">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto shrink-0 hover:opacity-80">&times;</button>
          </div>
        )}

        {showConsole && consoleOutput.length > 0 && (
          <div className="shrink-0 max-h-[120px] overflow-y-auto border-t px-3 py-1.5 text-[10px] font-mono leading-relaxed"
               style={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Console ({consoleOutput.length})</span>
              <button onClick={() => setConsoleOutput([])} className="text-[9px] hover:underline" style={{ color: 'var(--text-dim)' }}>Clear</button>
            </div>
            {consoleOutput.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap">{line}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(LivePreview)
