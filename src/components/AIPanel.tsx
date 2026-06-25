import { memo, useState, useCallback, useRef, useEffect } from 'react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY ?? ''
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const STORAGE_KEY = 'indranext-ai-chat'
const MODEL = 'llama-3.3-70b-versatile'

function loadChat(): ChatMessage[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return []
}

function AIPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadChat)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)) } catch { /* ignore */ }
  }, [messages])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg: ChatMessage = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setLoading(true)

    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: 'You are an AI coding assistant for IndraNext IDE. Help users write code, debug, explain concepts, and suggest improvements. Be concise and provide code examples when helpful.' },
            ...updated.map(m => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content ?? 'No response'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Failed to connect'}` }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [input, loading, messages])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }, [handleSend])

  const handleClear = useCallback(() => {
    if (window.confirm('Clear chat history?')) setMessages([])
  }, [])

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
      <div className="flex items-center justify-between px-3 h-[30px] text-[11px] font-semibold uppercase tracking-wider select-none"
           style={{ color: 'var(--text-muted)' }}>
        <span>AI Chat</span>
        <button onClick={handleClear} title="Clear chat"
          className="flex size-5 items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
          style={{ color: 'var(--text-dim)' }}>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
            <path d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1z" />
          </svg>
        </button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {messages.length === 0 && (
          <div className="text-xs text-center py-8" style={{ color: 'var(--text-dim)' }}>
            <div className="size-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,122,204,0.15)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#007acc">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <p className="font-medium mb-1">AI Coding Assistant</p>
            <p>Ask me anything about code!</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'assistant' && (
              <div className="size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(0,122,204,0.2)' }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="#007acc">
                  <path d="M8 1a3 3 0 100 6 3 3 0 000-6zM2 13c0 2 2.5 3 6 3s6-1 6-3c0-2-2.5-3-6-3s-6 1-6 3z" />
                </svg>
              </div>
            )}
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
              m.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
            }`}
            style={{
              backgroundColor: m.role === 'user' ? 'var(--accent)' : 'var(--bg-input)',
              color: m.role === 'user' ? 'white' : 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="size-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0,122,204,0.2)' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="#007acc">
                <path d="M8 1a3 3 0 100 6 3 3 0 000-6zM2 13c0 2 2.5 3 6 3s6-1 6-3c0-2-2.5-3-6-3s-6 1-6 3z" />
              </svg>
            </div>
            <div className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-dim)' }}>
              <span className="inline-block animate-pulse">Thinking</span>
              <span className="inline-block animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
              <span className="inline-block animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
              <span className="inline-block animate-pulse" style={{ animationDelay: '0.6s' }}>.</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
        <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Ask AI for help..."
          rows={2}
          className="flex-1 rounded-lg px-3 py-2 text-xs outline-none border resize-none leading-relaxed"
          style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
        />
        <button onClick={handleSend} disabled={!input.trim() || loading}
          className="size-[36px] shrink-0 rounded-lg flex items-center justify-center text-white disabled:opacity-40 transition-opacity self-end"
          style={{ backgroundColor: 'var(--accent)' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 1l13 7L1 15V1z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default memo(AIPanel)
