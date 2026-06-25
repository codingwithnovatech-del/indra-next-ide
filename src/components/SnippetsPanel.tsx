import { memo, useState, useCallback, useEffect } from 'react'

interface Snippet {
  id: string
  name: string
  prefix: string
  body: string
  description: string
}

const STORAGE_KEY = 'indranext-snippets'

const defaultSnippets: Snippet[] = [
  { id: 'log', name: 'Console Log', prefix: 'log', body: 'console.log($1)', description: 'Log to console' },
  { id: 'clog', name: 'Console Log with variable', prefix: 'clog', body: 'console.log("$1:", $1)', description: 'Log variable' },
  { id: 'fn', name: 'Function', prefix: 'fn', body: 'function $1($2) {\n  $3\n}', description: 'Function declaration' },
  { id: 'arr', name: 'Arrow Function', prefix: 'arr', body: 'const $1 = ($2) => {\n  $3\n}', description: 'Arrow function' },
  { id: 'for', name: 'For Loop', prefix: 'for', body: 'for (let $1 = 0; $1 < $2; $1++) {\n  $3\n}', description: 'For loop' },
  { id: 'if', name: 'If Statement', prefix: 'if', body: 'if ($1) {\n  $2\n}', description: 'If statement' },
  { id: 'html5', name: 'HTML5 Template', prefix: 'html5', body: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>$1</title>\n</head>\n<body>\n  $2\n</body>\n</html>', description: 'HTML5 boilerplate' },
]

function loadSnippets(): Snippet[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return defaultSnippets
}

function saveSnippets(snippets: Snippet[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets)) } catch { /* ignore */ }
}

interface SnippetsPanelProps {
  visible: boolean
}

function SnippetsPanel({ visible }: SnippetsPanelProps) {
  const [snippets, setSnippets] = useState<Snippet[]>(loadSnippets)
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<Snippet | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newSnippet, setNewSnippet] = useState<Snippet>({ id: '', name: '', prefix: '', body: '', description: '' })

  useEffect(() => {
    saveSnippets(snippets)
    try { (window as unknown as Record<string, unknown>).__indranext_snippets = snippets } catch { /* ignore */ }
  }, [snippets])

  const handleDelete = useCallback((id: string) => {
    setSnippets((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!editData || !editData.name.trim()) return
    setSnippets((prev) => prev.map((s) => s.id === editData.id ? editData : s))
    setEditing(null)
    setEditData(null)
  }, [editData])

  const handleAddNew = useCallback(() => {
    if (!newSnippet.name.trim() || !newSnippet.prefix.trim()) return
    const id = 'snip_' + Date.now()
    setSnippets((prev) => [...prev, { ...newSnippet, id }])
    setShowNew(false)
    setNewSnippet({ id: '', name: '', prefix: '', body: '', description: '' })
  }, [newSnippet])

  if (!visible) return null

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
      <div className="flex items-center justify-between px-3 h-[30px] text-[11px] font-semibold uppercase tracking-wider select-none"
           style={{ color: 'var(--text-muted)' }}>
        <span>SNIPPETS</span>
        <button onClick={() => setShowNew(true)}
          className="flex size-5 items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
          style={{ color: 'var(--text-dim)' }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {showNew && (
          <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <input value={newSnippet.name} onChange={(e) => setNewSnippet((p) => ({ ...p, name: e.target.value }))}
              placeholder="Snippet name"
              className="w-full h-[28px] rounded px-2 text-xs outline-none border mb-2"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            />
            <input value={newSnippet.prefix} onChange={(e) => setNewSnippet((p) => ({ ...p, prefix: e.target.value }))}
              placeholder="Trigger prefix (e.g. my-snip)"
              className="w-full h-[28px] rounded px-2 text-xs outline-none border mb-2"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            />
            <textarea value={newSnippet.body} onChange={(e) => setNewSnippet((p) => ({ ...p, body: e.target.value }))}
              placeholder="Snippet body ($1, $2 for tab stops)"
              className="w-full h-[60px] rounded px-2 py-1 text-xs outline-none border mb-2 resize-none font-mono"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            />
            <div className="flex gap-2">
              <button onClick={() => setShowNew(false)}
                className="flex-1 h-[28px] rounded text-xs hover:bg-[var(--bg-hover)] transition-colors"
                style={{ color: 'var(--text-primary)' }}>
                Cancel
              </button>
              <button onClick={handleAddNew} disabled={!newSnippet.name.trim() || !newSnippet.prefix.trim()}
                className="flex-1 h-[28px] rounded text-xs text-white disabled:opacity-40"
                style={{ backgroundColor: 'var(--accent)' }}>
                Add
              </button>
            </div>
          </div>
        )}

        {snippets.map((s) => (
          editing === s.id && editData ? (
            <div key={s.id} className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <input value={editData.name} onChange={(e) => setEditData((p) => p ? { ...p, name: e.target.value } : null)}
                className="w-full h-[28px] rounded px-2 text-xs outline-none border mb-2"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              />
              <input value={editData.prefix} onChange={(e) => setEditData((p) => p ? { ...p, prefix: e.target.value } : null)}
                className="w-full h-[28px] rounded px-2 text-xs outline-none border mb-2"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              />
              <textarea value={editData.body} onChange={(e) => setEditData((p) => p ? { ...p, body: e.target.value } : null)}
                className="w-full h-[60px] rounded px-2 py-1 text-xs outline-none border mb-2 resize-none font-mono"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              />
              <div className="flex gap-2">
                <button onClick={() => setEditing(null)}
                  className="flex-1 h-[28px] rounded text-xs hover:bg-[var(--bg-hover)] transition-colors">Cancel</button>
                <button onClick={handleSaveEdit}
                  className="flex-1 h-[28px] rounded text-xs text-white"
                  style={{ backgroundColor: 'var(--accent)' }}>Save</button>
              </div>
            </div>
          ) : (
            <div key={s.id} className="px-3 py-2 border-b text-xs group"
                 style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                  <span className="ml-2 text-[10px] font-mono" style={{ color: 'var(--accent)' }}>{s.prefix}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(s.id); setEditData({ ...s }) }}
                    className="size-5 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"
                    style={{ color: 'var(--text-dim)' }}>
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    className="size-5 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"
                    style={{ color: 'var(--text-dim)' }}>
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
                      <path d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1z" />
                    </svg>
                  </button>
                </div>
              </div>
              {s.description && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-dim)' }}>{s.description}</p>}
              <p className="text-[10px] font-mono mt-1 truncate" style={{ color: 'var(--text-dim)' }}>{s.body.replace(/\n/g, '↵ ')}</p>
            </div>
          )
        ))}
      </div>
    </div>
  )
}

export default memo(SnippetsPanel)
export type { Snippet }
export { loadSnippets, defaultSnippets }
