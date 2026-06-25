import { memo, useState, useCallback, useEffect, useRef } from 'react'

interface Snippet {
  id: string
  name: string
  prefix: string
  body: string
  description: string
  tags: string[]
  usageCount: number
}

const STORAGE_KEY = 'indranext-snippets'

const defaultSnippets: Snippet[] = [
  { id: 'log', name: 'Console Log', prefix: 'log', body: 'console.log($1)', description: 'Log to console', tags: ['javascript', 'utility'], usageCount: 0 },
  { id: 'clog', name: 'Console Log Variable', prefix: 'clog', body: 'console.log("$1:", $1)', description: 'Log variable with name', tags: ['javascript', 'utility'], usageCount: 0 },
  { id: 'fn', name: 'Function', prefix: 'fn', body: 'function $1($2) {\n  $3\n}', description: 'Function declaration', tags: ['javascript', 'utility'], usageCount: 0 },
  { id: 'arr', name: 'Arrow Function', prefix: 'arr', body: 'const $1 = ($2) => {\n  $3\n}', description: 'Arrow function', tags: ['javascript', 'utility'], usageCount: 0 },
  { id: 'for', name: 'For Loop', prefix: 'for', body: 'for (let $1 = 0; $1 < $2; $1++) {\n  $3\n}', description: 'For loop', tags: ['javascript'], usageCount: 0 },
  { id: 'if', name: 'If Statement', prefix: 'if', body: 'if ($1) {\n  $2\n}', description: 'If statement', tags: ['javascript'], usageCount: 0 },
  { id: 'html5', name: 'HTML5 Template', prefix: 'html5', body: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>$1</title>\n</head>\n<body>\n  $2\n</body>\n</html>', description: 'HTML5 boilerplate', tags: ['html'], usageCount: 0 },
  { id: 'react-comp', name: 'React Component', prefix: 'rcomp', body: 'import React from \'react\'\n\ninterface $1Props {}\n\nfunction $1({}: $1Props) {\n  return (\n    <div>\n      $2\n    </div>\n  )\n}\n\nexport default $1', description: 'React functional component', tags: ['react', 'typescript'], usageCount: 0 },
  { id: 'react-state', name: 'React useState', prefix: 'rstate', body: 'const [$1, set$2] = useState<$3>($4)', description: 'React useState hook', tags: ['react', 'typescript'], usageCount: 0 },
  { id: 'react-effect', name: 'React useEffect', prefix: 'reff', body: 'useEffect(() => {\n  $1\n}, [$2])', description: 'React useEffect hook', tags: ['react'], usageCount: 0 },
  { id: 'async-fn', name: 'Async Function', prefix: 'async', body: 'async function $1($2) {\n  try {\n    const result = await $3\n    return result\n  } catch (error) {\n    console.error(error)\n  }\n}', description: 'Async function with try/catch', tags: ['javascript', 'utility'], usageCount: 0 },
  { id: 'fetch-get', name: 'Fetch GET', prefix: 'fetchg', body: 'const response = await fetch(\'$1\')\nif (!response.ok) throw new Error(\'HTTP \' + response.status)\nconst data = await response.json()', description: 'Fetch GET request', tags: ['javascript', 'api'], usageCount: 0 },
  { id: 'fetch-post', name: 'Fetch POST', prefix: 'fetchp', body: 'const response = await fetch(\'$1\', {\n  method: \'POST\',\n  headers: { \'Content-Type\': \'application/json\' },\n  body: JSON.stringify($2),\n})\nif (!response.ok) throw new Error(\'HTTP \' + response.status)\nconst data = await response.json()', description: 'Fetch POST request', tags: ['javascript', 'api'], usageCount: 0 },
  { id: 'ts-interface', name: 'TypeScript Interface', prefix: 'iface', body: 'interface $1 {\n  $2: $3\n}', description: 'TypeScript interface', tags: ['typescript'], usageCount: 0 },
  { id: 'ts-type', name: 'TypeScript Type', prefix: 'ttype', body: 'type $1 = $2', description: 'TypeScript type alias', tags: ['typescript'], usageCount: 0 },
  { id: 'try-catch', name: 'Try Catch', prefix: 'try', body: 'try {\n  $1\n} catch (error) {\n  $2\n}', description: 'Try catch block', tags: ['javascript'], usageCount: 0 },
  { id: 'export-default', name: 'Export Default', prefix: 'expd', body: 'export default $1', description: 'Default export', tags: ['javascript', 'typescript'], usageCount: 0 },
  { id: 'export-named', name: 'Export Named', prefix: 'expn', body: 'export { $1 }', description: 'Named export', tags: ['javascript', 'typescript'], usageCount: 0 },
]

const ALL_TAGS = ['javascript', 'typescript', 'react', 'html', 'css', 'api', 'utility']

function loadSnippets(): Snippet[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return defaultSnippets.map(s => ({ ...s, tags: s.tags ?? [], usageCount: s.usageCount ?? 0 }))
}

function saveSnippets(snippets: Snippet[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets)) } catch { /* ignore */ }
}

