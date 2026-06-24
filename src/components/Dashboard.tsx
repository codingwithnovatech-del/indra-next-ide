import { memo, useState } from 'react'
import type { Project } from '../hooks/useCloudProjects'

interface DashboardProps {
  projects: Project[]
  loading: boolean
  onCreateProject: (name: string) => void
  onDeleteProject: (id: string) => void
  onOpenProject: (id: string) => void
  onSignOut: () => void
  userName?: string
}

function Dashboard({ projects, loading, onCreateProject, onDeleteProject, onOpenProject, onSignOut, userName }: DashboardProps) {
  const [newName, setNewName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleCreate = () => {
    if (!newName.trim()) return
    onCreateProject(newName.trim())
    setNewName('')
    setShowCreate(false)
  }

  const handleDeleteClick = (id: string) => {
    if (confirmDelete === id) {
      onDeleteProject(id)
      setConfirmDelete(null)
      return
    }
    setConfirmDelete(id)
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
        <button onClick={onSignOut}
          className="text-xs px-3 py-1.5 rounded transition-colors"
          style={{ color: 'var(--text-dim)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)' }}>
          Sign Out
        </button>
      </header>

      <main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Projects</h2>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            New Project
          </button>
        </div>

        {showCreate && (
          <div className="flex gap-2 mb-6 p-4 rounded-lg border"
               style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)}
              placeholder="Project name..."
              className="flex-1 h-[38px] rounded px-3 text-sm outline-none border"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <button onClick={handleCreate}
              className="px-4 rounded text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent)' }}>
              Create
            </button>
            <button onClick={() => setShowCreate(false)}
              className="px-3 rounded text-sm" style={{ color: 'var(--text-dim)' }}>
              Cancel
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="size-6 rounded-full border-2 animate-spin"
                 style={{ borderColor: 'var(--text-dim)', borderTopColor: 'var(--accent)' }} />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-dim)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-40">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-sm">No projects yet</p>
            <p className="text-xs mt-1">Create your first project to get started</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {projects.map((p) => (
              <div key={p.id}
                className="flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors"
                style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sidebar)'}
                onClick={() => onOpenProject(p.id)}>
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="#dcb67a">
                    <path d="M.5 3.5A1.5 1.5 0 012 2h3.879a1.5 1.5 0 011.06.44l1.122 1.12H14a1.5 1.5 0 011.5 1.5v7.44a1.5 1.5 0 01-1.5 1.5H2a1.5 1.5 0 01-1.5-1.5V3.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(p.id) }}
                  className="px-3 py-1.5 rounded text-xs transition-colors"
                  style={{ color: 'var(--text-dim)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}>
                  {confirmDelete === p.id ? 'Confirm?' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default memo(Dashboard)
