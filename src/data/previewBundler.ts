import type { FileNode } from '../types'

interface PathEntry { name: string; content: string; path: string }

function buildPathMap(flat: Map<string, FileNode>): Map<string, PathEntry> {
  const pathMap = new Map<string, PathEntry>()
  for (const [, node] of flat) {
    if (node.type === 'file' && node.content !== undefined) {
      pathMap.set(node.name.toLowerCase(), { name: node.name, content: node.content, path: node.name })
      const dotted = node.name.replace(/\./g, '')
      if (dotted !== node.name) pathMap.set(dotted.toLowerCase(), { name: node.name, content: node.content, path: node.name })
    }
  }
  return pathMap
}

const PATH_CACHE = new WeakMap<Map<string, FileNode>, Map<string, PathEntry>>()

function resolveFile(ref: string, flat: Map<string, FileNode>): string | null {
  let pathMap = PATH_CACHE.get(flat)
  if (!pathMap) {
    pathMap = buildPathMap(flat)
    PATH_CACHE.set(flat, pathMap)
  }
  const key = ref.split('/').pop()?.toLowerCase() ?? ref.toLowerCase()
  const entry = pathMap.get(key)
  return entry ? entry.content : null
}

export function bundleHtml(content: string, flat: Map<string, FileNode>): string {
  let result = content.replace(
    /<link\s+[^>]*href="([^"]+)"[^>]*>/gi,
    (match, href) => {
      const resolved = resolveFile(href, flat)
      if (resolved) return `<style>${resolved}</style>`
      return match.replace(/<link\s+/i, '<link disabled ')
    },
  )
  result = result.replace(
    /<script\s+[^>]*src="([^"]+)"[^>]*>/gi,
    (match, src) => {
      const resolved = resolveFile(src, flat)
      if (resolved) return `<script>\n${resolved}\n</script>`
      return `<!-- Script not found: ${src} -->`
    },
  )
  return result
}

export function bundleCss(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <style>
${content}
  </style>
</head>
<body>
  <div style="padding:20px;font-family:sans-serif;color:#d4d4d4;background:#1e1e1e;min-height:100vh">
    <p style="color:#858585;font-size:13px">← Previewing CSS file. Edit in the editor to see changes.</p>
    <div id="preview-content">
      <h1 style="color:#d4d4d4">CSS Preview</h1>
      <p style="color:#cccccc">Your styles are applied below:</p>
      <div class="demo-box" style="padding:16px;border:1px solid #404040;border-radius:4px;margin-top:12px">
        <p>This box inherits styles from your CSS.</p>
      </div>
    </div>
  </div>
</body>
</html>`
}

export function bundleJs(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <style>
    body { margin: 0; background: #1e1e1e; color: #d4d4d4; font-family: sans-serif; padding: 20px; }
  </style>
</head>
<body>
  <p style="color:#858585;font-size:13px">← Previewing JavaScript file. Output below:</p>
  <pre id="output" style="background:#252526;padding:12px;border-radius:4px;border:1px solid #404040;overflow:auto;"></pre>
  <script>
    const output = document.getElementById('output')
    const originalLog = console.log
    console.log = (...args) => {
      output.textContent += args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') + '\\n'
      originalLog.apply(console, args)
    }
    try {
${content}
    } catch (e) {
      output.textContent += 'Error: ' + e.message + '\\n'
    }
  </script>
</body>
</html>`
}

export function bundleForPreview(
  activeFileId: string | null,
  flat: Map<string, FileNode>,
): string {
  if (!activeFileId) return ''
  const node = flat.get(activeFileId)
  if (!node || node.type !== 'file' || !node.content) return ''

  const ext = node.name.split('.').pop()?.toLowerCase()

  if (ext === 'html' || ext === 'htm') {
    return bundleHtml(node.content, flat)
  }
  if (ext === 'css') {
    return bundleCss(node.content)
  }
  if (ext === 'js' || ext === 'jsx' || ext === 'mjs') {
    return bundleJs(node.content)
  }

  return `<html><body style="background:#1e1e1e;color:#858585;font-family:sans-serif;padding:20px;"><p>Preview not available for <strong>${node.name}</strong>. Open an HTML, CSS, or JavaScript file.</p></body></html>`
}
