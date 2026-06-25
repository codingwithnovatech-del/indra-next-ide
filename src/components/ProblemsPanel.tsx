import { memo, useEffect, useState, useCallback } from 'react'

interface Problem {
  file: string
  line: number
  column: number
  message: string
  severity: 'error' | 'warning' | 'info'
}

interface ProblemsPanelProps {
  visible: boolean
  onProblemClick?: (file: string, line: number) => void
}

let globalProblems: Problem[] = []
let globalListeners: Array<() => void> = []

export function updateProblems(problems: Problem[]) {
  globalProblems = problems
  globalListeners.forEach(fn => fn())
}

const severityIcons: Record<string, string> = {
  error: 'M8 1C4.14 1 1 4.14 1 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm0 12.5A5.5 5.5 0 118 2.5a5.5 5.5 0 010 11zM7.25 4.5h1.5v5h-1.5v-5zm0 6.5h1.5v1.5h-1.5V11z',
  warning: 'M8 1.5L1 14h14L8 1.5zm0 3.5h1v4.5H8V5zm0 6h1v1.5H8V11z',
  info: 'M8 1a7 7 0 100 14A7 7 0 008 1zm0 12.5A5.5 5.5 0 118 2.5a5.5 5.5 0 010 11zM7.25 4.5h1.5v5h-1.5v-5zm0 6.5h1.5v1.5h-1.5V11z',
}

const severityColors = { error: 'var(--error)', warning: 'var(--warning)', info: 'var(--info)' }

function ProblemsPanel({ visible, onProblemClick }: ProblemsPanelProps) {
  const [problems, setProblems] = useState<Problem[]>(globalProblems)
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all')

  useEffect(() => {
    const update = () => setProblems([...globalProblems])
    globalListeners.push(update)
    return () => {
      globalListeners = globalListeners.filter(f => f !== update)
    }
  }, [])

  const counts = {
    all: problems.length,
    error: problems.filter(p => p.severity === 'error').length,
    warning: problems.filter(p => p.severity === 'warning').length,
    info: problems.filter(p => p.severity === 'info').length,
  }

  const filtered = filter === 'all' ? problems : problems.filter(p => p.severity === filter)

  const handleClick = useCallback((p: Problem) => {
    onProblemClick?.(p.file, p.line)
  }, [onProblemClick])

  if (!visible) return null

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ backgroundColor: 'var(--bg-panel)' }}>
      <div className="flex items-center gap-2 px-3 h-[30px] shrink-0 border-b text-xs"
           style={{ borderColor: 'var(--border)', color: 'var(--text-dim)' }}>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1L1 14h14L8 1zm0 3.5h1v4.5H8V4.5zm0 6h1v1.5H8V10.5z" />
          </svg>
          PROBLEMS
        </span>
        <div className="flex items-center gap-1 ml-3">
          {(['all', 'error', 'warning', 'info'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-2 py-0.5 rounded text-[10px] transition-colors capitalize"
              style={{
                backgroundColor: filter === f ? 'var(--bg-active)' : 'transparent',
                color: filter === f ? 'var(--text-primary)' : 'var(--text-dim)',
              }}>
              {f === 'error' ? 'Errors' : f === 'warning' ? 'Warnings' : f === 'info' ? 'Info' : 'All'}
              {counts[f] > 0 && <span className="ml-1">({counts[f]})</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs" style={{ color: 'var(--text-dim)' }}>
            <div className="text-center p-4">
              <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" className="mx-auto mb-2 opacity-40">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12.5A5.5 5.5 0 118 2.5a5.5 5.5 0 010 11zM7.25 4.5h1.5v5h-1.5v-5zm0 6.5h1.5v1.5h-1.5V11z" />
              </svg>
              <p>No problems detected</p>
            </div>
          </div>
        ) : (
          filtered.map((p, i) => (
            <button key={i} onClick={() => handleClick(p)}
              className="flex w-full items-start gap-3 px-3 py-1.5 text-xs text-left transition-colors hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--text-primary)' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill={severityColors[p.severity]} className="mt-0.5 shrink-0">
                <path d={severityIcons[p.severity]} />
              </svg>
              <span className="flex-1">{p.message}</span>
              <span className="shrink-0 text-[10px]" style={{ color: 'var(--text-dim)' }}>
                {p.file} ({p.line}, {p.column})
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default memo(ProblemsPanel)
export { globalProblems }
