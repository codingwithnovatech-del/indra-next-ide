import { memo, useState, useEffect, useRef } from 'react'
import type { Project } from '../hooks/useCloudProjects'

interface DashboardProps {
  projects: Project[]
  loading: boolean
  error?: string | null
  onCreateProject: (name: string) => void
  onDeleteProject: (id: string) => void
  onOpenProject: (id: string) => void
  onSignOut: () => void
  userName?: string
}

function Dashboard({ projects, loading, error, onCreateProject, onDeleteProject, onOpenProject, onSignOut, userName }: DashboardProps) {
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showModal])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    if (showModal) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [showModal])

  const handleCreate = () => {
    if (!newName.trim()) return
    onCreateProject(newName.trim())
    setNewName('')
    setShowModal(false)
  }

  const getPreview = (p: Project): string | null => {
    try {
      const snap = p.snapshot as { name: string; children?: { name: string; content?: string; type: string }[] } | null
      if (!snap?.children) return null
      const children = snap.children
      const codeFile = children.find(c => (c.type === 'file' || !c.type) && c.content && c.content.length > 10)
      if (!codeFile?.content) return null
      const lines = codeFile.content.split('\n').slice(0, 4)
      return lines.join('\n')
    } catch { return null }
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <header className="flex items-center justify-between px-6 h-[52px] border-b shrink-0"
              style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="#007acc">
            <path d="M9.5 3.5L7 8l2.5 4.5H11L8.5 8 11 3.5H9.5zM5 3.5L2.5 8 5 12.5H6.5L4 8l2.5-4.5H5z" />
          </svg>
          <span className="font-semibold text-sm">IndraNext IDE</span>
          {userName && <span className="text-xs" style={{ color: 'var(--text-dim)' }}>— {userName}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onSignOut}
            className="text-xs px-3 py-1.5 rounded transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-dim)' }}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        {error && (
          <div className="mb-4 text-xs p-3 rounded animate-fade-in" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: 'var(--error)' }}>
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Projects</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:opacity-90 animate-pulse-glow"
            style={{ backgroundColor: 'var(--accent)' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            New Project
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="size-8 rounded-full border-2" style={{ borderColor: 'var(--text-dim)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in-up">
            <div className="size-24 mb-6 rounded-2xl flex items-center justify-center"
                 style={{ backgroundColor: 'var(--bg-sidebar)', border: '1px dashed var(--border)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-dim)' }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <h3 className="text-base font-medium mb-2">No projects yet</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-dim)' }}>Create your first project to start coding</p>
            <button onClick={() => setShowModal(true)}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)' }}>
              Create Project
            </button>
            <div className="mt-8 text-xs" style={{ color: 'var(--text-dim)' }}>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}>Ctrl+P</kbd>
                to open files once inside a project
              </span>
            </div>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {projects.map((p) => {
              const preview = getPreview(p)
              return (
                <div key={p.id}
                  className="card-hover rounded-lg border overflow-hidden cursor-pointer group"
                  style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}
                  onClick={() => onOpenProject(p.id)}
                  onMouseEnter={(e) => { if (confirmDelete !== p.id) e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onMouseLeave={(e) => { if (confirmDelete !== p.id) e.currentTarget.style.borderColor = 'var(--border)' }}>
                  {preview && (
                    <div className="h-[100px] overflow-hidden border-b" style={{ borderColor: 'var(--border)' }}>
                      <pre className="text-[10px] p-3 leading-relaxed" style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{preview}</pre>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-9 rounded-lg shrink-0 flex items-center justify-center"
                             style={{ backgroundColor: 'rgba(0,122,204,0.15)' }}>
                          <svg width="18" height="18" viewBox="0 0 16 16" fill="#dcb67a">
                            <path d="M.5 3.5A1.5 1.5 0 012 2h3.879a1.5 1.5 0 011.06.44l1.122 1.12H14a1.5 1.5 0 011.5 1.5v7.44a1.5 1.5 0 01-1.5 1.5H2a1.5 1.5 0 01-1.5-1.5V3.5z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
                            {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <button onClick={(e) => {
                        e.stopPropagation()
                        if (confirmDelete === p.id) {
                          onDeleteProject(p.id)
                          setConfirmDelete(null)
                        } else {
                          setConfirmDelete(p.id)
                          setTimeout(() => setConfirmDelete(null), 3000)
                        }
                      }}
                        className="size-8 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs"
                        style={{ color: confirmDelete === p.id ? 'var(--error)' : 'var(--text-dim)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        {confirmDelete === p.id ? (
                          <span className="text-[10px] font-medium">Confirm?</span>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M12 4v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4" stroke="currentColor" strokeWidth="1.2" fill="none" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
             style={{ backgroundColor: 'var(--bg-overlay)' }}>
          <div className="w-full max-w-sm rounded-xl p-6 animate-fade-in-scale"
               style={{ backgroundColor: 'var(--bg-sidebar)', border: '1px solid var(--border)' }}>
            <h3 className="text-base font-medium mb-1">New Project</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}>Give your project a name to get started</p>
            <input ref={inputRef} value={newName} onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. my-app"
              className="w-full h-[44px] rounded-lg px-4 text-sm outline-none border mb-4"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => { setShowModal(false); setNewName('') }}
                className="flex-1 h-[40px] rounded-lg text-sm transition-colors hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-primary)' }}>
                Cancel
              </button>
              <button onClick={handleCreate}
                className="flex-1 h-[40px] rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--accent)' }}
                disabled={!newName.trim()}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(Dashboard)
