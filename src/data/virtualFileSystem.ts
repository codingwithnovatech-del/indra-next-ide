import type { FileNode } from '../types'

let _nextId = 100

export function generateId(): string {
  return `n_${_nextId++}`
}

export function ensureIdCounter(counter: number) {
  if (counter >= _nextId) _nextId = counter + 1
}

export function resetIdCounter() {
  _nextId = 100
}

export function loadSession<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch { /* ignore */ }
  return fallback
}

export function saveSession(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch { /* ignore */ }
}

const DEBOUNCE_MAP = new Map<string, ReturnType<typeof setTimeout>>()

export function debounceSave(key: string, data: unknown, delay = 500) {
  const existing = DEBOUNCE_MAP.get(key)
  if (existing) clearTimeout(existing)
  DEBOUNCE_MAP.set(
    key,
    setTimeout(() => {
      saveSession(key, data)
      DEBOUNCE_MAP.delete(key)
    }, delay),
  )
}

export const initialVFS: FileNode = {
  id: generateId(),
  name: 'project',
  type: 'folder',
  children: [
    {
      id: generateId(),
      name: 'src',
      type: 'folder',
      children: [
        {
          id: generateId(),
          name: 'components',
          type: 'folder',
          children: [
            {
              id: generateId(),
              name: 'Sidebar.tsx',
              type: 'file',
              content: `import FileTree from './FileTree'\nimport type { FileNode } from '../types'\n\nexport default function Sidebar() {\n  return (\n    <aside>\n      <FileTree nodes={[]} />\n    </aside>\n  )\n}`,
            },
            {
              id: generateId(),
              name: 'TabBar.tsx',
              type: 'file',
              content: `import type { TabItem } from '../types'\n\nexport default function TabBar() {\n  return <div>TabBar</div>\n}`,
            },
            {
              id: generateId(),
              name: 'EditorArea.tsx',
              type: 'file',
              content: `export default function EditorArea() {\n  return <div>Editor</div>\n}`,
            },
            {
              id: generateId(),
              name: 'StatusBar.tsx',
              type: 'file',
              content: `export default function StatusBar() {\n  return <footer>StatusBar</footer>\n}`,
            },
            {
              id: generateId(),
              name: 'FileTree.tsx',
              type: 'file',
              content: `import type { FileNode } from '../types'\n\nexport default function FileTree() {\n  return <div>FileTree</div>\n}`,
            },
          ],
        },
        {
          id: generateId(),
          name: 'styles',
          type: 'folder',
          children: [
            {
              id: generateId(),
              name: 'app.css',
              type: 'file',
              content: `:root {\n  --primary: #007acc;\n  --sidebar-bg: #252526;\n  --editor-bg: #1e1e1e;\n  --text-primary: #cccccc;\n  --text-muted: #858585;\n}\n\n* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n  background: var(--editor-bg);\n  color: var(--text-primary);\n}`,
            },
            {
              id: generateId(),
              name: 'theme.css',
              type: 'file',
              content: `.dark-theme {\n  --bg: #1e1e1e;\n  --sidebar: #252526;\n  --tab: #2d2d2d;\n  --accent: #007acc;\n}\n\n.light-theme {\n  --bg: #ffffff;\n  --sidebar: #f3f3f3;\n  --tab: #ececec;\n  --accent: #007acc;\n}`,
            },
          ],
        },
        {
          id: generateId(),
          name: 'App.tsx',
          type: 'file',
          content: `import { useState } from 'react'\n\nfunction App() {\n  const [count, setCount] = useState(0)\n\n  return (\n    <div>\n      <h1>IndraNext IDE</h1>\n      <button onClick={() => setCount(c => c + 1)}>\n        Count: {count}\n      </button>\n    </div>\n  )\n}\n\nexport default App`,
        },
        {
          id: generateId(),
          name: 'main.tsx',
          type: 'file',
          content: `import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport App from './App'\n\ncreateRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n)`,
        },
        {
          id: generateId(),
          name: 'index.css',
          type: 'file',
          content: `@import "tailwindcss";\n\nbody {\n  margin: 0;\n  background: #1e1e1e;\n}`,
        },
        {
          id: generateId(),
          name: 'utils.ts',
          type: 'file',
          content: `export function cn(...classes: (string | false | undefined | null)[]): string {\n  return classes.filter(Boolean).join(' ')\n}\n\nexport function clamp(value: number, min: number, max: number): number {\n  return Math.min(Math.max(value, min), max)\n}`,
        },
        {
          id: generateId(),
          name: 'app.js',
          type: 'file',
          content: `// IndraNext IDE Demo Script\n\nfunction greet(name) {\n  return 'Hello, ' + name + '! Welcome to IndraNext IDE.';\n}\n\nconst app = {\n  name: 'IndraNext IDE',\n  version: '0.0.1',\n  features: ['Editor', 'Preview', 'File System', 'Tabs'],\n};\n\nconsole.log(greet('Developer'));\nconsole.log('App:', JSON.stringify(app, null, 2));\n\n// Live preview auto-updates when you edit this file\nconsole.log('Edit this file and watch the preview update instantly!');`,
        },
      ],
    },
    {
      id: generateId(),
      name: 'public',
      type: 'folder',
      children: [
        {
          id: generateId(),
          name: 'index.html',
          type: 'file',
          content: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>IndraNext IDE - Live Preview</title>\n    <link rel="stylesheet" href="styles/app.css">\n  </head>\n  <body>\n    <div id="app">\n      <h1>IndraNext IDE</h1>\n      <p>Welcome to the live preview engine.</p>\n      <p>Edit this HTML file, the CSS, or the JS — the preview updates instantly.</p>\n      <button onclick="alert('Hello from IndraNext IDE!')" style="padding:8px 16px;background:#007acc;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px;">Click Me</button>\n    </div>\n    <script src="src/app.js"></script>\n  </body>\n</html>`,
        },
        {
          id: generateId(),
          name: 'favicon.svg',
          type: 'file',
          content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="#007acc"/><text x="20" y="70" font-size="60" font-weight="bold" fill="white">I</text></svg>`,
        },
      ],
    },
    {
      id: generateId(),
      name: 'package.json',
      type: 'file',
      content: `{\n  "name": "indra-next-ide",\n  "private": true,\n  "version": "0.0.1",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc -b && vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0"\n  },\n  "devDependencies": {\n    "@vitejs/plugin-react": "^4.0.0",\n    "typescript": "^5.0.0",\n    "vite": "^6.0.0"\n  }\n}`,
    },
    {
      id: generateId(),
      name: 'tsconfig.json',
      type: 'file',
      content: `{\n  "compilerOptions": {\n    "target": "ES2020",\n    "module": "ESNext",\n    "moduleResolution": "bundler",\n    "jsx": "react-jsx",\n    "strict": true,\n    "skipLibCheck": true\n  },\n  "include": ["src"]\n}`,
    },
    {
      id: generateId(),
      name: 'vite.config.ts',
      type: 'file',
      content: `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})`,
    },
    {
      id: generateId(),
      name: 'README.md',
      type: 'file',
      content: `# IndraNext IDE\n\nA modern, VS Code-like web IDE built with React, TypeScript, and Monaco Editor.\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``,
    },
  ],
}

export function flattenTree(root: FileNode): Map<string, FileNode> {
  const map = new Map<string, FileNode>()
  function walk(node: FileNode) {
    map.set(node.id, node)
    node.children?.forEach(walk)
  }
  walk(root)
  return map
}

export function updateNodeContent(root: FileNode, id: string, content: string): FileNode {
  if (root.id === id) {
    if (root.type !== 'file') return root
    return { ...root, content }
  }
  if (!root.children) return root
  let changed = false
  const children = root.children.map((child) => {
    const updated = updateNodeContent(child, id, content)
    if (updated !== child) changed = true
    return updated
  })
  return changed ? { ...root, children } : root
}

export function addChild(root: FileNode, parentId: string, child: FileNode): FileNode {
  if (root.id === parentId) {
    return { ...root, children: [...(root.children || []), child] }
  }
  if (!root.children) return root
  let changed = false
  const children = root.children.map((c) => {
    const updated = addChild(c, parentId, child)
    if (updated !== c) changed = true
    return updated
  })
  return changed ? { ...root, children } : root
}

export function removeNode(root: FileNode, id: string): FileNode | null {
  if (root.id === id) return null
  if (!root.children) return root
  const children = root.children.map((c) => removeNode(c, id)).filter((c): c is FileNode => c !== null)
  return { ...root, children }
}

export function renameNode(root: FileNode, id: string, newName: string): FileNode {
  if (root.id === id) {
    return { ...root, name: newName }
  }
  if (!root.children) return root
  let changed = false
  const children = root.children.map((c) => {
    const updated = renameNode(c, id, newName)
    if (updated !== c) changed = true
    return updated
  })
  return changed ? { ...root, children } : root
}
