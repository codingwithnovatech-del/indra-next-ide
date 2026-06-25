import { memo, useMemo } from 'react'

interface MarkdownPreviewProps {
  content: string
}

function renderMarkdown(md: string): string {
  let html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre class="md-code-block"><code class="${lang ? `lang-${lang}` : ''}">${code.trim()}</code></pre>`
  )

  html = html.replace(/### (.+)/g, '<h3>$1</h3>')
  html = html.replace(/## (.+)/g, '<h2>$1</h2>')
  html = html.replace(/^# (.+)/gm, '<h1>$1</h1>')

  html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  html = html.replace(/^- (.+)/gm, '<li>$1</li>')
  html = html.replace(/<li>(.+?)<\/li>/gs, '<ul><li>$1</li></ul>')
  html = html.replace(/<\/ul>\s*<ul>/g, '')

  html = html.replace(/- \[x\] (.+)/gi, '<li><input type="checkbox" checked disabled> $1</li>')
  html = html.replace(/- \[ \] (.+)/gi, '<li><input type="checkbox" disabled> $1</li>')

  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

  html = html.replace(/^---$/gm, '<hr>')

  const lines = html.split('\n')
  const result: string[] = []
  let inList = false
  for (const line of lines) {
    if (line.startsWith('<li>')) {
      if (!inList) { result.push('<ul>'); inList = true }
      result.push(line)
    } else {
      if (inList) { result.push('</ul>'); inList = false }
      if (line.startsWith('<h') || line.startsWith('<pre') || line.startsWith('<ul') || line.startsWith('<hr') || line.startsWith('<a')) {
        result.push(line)
      } else if (line.trim()) {
        result.push(`<p>${line}</p>`)
      }
    }
  }
  if (inList) result.push('</ul>')
  return result.join('\n')
}

function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const html = useMemo(() => renderMarkdown(content), [content])

  return (
    <div className="h-full overflow-y-auto p-6" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
      <div
        className="prose prose-sm max-w-none"
        style={{ color: 'var(--text-primary)' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style>{`
        .md-code-block { background: rgba(0,0,0,0.25); border-radius: 6px; padding: 12px 16px; overflow-x: auto; margin: 12px 0; font-size: 13px; font-family: 'Consolas','Courier New',monospace; color: #d4d4d4; border: 1px solid rgba(255,255,255,0.06); }
        .md-inline-code { background: rgba(0,0,0,0.2); padding: 1px 5px; border-radius: 3px; font-size: 0.9em; font-family: 'Consolas','Courier New',monospace; color: #ce9178; }
        .md-preview h1 { font-size: 1.6em; font-weight: 600; margin: 0 0 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
        .md-preview h2 { font-size: 1.3em; font-weight: 600; margin: 20px 0 8px; }
        .md-preview h3 { font-size: 1.1em; font-weight: 600; margin: 16px 0 6px; }
        .md-preview p { margin: 8px 0; line-height: 1.6; }
        .md-preview ul { margin: 6px 0; padding-left: 22px; }
        .md-preview li { margin: 3px 0; line-height: 1.5; }
        .md-preview a { color: #4fc1ff; text-decoration: none; }
        .md-preview a:hover { text-decoration: underline; }
        .md-preview hr { border: 0; height: 1px; background: var(--border); margin: 16px 0; }
        .md-preview input[type="checkbox"] { margin-right: 6px; }
        .md-preview strong { color: var(--text-primary); }
        .md-preview em { color: var(--text-dim); }
      `}</style>
    </div>
  )
}

export default memo(MarkdownPreview)
