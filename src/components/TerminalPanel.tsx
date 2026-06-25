import { memo, useEffect, useRef, useState } from 'react'

interface TerminalPanelProps {
  visible: boolean
  height: number
  onResize: (height: number) => void
}

const commands: Record<string, (args: string[]) => string> = {
  help: () => 'Available commands: help, ls, cd, pwd, echo, clear, whoami, date, mkdir, touch, cat, rm',
  whoami: () => 'user',
  date: () => new Date().toString(),
  pwd: () => '/workspace',
  clear: () => '',
  ls: () => 'index.html   style.css   app.js   src/   public/',
  echo: (args) => args.join(' ') || '',
  cd: () => '',
  cat: (args) => args.length ? `cat: ${args[0]}: Reading file content...` : 'cat: missing operand',
  mkdir: (args) => args.length ? '' : 'mkdir: missing operand',
  touch: (args) => args.length ? '' : 'touch: missing operand',
  rm: (args) => args.length ? '' : 'rm: missing operand',
}

function TerminalPanel({ visible, height, onResize }: TerminalPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [history, setHistory] = useState<string[]>([
    'Welcome to IndraNext IDE Terminal v1.0',
    'Type "help" for available commands.',
    '',
  ])
  const [currentInput, setCurrentInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [visible])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [history])

  const handleCommand = (input: string) => {
    const trimmed = input.trim()
    if (!trimmed) return
    setCmdHistory(prev => [...prev, trimmed])
    setHistoryIdx(-1)

    const parts = trimmed.split(/\s+/)
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)

    let output: string
    if (commands[cmd]) {
      output = commands[cmd](args)
    } else {
      output = `bash: ${cmd}: command not found`
    }

    setHistory(prev => {
      const newHistory = [...prev, `$ ${trimmed}`]
      if (output) newHistory.push(output)
      return newHistory
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput)
      setCurrentInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (cmdHistory.length > 0) {
        const newIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1)
        setHistoryIdx(newIdx)
        setCurrentInput(cmdHistory[newIdx])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIdx >= 0) {
        const newIdx = historyIdx + 1
        if (newIdx >= cmdHistory.length) {
          setHistoryIdx(-1)
          setCurrentInput('')
        } else {
          setHistoryIdx(newIdx)
          setCurrentInput(cmdHistory[newIdx])
        }
      }
    }
  }

  if (!visible) return null

  return (
    <div className="border-t flex flex-col" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-panel)' }}>
      <div className="flex items-center justify-between px-3 h-[30px] shrink-0 border-b text-xs select-none"
           style={{ borderColor: 'var(--border)', color: 'var(--text-dim)' }}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2v12h4V2H2zm1 1h2v3H3V3zm0 4h2v7H3V7zm5-5v12h4V2H8zm1 1h2v7H9V3zm0 8h2v3H9v-3zm5-5v9h4V6h-4zm1 1h2v7h-2V7zm0 8h2v2h-2v-2z" />
            </svg>
            TERMINAL
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onResize(height > 150 ? 150 : 350)}
            className="size-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
            title="Toggle panel size">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
              <path d={height > 150 ? 'M4 8l4 4 4-4' : 'M4 8l4-4 4 4'} />
            </svg>
          </button>
        </div>
      </div>

      <div ref={containerRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed"
        style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)', maxHeight: `${height}px`, minHeight: '100px' }}
        onClick={() => inputRef.current?.focus()}>
        {history.map((line, i) => (
          <div key={i} style={{
            color: line.startsWith('$ ') ? 'var(--text-primary)' : 'var(--text-dim)',
            whiteSpace: 'pre-wrap',
          }}>
            {line.startsWith('$ ') ? (
              <>
                <span style={{ color: 'var(--accent)' }}>$ </span>
                <span>{line.slice(2)}</span>
              </>
            ) : line.startsWith('bash:') ? (
              <span style={{ color: 'var(--error)' }}>{line}</span>
            ) : (
              line
            )}
          </div>
        ))}
        <div className="flex items-center gap-1 mt-0.5">
          <span style={{ color: 'var(--accent)' }}>$</span>
          <input ref={inputRef}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none border-none text-xs"
            style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>

      <div
        className="h-[3px] shrink-0 cursor-s-resize transition-colors"
        style={{ backgroundColor: 'var(--border)' }}
        onMouseDown={(e) => {
          e.preventDefault()
          const startY = e.clientY
          const startHeight = height
          const onMove = (ev: MouseEvent) => {
            const delta = startY - ev.clientY
            const newH = Math.max(100, Math.min(500, startHeight + delta))
            onResize(newH)
          }
          const onUp = () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
          }
          window.addEventListener('mousemove', onMove)
          window.addEventListener('mouseup', onUp)
        }}
      />
    </div>
  )
}

export default memo(TerminalPanel)
