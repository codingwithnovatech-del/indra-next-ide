import { memo } from 'react'

export type ActivityBarView = 'explorer' | 'search' | 'git' | 'extensions' | 'settings'

interface ActivityBarProps {
  activeView: ActivityBarView
  onViewChange: (view: ActivityBarView) => void
  fileCount?: number
}

const views: { id: ActivityBarView; label: string; icon: string }[] = [
  { id: 'explorer', label: 'Explorer', icon: 'M1 2.5A1.5 1.5 0 012.5 1h3.207a1.5 1.5 0 011.06.44l3.754 3.753a1.5 1.5 0 01.44 1.06V13.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 13.5V2.5z' },
  { id: 'search', label: 'Search', icon: 'M11.742 10.344a6.5 6.5 0 10-1.397 1.398l3.85 3.85a1 1 0 001.415-1.414l-3.868-3.834zm-5.242.156a5 5 0 110-10 5 5 0 010 10z' },
  { id: 'git', label: 'Source Control', icon: 'M2 2v12h4V2H2zm1 1h2v3H3V3zm0 4h2v7H3V7zm5-5v12h4V2H8zm1 1h2v7H9V3zm0 8h2v3H9v-3zm5-5v9h4V6h-4zm1 1h2v7h-2V7zm0 8h2v2h-2v-2z' },
  { id: 'extensions', label: 'Extensions', icon: 'M3.5 0h5.707a1.5 1.5 0 011.06.44l2.793 2.793A1.5 1.5 0 0113.5 4.293V12.5a1.5 1.5 0 01-1.5 1.5h-1v-1h1a.5.5 0 00.5-.5V4.707a.5.5 0 00-.146-.353L9.646 1.646A.5.5 0 009.293 1.5H3.5a.5.5 0 00-.5.5v1h-1V2a2 2 0 012-2zm0 4h5.5v1H3.5V4zm0 3h5.5v1H3.5V7zm0 3h3.5v1H3.5v-1zM1 7.5a.5.5 0 01.5-.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5zm0 3a.5.5 0 01.5-.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5z' },
  { id: 'settings', label: 'Settings', icon: 'M8 2.5a5.5 5.5 0 00-5.466 4.826L1.5 8l1.034.674A5.5 5.5 0 008 13.5a5.5 5.5 0 005.466-4.826L14.5 8l-1.034-.674A5.5 5.5 0 008 2.5zm0 9a3.5 3.5 0 110-7 3.5 3.5 0 010 7zm0-1.5a2 2 0 100-4 2 2 0 000 4z' },
]

function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  return (
    <div className="flex w-[48px] shrink-0 flex-col items-center border-r pt-1"
         style={{ backgroundColor: 'var(--bg-activitybar)', borderColor: 'var(--border)' }}>
      {views.map((v) => (
        <button
          key={v.id}
          onClick={() => onViewChange(v.id)}
          className="relative flex w-[48px] h-[42px] items-center justify-center transition-colors"
          style={{ color: activeView === v.id ? 'var(--text-primary)' : 'var(--text-dim)' }}
          title={v.label}
        >
          {activeView === v.id && (
            <span className="absolute left-0 top-1 bottom-1 w-[2px] rounded-r" style={{ backgroundColor: 'var(--accent)' }} />
          )}
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d={v.icon} />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default memo(ActivityBar)
