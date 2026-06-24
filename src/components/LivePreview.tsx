import { memo, useRef, useEffect } from 'react'

interface LivePreviewProps {
  content: string
  autoRefresh: boolean
  fileName?: string
  onClose: () => void
  onToggleAutoRefresh: () => void
  onRun: () => void
}

function LivePreview({
  content,
  autoRefresh,
  fileName,
  onClose,
  onToggleAutoRefresh,
  onRun,
}: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hasContent = content.length > 0

  useEffect(() => {
    if (iframeRef.current && hasContent) {
      iframeRef.current.srcdoc = content
    }
  }, [content, hasContent])

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: 'var(--bg-app)' }}>
      <div className="flex h-[36px] shrink-0 items-center justify-between border-b px-3 select-none"
           style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-[#89d185]">
            <path d="M8 1a1 1 0 011 1v4h4a1 1 0 010 2H9v4a1 1 0 01-2 0V8H3a1 1 0 010-2h4V2a1 1 0 011-1z" />
          </svg>
          <span>Preview</span>
          {fileName && <span style={{ color: 'var(--text-dim)' }}>— {fileName}</span>}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onRun}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
            title="Refresh preview"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3a5 5 0 00-5 5h2a3 3 0 013-3V3zm4 5a5 5 0 00-5-5v2a3 3 0 013 3h2zm-9 0a5 5 0 005 5v-2a3 3 0 01-3-3H3zm9 0h2a5 5 0 01-5 5v-2a3 3 0 003-3z" />
            </svg>
            Refresh
          </button>
          <label className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs transition-colors"
                 style={{ color: 'var(--text-muted)' }}
                 onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                 onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
            <input type="checkbox" checked={autoRefresh} onChange={onToggleAutoRefresh}
                   className="size-3" style={{ accentColor: 'var(--accent)' }} />
            Auto
          </label>
          <button
            onClick={onClose}
            className="flex size-6 items-center justify-center rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
            title="Close preview"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden bg-white">
        {hasContent ? (
          <iframe
            ref={iframeRef}
            title="Live Preview"
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-modals allow-same-origin"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-center" style={{ color: 'var(--text-dim)' }}>
            <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor" className="opacity-40">
              <path d="M8 1a1 1 0 011 1v4h4a1 1 0 010 2H9v4a1 1 0 01-2 0V8H3a1 1 0 010-2h4V2a1 1 0 011-1z" />
            </svg>
            <p className="text-sm">Open an HTML/CSS/JS file and press <strong>Run</strong></p>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(LivePreview)
