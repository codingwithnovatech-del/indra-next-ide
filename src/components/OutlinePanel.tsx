import { memo, useMemo } from 'react'

interface OutlineSymbol {
  name: string
  type: 'function' | 'class' | 'interface' | 'type' | 'const' | 'import' | 'heading'
  line: number
  icon: string
  color: string
  indent: number
}

interface OutlinePanelProps {
  content: string
  language: string
  onLineClick?: (line: number) => void
}

function parseSymbols(content: string, language: string): OutlineSymbol[] {
  const symbols: OutlineSymbol[] = []
  const lines = content.split('\n')

  if (language === 'markdown') {
    for (let i = 0; i < lines.length; i++) {
      const h = lines[i].match(/^(#{1,6})\s+(.+)/)
      if (h) {
        symbols.push({
          name: h[2],
          type: 'heading',
          line: i + 1,
          icon: '#',
          color: '#4ec9b0',
          indent: h[1].length - 1,
        })
      }
    }
    return symbols
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    const cls = line.match(/^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/)
    if (cls) { symbols.push({ name: cls[1], type: 'class', line: i + 1, icon: 'C', color: '#dcdcaa', indent: 0 }); continue }

    const iface = line.match(/^(?:export\s+)?interface\s+(\w+)/)
    if (iface) { symbols.push({ name: iface[1], type: 'interface', line: i + 1, icon: 'I', color: '#4ec9b0', indent: 0 }); continue }

    const typeDecl = line.match(/^(?:export\s+)?type\s+(\w+)\s*=/)
    if (typeDecl) { symbols.push({ name: typeDecl[1], type: 'type', line: i + 1, icon: 'T', color: '#4fc1ff', indent: 0 }); continue }

    const imp = line.match(/^import\s+(?:\{\s*(\w+).*?\}\s*from\s*['"]|(\w+)\s+from\s*['"]|['"])/)
    if (imp) { const n = imp[1] || imp[2]; if (n) symbols.push({ name: n, type: 'import', line: i + 1, icon: '→', color: '#c586c0', indent: 0 }); continue }

    const fn = line.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)/)
    if (fn) { symbols.push({ name: fn[1], type: 'function', line: i + 1, icon: 'f', color: '#dcdcaa', indent: 0 }); continue }

    const constFn = line.match(/^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*(?:[:=]\s*(?:[a-zA-Z]+[\w<>]+\s*)?[=(]|=\s*(?:async\s+)?\()/)
    if (constFn) { symbols.push({ name: constFn[1], type: 'const', line: i + 1, icon: 'λ', color: '#569cd6', indent: 0 }); continue }

    const arrow = line.match(/^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:\(|async)/)
    if (arrow) { symbols.push({ name: arrow[1], type: 'function', line: i + 1, icon: 'f', color: '#dcdcaa', indent: 0 }) }
  }

  return symbols
}

function OutlinePanel({ content, language, onLineClick }: OutlinePanelProps) {
  const symbols = useMemo(() => parseSymbols(content, language), [content, language])

  if (!symbols.length) {
    return (
      <div className="px-3 py-4 text-center text-xs" style={{ color: 'var(--text-dim)' }}>
        No symbols found
      </div>
    )
  }

  return (
    <div className="text-xs">
      {symbols.map((s, i) => (
        <div key={`${s.line}-${s.name}-${i}`}
          className="flex cursor-pointer items-center gap-2 px-3 py-0.5 hover:bg-[var(--bg-hover)] transition-colors"
          style={{ paddingLeft: `${12 + s.indent * 16}px` }}
          onClick={() => onLineClick?.(s.line)}
          title={`Line ${s.line}`}>
          <span className="shrink-0 w-4 text-center font-bold" style={{ color: s.color, fontSize: '10px' }}>{s.icon}</span>
          <span className="truncate" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
          <span className="shrink-0 ml-auto text-[10px]" style={{ color: 'var(--text-dim)' }}>{s.line}</span>
        </div>
      ))}
    </div>
  )
}

export default memo(OutlinePanel)
