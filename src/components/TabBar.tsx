import { memo, useRef, useState, useCallback, useEffect } from 'react'
import type { TabItem } from '../types'

interface TabBarProps {
  tabs: TabItem[]
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onRun: () => void
  isPreviewOpen: boolean
  onTogglePreview: () => void
}

function TabBar({ tabs, onSelect, onClose, onRun, isPreviewOpen, onTogglePreview }: TabBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState)
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', updateScrollState); ro.disconnect() }
  }, [tabs.length, updateScrollState])

  const scrollBy = useCallback((amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }, [])

  return (
    <div className="flex h-[36px] shrink-0 select-none" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
      {canScrollLeft && (
        <button onClick={() => scrollBy(-120)}
          className="flex shrink-0 items-center justify-center w-[20px] transition-colors border-r"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
        </button>
      )}
      <div ref={scrollRef} className="flex flex-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className="group relative flex shrink-0 cursor-pointer items-center gap-1.5 border-r px-3 text-sm transition-colors duration-100"
            style={{
              backgroundColor: tab.isActive ? 'var(--bg-tab-active)' : 'var(--bg-tab)',
              color: tab.isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              borderColor: 'var(--border)',
            }}
          >
            {tab.isActive && (
              <span className="absolute inset-x-0 top-0 h-[2px]" style={{ backgroundColor: 'var(--accent)' }} />
            )}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="shrink-0 text-[#519aba]">
              <path d="M1 2.5A1.5 1.5 0 012.5 1h3.207a1.5 1.5 0 011.06.44l3.754 3.753a1.5 1.5 0 01.44 1.06V13.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 13.5V2.5z" />
            </svg>
            <span className="truncate max-w-[120px]">{tab.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(tab.id) }}
              className="ml-1 flex size-4 items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity duration-100 hover:bg-[var(--bg-hover)]"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      {canScrollRight && (
        <button onClick={() => scrollBy(120)}
          className="flex shrink-0 items-center justify-center w-[20px] transition-colors border-l"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
        </button>
      )}

      <div className="flex shrink-0 items-center gap-1 border-l px-2" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={onRun}
          className="flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium text-white transition-colors"
          style={{ backgroundColor: 'var(--accent)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2.5v11l9-5.5L4 2.5z" />
          </svg>
          Run
        </button>
        <button
          onClick={onTogglePreview}
          className="flex size-6 items-center justify-center rounded text-xs transition-colors duration-100"
          style={{
            backgroundColor: isPreviewOpen ? 'var(--accent)' : 'transparent',
            color: isPreviewOpen ? 'white' : 'var(--text-muted)',
          }}
          title={isPreviewOpen ? 'Close Preview' : 'Open Preview'}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10.5 8.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            <path d="M8 3C4.5 3 1.5 5.5 0 8c1.5 2.5 4.5 5 8 5s6.5-2.5 8-5c-1.5-2.5-4.5-5-8-5zm0 8.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default memo(TabBar)