interface SnippetsPanelProps {
  visible: boolean
  onInsertSnippet?: (body: string) => void
}

function SnippetsPanel({ visible, onInsertSnippet }: SnippetsPanelProps) {
  const [snippets, setSnippets] = useState<Snippet[]>(loadSnippets)
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<Snippet | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newSnippet, setNewSnippet] = useState<{ name: string; prefix: string; body: string; description: string; tags: string[] }>({ name: '', prefix: '', body: '', description: '', tags: [] })
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'usage'>('name')
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    saveSnippets(snippets)
    try { (window as unknown as Record<string, unknown>).__indranext_snippets = snippets } catch { /* ignore */ }
  }, [snippets])

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Delete this snippet?')) setSnippets((prev) => prev.filter((s) => s.id !== id))
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
    setSnippets((prev) => [...prev, { ...newSnippet, id, tags: newSnippet.tags, usageCount: 0 }])
    setShowNew(false)
    setNewSnippet({ name: '', prefix: '', body: '', description: '', tags: [] })
  }, [newSnippet])

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(snippets, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'indranext-snippets.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [snippets])

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string) as Snippet[]
        if (!Array.isArray(imported)) throw new Error()
        setSnippets(prev => {
          const existing = new Set(prev.map(s => s.id))
          const merged = [...prev]
          for (const s of imported) {
            if (!existing.has(s.id)) {
              merged.push(s)
              existing.add(s.id)
            }
          }
          return merged
        })
      } catch {
        alert('Invalid snippets file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  const toggleTag = useCallback((tag: string) => {
    if (editing) {
      setEditData(prev => prev ? { ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag] } : prev)
    } else if (showNew) {
      setNewSnippet(prev => ({ ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag] }))
    } else {
      setActiveTag(prev => prev === tag ? null : tag)
    }
  }, [editing, showNew])

  const incrementUsage = useCallback((id: string) => {
    setSnippets(prev => prev.map(s => s.id === id ? { ...s, usageCount: s.usageCount + 1 } : s))
  }, [])

  const handleDragStart = useCallback((e: React.DragEvent, idx: number) => {
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIdx(idx)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, toIdx: number) => {
    e.preventDefault()
    if (dragIdx !== null && dragIdx !== toIdx) {
      setSnippets(prev => {
        const next = [...prev]
        const [moved] = next.splice(dragIdx, 1)
        next.splice(toIdx, 0, moved)
        return next
      })
    }
    setDragIdx(null)
    setDragOverIdx(null)
  }, [dragIdx])

  const handleDragEnd = useCallback(() => {
    setDragIdx(null)
    setDragOverIdx(null)
  }, [])

  const filtered = snippets
    .filter(s => {
      if (activeTag && !s.tags.includes(activeTag)) return false
      if (!search) return true
      const q = search.toLowerCase()
      return s.name.toLowerCase().includes(q) || s.prefix.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.body.toLowerCase().includes(q)
    })
    .sort((a, b) => sortBy === 'usage' ? b.usageCount - a.usageCount : a.name.localeCompare(b.name))

  if (!visible) return null

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
      <div className="flex items-center justify-between px-3 h-[30px] text-[11px] font-semibold uppercase tracking-wider select-none"
           style={{ color: 'var(--text-muted)' }}>
        <span>Snippets</span>
        <div className="flex gap-1">
          <button onClick={handleExport} title="Export snippets"
            className="flex size-5 items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
            style={{ color: 'var(--text-dim)' }}>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a.5.5 0 01.5.5v7.793l2.146-2.147a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 01.708-.708L7.5 9.293V1.5A.5.5 0 018 1z" />
              <path d="M1 10v3a2 2 0 002 2h10a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="1.2" fill="none" />
            </svg>
          </button>
          <button onClick={() => fileInputRef.current?.click()} title="Import snippets"
            className="flex size-5 items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
            style={{ color: 'var(--text-dim)' }}>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a.5.5 0 01.5.5v7.793l2.146-2.147a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 01.708-.708L7.5 9.293V1.5A.5.5 0 018 1z" />
              <path d="M1 10v3a2 2 0 002 2h10a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="1.2" fill="none" />
            </svg>
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button onClick={() => setShowNew(true)} title="New snippet"
            className="flex size-5 items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
            style={{ color: 'var(--text-dim)' }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-3 pb-1">
        <div className="relative">
          <svg className="absolute left-2 top-1/2 -translate-y-1/2" width="10" height="10" viewBox="0 0 16 16" fill="var(--text-dim)">
            <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85-.017.016zm-5.242.156a5 5 0 110-10 5 5 0 010 10z" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[26px] rounded pl-7 pr-2 text-[11px] outline-none border"
            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            placeholder="Search snippets..."
          />
        </div>
      </div>

      <div className="px-3 pb-1 flex flex-wrap gap-1">
        {ALL_TAGS.map(tag => (
          <button key={tag} onClick={() => toggleTag(tag)}
            className="px-2 py-0.5 rounded text-[10px] transition-colors"
            style={{
              backgroundColor: activeTag === tag ? 'var(--accent)' : 'var(--bg-input)',
              color: activeTag === tag ? 'white' : 'var(--text-dim)',
              border: '1px solid var(--border)',
            }}>
            {tag}
          </button>
        ))}
        <button onClick={() => setSortBy(prev => prev === 'name' ? 'usage' : 'name')}
          className="px-2 py-0.5 rounded text-[10px] ml-auto transition-colors"
          style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
          {sortBy === 'name' ? 'A-Z' : 'Popular'}
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
              placeholder="Body ($1, $2 = tab stops)"
              className="w-full h-[72px] rounded px-2 py-1 text-xs outline-none border mb-2 resize-none font-mono leading-relaxed"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            />
            <div className="flex flex-wrap gap-1 mb-2">
              {ALL_TAGS.map(tag => (
                <button key={tag} onClick={() => setNewSnippet(p => ({ ...p, tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag] }))}
                  className="px-2 py-0.5 rounded text-[10px] transition-colors"
                  style={{
                    backgroundColor: newSnippet.tags.includes(tag) ? 'var(--accent)' : 'var(--bg-input)',
                    color: newSnippet.tags.includes(tag) ? 'white' : 'var(--text-dim)',
                    border: '1px solid var(--border)',
                  }}>
                  {tag}
                </button>
              ))}
            </div>
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

        {filtered.length === 0 ? (
          <div className="text-xs text-center py-8" style={{ color: 'var(--text-dim)' }}>
            {search ? `No snippets for "${search}"` : 'No snippets yet. Create one!'}
          </div>
        ) : (
          filtered.map((s) => {
            const realIdx = snippets.indexOf(s)
            return editing === s.id && editData ? (
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
                  className="w-full h-[72px] rounded px-2 py-1 text-xs outline-none border mb-2 resize-none font-mono leading-relaxed"
                  style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                />
                <div className="flex flex-wrap gap-1 mb-2">
                  {ALL_TAGS.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)}
                      className="px-2 py-0.5 rounded text-[10px] transition-colors"
                      style={{
                        backgroundColor: editData.tags.includes(tag) ? 'var(--accent)' : 'var(--bg-input)',
                        color: editData.tags.includes(tag) ? 'white' : 'var(--text-dim)',
                        border: '1px solid var(--border)',
                      }}>
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(null)}
                    className="flex-1 h-[28px] rounded text-xs hover:bg-[var(--bg-hover)] transition-colors"
                    style={{ color: 'var(--text-primary)' }}>
                    Cancel
                  </button>
                  <button onClick={handleSaveEdit}
                    className="flex-1 h-[28px] rounded text-xs text-white"
                    style={{ backgroundColor: 'var(--accent)' }}>
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div key={s.id}
                draggable
                onDragStart={(e) => handleDragStart(e, realIdx)}
                onDragOver={(e) => handleDragOver(e, realIdx)}
                onDrop={(e) => handleDrop(e, realIdx)}
                onDragEnd={handleDragEnd}
                className="px-3 py-2 border-b text-xs group select-none"
                style={{
                  borderColor: 'var(--border)',
                  opacity: dragIdx === realIdx ? 0.4 : 1,
                  borderTop: dragOverIdx === realIdx && dragIdx !== realIdx ? '2px solid var(--accent)' : '',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg width="8" height="8" viewBox="0 0 16 16" fill="var(--text-dim)" className="cursor-grab shrink-0 opacity-30 group-hover:opacity-100">
                      <path d="M5 4a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2zM5 9a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2zM5 14a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="#519aba" className="shrink-0">
                      <path d="M1 2.5A1.5 1.5 0 012.5 1h3.207a1.5 1.5 0 011.06.44l3.754 3.753a1.5 1.5 0 01.44 1.06V13.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 13.5V2.5z" />
                    </svg>
                    <div className="min-w-0">
                      <span className="font-medium truncate block" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                      <span className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>{s.prefix}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onInsertSnippet && (
                      <button onClick={() => { incrementUsage(s.id); onInsertSnippet(s.body) }}
                        className="size-5 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"
                        style={{ color: 'var(--text-dim)' }} title="Insert in editor">
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M4 2.5v11l9-5.5L4 2.5z" />
                        </svg>
                      </button>
                    )}
                    <button onClick={() => { setEditing(s.id); setEditData({ ...s }) }}
                      className="size-5 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"
                      style={{ color: 'var(--text-dim)' }} title="Edit">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(s.id)}
                      className="size-5 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"
                      style={{ color: 'var(--text-dim)' }} title="Delete">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
                        <path d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1z" />
                      </svg>
                    </button>
                  </div>
                </div>
                {s.description && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-dim)' }}>{s.description}</p>}
                <div className="flex items-center gap-2 mt-0.5">
                  {s.tags.map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                      {t}
                    </span>
                  ))}
                  {s.usageCount > 0 && (
                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                      Used {s.usageCount}x
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-mono mt-1 truncate" style={{ color: 'var(--text-dim)' }}>{s.body.replace(/\n/g, '\u21B5 ')}</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default memo(SnippetsPanel)
export type { Snippet }
export { defaultSnippets }
