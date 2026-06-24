export const fileTemplates: Record<string, string> = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Document</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>`,

  'component.tsx': `import { useState } from 'react'

interface AppProps {
  title?: string
}

export default function App({ title = 'Hello' }: AppProps) {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  )
}`,

  js: `// IndraNext IDE — JavaScript Starter

function main() {
  console.log('Hello from IndraNext IDE!')
}

main()`,

  css: `/* IndraNext IDE — Styles */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  color: #333;
}`,

  json: `{
  "name": "project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}`,
}

export function suggestTemplate(name: string): string | null {
  const ext = name.split('.').pop()?.toLowerCase()
  if (!ext) return null

  if (ext === 'html' || ext === 'htm') return fileTemplates.html
  if (ext === 'js' || ext === 'mjs') return fileTemplates.js
  if (ext === 'css') return fileTemplates.css
  if (ext === 'json') return fileTemplates.json
  if (name.endsWith('.tsx') || name.endsWith('.jsx')) return fileTemplates['component.tsx']
  if (ext === 'ts' && !name.endsWith('.tsx')) return fileTemplates.js

  return null
}
