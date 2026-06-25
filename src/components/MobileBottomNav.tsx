import { memo } from 'react'
import type { ActivityBarView } from './ActivityBar'

interface MobileBottomNavProps {
  activeView: ActivityBarView
  onViewChange: (view: ActivityBarView) => void
  onRun: () => void
  onToggleTerminal: () => void
}

const tabs: { id: ActivityBarView | 'run' | 'terminal'; label: string; icon: string }[] = [
  { id: 'explorer', label: 'Files', icon: 'M1 2.5A1.5 1.5 0 012.5 1h3.207a1.5 1.5 0 011.06.44l3.754 3.753a1.5 1.5 0 01.44 1.06V13.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 13.5V2.5z' },
  { id: 'search', label: 'Search', icon: 'M11.742 10.344a6.5 6.5 0 10-1.397 1.398l3.85 3.85a1 1 0 001.415-1.414l-3.868-3.834zm-5.242.156a5 5 0 110-10 5 5 0 010 10z' },
  { id: 'ai', label: 'AI', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
  { id: 'run', label: 'Run', icon: 'M4 2.5v11l9-5.5L4 2.5z' },
  { id: 'terminal', label: 'Terminal', icon: 'M2 2v12h4V2H2zm1 1h2v3H3V3zm0 4h2v7H3V7zm5-5v12h4V2H8zm1 1h2v7H9V3zm0 8h2v3H9v-3zm5-5v9h4V6h-4zm1 1h2v7h-2V7zm0 8h2v2h-2v-2z' },
]

function MobileBottomNav({ activeView, onViewChange, onRun, onToggleTerminal }: MobileBottomNavProps) {
  return (
    <div className="flex h-[48px] shrink-0 border-t md:hidden"
         style={{ backgroundColor: 'var(--bg-activitybar)', borderColor: 'var(--border)' }}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeView || (tab.id === 'run' && false) || (tab.id === 'terminal' && false)
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'run') { onRun(); return }
              if (tab.id === 'terminal') { onToggleTerminal(); return }
              onViewChange(tab.id as ActivityBarView)
            }}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors"
            style={{
              color: isActive ? 'var(--accent)' : 'var(--text-dim)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
              <path d={tab.icon} />
            </svg>
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default memo(MobileBottomNav)
