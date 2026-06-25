import { memo, useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

let toastId = 0
let globalSetToasts: ((fn: (prev: Toast[]) => Toast[]) => void) | null = null

export function showToast(message: string, type: ToastType = 'info') {
  const id = `toast_${++toastId}`
  globalSetToasts?.((prev) => [...prev, { id, message, type }])
  setTimeout(() => {
    globalSetToasts?.((prev) => prev.filter(t => t.id !== id))
  }, 4000)
}

function NotificationToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  globalSetToasts = setToasts

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  if (toasts.length === 0) return null

  const typeColors: Record<ToastType, string> = {
    success: '#4ec9b0',
    error: '#f48771',
    info: '#75beff',
    warning: '#cca700',
  }

  return (
    <div className="fixed bottom-12 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-2 px-3 py-2 rounded-lg shadow-lg text-xs animate-slide-up"
          style={{
            backgroundColor: 'var(--bg-sidebar)',
            border: `1px solid ${typeColors[toast.type]}`,
            color: 'var(--text-primary)',
          }}
        >
          <span className="shrink-0 mt-0.5" style={{ color: typeColors[toast.type] }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              {toast.type === 'success' ? (
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.36 5.36l-4.5 4.5a.5.5 0 01-.7 0l-2.5-2.5a.5.5 0 11.7-.7L6.5 9.8l4.15-4.15a.5.5 0 01.7.7z" />
              ) : toast.type === 'error' ? (
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm2.12 9.12a.5.5 0 11-.7.7L8 9.71l-1.41 1.41a.5.5 0 11-.7-.7L7.29 9 5.88 7.59a.5.5 0 11.7-.7L8 8.29l1.41-1.41a.5.5 0 11.7.7L8.71 9l1.41 1.41z" />
              ) : toast.type === 'warning' ? (
                <path d="M8 1L1 14h14L8 1zm0 3.5h1v4.5H8V4.5zm0 6h1v1.5H8V10.5z" />
              ) : (
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a.5.5 0 01.5.5v4a.5.5 0 01-1 0v-4A.5.5 0 018 4zm0 7a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              )}
            </svg>
          </span>
          <span className="flex-1" style={{ color: 'var(--text-primary)' }}>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)}
            className="shrink-0 text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

export default memo(NotificationToast)
