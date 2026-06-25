import { memo, useEffect, useRef } from 'react'

export interface ContextMenuItem {
  id: string
  label: string
  shortcut?: string
  icon?: React.ReactNode
  divider?: boolean
  disabled?: boolean
  action: () => void
}

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.right > window.innerWidth) el.style.left = `${window.innerWidth - rect.width - 8}px`
    if (rect.bottom > window.innerHeight) el.style.top = `${window.innerHeight - rect.height - 8}px`
  }, [x, y])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const escHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('mousedown', handler)
    window.addEventListener('keydown', escHandler)
    return () => {
      window.removeEventListener('mousedown', handler)
      window.removeEventListener('keydown', escHandler)
    }
  }, [onClose])

  const adjustedY = Math.min(y, window.innerHeight - items.length * 32 - 16)
  const adjustedX = Math.min(x, window.innerWidth - 200)

  return (
    <div ref={ref}
      className="fixed z-[9999] min-w-[180px] py-1 rounded-lg border shadow-xl animate-fade-in-scale"
      style={{
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border)',
      }}>
      {items.map((item, i) => (
        item.divider ? (
          <div key={`div-${i}`} className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />
        ) : (
          <button key={item.id}
            onClick={() => { if (!item.disabled) { item.action(); onClose() } }}
            className="flex w-full items-center gap-3 px-3 py-1.5 text-xs text-left transition-colors"
            style={{
              color: item.disabled ? 'var(--text-dim)' : 'var(--text-primary)',
              cursor: item.disabled ? 'default' : 'pointer',
            }}
            onMouseEnter={(e) => { if (!item.disabled) e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent' }>
            {item.icon && <span className="size-4 shrink-0">{item.icon}</span>}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{item.shortcut}</span>}
          </button>
        )
      ))}
    </div>
  )
}

export default memo(ContextMenu)
