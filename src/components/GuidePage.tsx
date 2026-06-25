import { memo, useState } from 'react'

const sections = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'files', label: 'File Management' },
  { id: 'editor', label: 'Code Editor' },
  { id: 'save', label: 'Save System' },
  { id: 'preview', label: 'Live Preview' },
  { id: 'ai', label: 'AI Chat' },
  { id: 'git', label: 'Git Integration' },
  { id: 'snippets', label: 'Snippets' },
  { id: 'terminal', label: 'Terminal & Problems' },
  { id: 'settings', label: 'Settings & Themes' },
  { id: 'cloud', label: 'Cloud Sync & Auth' },
  { id: 'shortcuts', label: 'Keyboard Shortcuts' },
]

interface GuidePageProps {
  onClose: () => void
}

const sectionContent: Record<string, { title: string; content: string; steps?: string[] }> = {
  welcome: {
    title: 'Welcome to IndraNext IDE',
    content: 'IndraNext IDE is a browser-based code editor built with React, TypeScript, and Monaco Editor — the same engine that powers VS Code. It provides a full development environment right in your browser, with features like file management, live preview, AI assistance, Git integration, and more. No installation needed, no setup required. Just open your browser and start coding.',
    steps: [
      'Create a new file from the Explorer sidebar or Welcome screen',
      'Write code in the Monaco editor with syntax highlighting',
      'Use the Live Preview to see your HTML/CSS/JS in action',
      'Save your work with Ctrl+S (auto-saves to your browser)',
      'Sign in to sync your projects across devices',
    ],
  },
  files: {
    title: 'File Management',
    content: 'The Explorer sidebar shows all files and folders in your workspace. You can create, rename, delete, and organize files just like in VS Code. Files are stored in your browser\'s localStorage (guest mode) or synced to the cloud when you sign in.',
    steps: [
      'Create files: Click the + icons in the Explorer header or right-click a folder',
      'Open files: Click any file in the tree or use Ctrl+P (Quick Open)',
      'Rename files: Right-click a file and select Rename, or slow-double-click the name',
      'Delete files: Right-click and select Delete',
      'Tabs: Open files appear as tabs at the top. Drag to reorder, click X to close',
      'Split editor: Right-click a file and select "Split Right" to view two files side by side',
    ],
  },
  editor: {
    title: 'Code Editor',
    content: 'The Monaco editor powers the core editing experience with syntax highlighting, IntelliSense, auto-completion, bracket matching, multi-cursor editing, Emmet support, and more. It supports TypeScript, JavaScript, HTML, CSS, JSON, Markdown, Python, and many other languages.',
    steps: [
      'Syntax highlighting: Automatically detected from file extension',
      'IntelliSense: Press Ctrl+Space to trigger code completion suggestions',
      'Emmet: Type CSS-like expressions and press Tab to expand (HTML/JSX/CSS)',
      'Multi-cursor: Press Alt+Click to add cursors, Ctrl+Alt+Down/Up to add sequential cursors',
      'Code folding: Click the arrows in the gutter to collapse/expand code blocks',
      'Minimap: Shows a miniature view of your file on the right side (disabled on mobile)',
      'Bracket pair colorization: Matching brackets are highlighted with colors',
    ],
  },
  save: {
    title: 'Save System',
    content: 'IndraNext IDE uses a VS Code-style save system. Files are auto-saved periodically, but you also have manual control with Ctrl+S. Unsaved files show a ● dot on the tab and the StatusBar shows "Unsaved" in yellow.',
    steps: [
      '● Dot indicator: A white dot on the tab means the file has unsaved changes',
      'Save: Press Ctrl+S (or Cmd+S on Mac) to save the current file',
      'StatusBar: Shows "Unsaved" (yellow) or "Saved" (green) next to the cursor position',
      'Auto-save: Files are automatically saved to localStorage every 500ms',
      'Cloud sync: When signed in, saves are synced to the cloud every 2 seconds',
      'Close with unsaved changes: The app will ask if you want to save before closing a dirty tab',
    ],
  },
  preview: {
    title: 'Live Preview',
    content: 'The Live Preview panel renders HTML files in real-time. It shows changes instantly as you type, making it perfect for web development. You can switch between device sizes, view console output, and even open the preview in a new tab.',
    steps: [
      'Open preview: Click the "Run" button in the TabBar or press Ctrl+Shift+P → "Run Preview"',
      'Auto-refresh: Toggle the checkbox to enable/disable automatic refresh on every keystroke',
      'Manual refresh: Click the refresh button to update the preview manually',
      'Device toolbar: Switch between Mobile (375px), Tablet (768px), and Desktop (100%) views',
      'Console output: Shows console.log() messages from your code',
      'Open in new tab: Opens the preview in a separate browser tab',
      'Error overlay: Shows a red banner at the top when there are runtime errors',
    ],
  },
  ai: {
    title: 'AI Chat',
    content: 'The AI Chat panel lets you ask coding questions, get explanations, generate code, debug issues, and more. It uses Groq\'s Llama 3.3 70B model for fast, helpful responses. Chat history is saved locally so you can refer back to previous conversations.',
    steps: [
      'Open AI Chat: Click the checkmark icon in the Activity Bar or press Ctrl+Shift+P → "AI Chat"',
      'Ask questions: Type your coding question and press Enter to send',
      'Shift+Enter: Adds a new line without sending (for multi-line questions)',
      'Clear chat: Click the trash icon to clear the conversation history',
      'API key: The Groq API key is set in the environment variables. Contact the developer if you need access',
    ],
  },
  git: {
    title: 'Git Integration',
    content: 'The Git panel provides basic source control functionality. You can track changes, stage files, and create commits. This is an in-memory Git simulation — perfect for learning Git concepts or managing small projects.',
    steps: [
      'Open Git: Click the Git icon in the Activity Bar (third from top)',
      'View changes: Modified files appear in the "Changes" list',
      'Stage files: Click the + icon next to a file to stage it',
      'Commit: Write a commit message and click the checkmark to commit staged changes',
      'Unstage: Click the - icon next to staged files to move them back to Changes',
    ],
  },
  snippets: {
    title: 'Snippets',
    content: 'Code snippets let you insert common code patterns quickly. IndraNext IDE comes with 18 built-in snippets covering JavaScript, TypeScript, React, HTML, CSS, and more. You can create your own custom snippets too.',
    steps: [
      'Open Snippets: Click the filter/tag icon in the Activity Bar (fifth from top)',
      'Insert snippet: Find a snippet and click "Insert in editor" to add it at the cursor position',
      'Autocomplete: Type a snippet prefix in the editor and select it from the IntelliSense suggestions',
      'Create snippet: Click "New Snippet" to define your own with a name, prefix, and body',
      'Edit snippet: Press the edit icon on any custom snippet to modify it',
      'Delete snippet: Press the trash icon to remove a snippet',
      'Import/Export: Download your snippets as JSON or upload a snippets file',
      'Category filter: Use the tags (javascript, react, html, etc.) to filter snippets',
    ],
  },
  terminal: {
    title: 'Terminal & Problems',
    content: 'The bottom panel houses two important tools: the Terminal and the Problems panel. The Terminal provides a simulated Unix-like command line for executing commands. The Problems panel shows errors and warnings from the editor\'s diagnostics.',
    steps: [
      'Open Terminal: Press Ctrl+` (backtick) or click "Terminal" in the StatusBar',
      'Available commands: help, ls, cd, pwd, echo, clear, whoami, date, mkdir, touch, cat, rm',
      'Terminal history: Press Up/Down arrows to navigate previous commands',
      'Resize: Drag the resize handle at the top of the terminal panel',
      'Problems panel: Click "PROBLEMS" in the bottom panel tab bar to view editor diagnostics',
      'Problems filter: Filter by severity — All, Errors, Warnings, or Info',
    ],
  },
  settings: {
    title: 'Settings & Themes',
    content: 'Customize every aspect of IndraNext IDE to suit your workflow. With 30+ settings across 4 categories, you can fine-tune the editor appearance, behavior, and terminal to your preferences.',
    steps: [
      'Open Settings: Click the gear icon in the Activity Bar (sixth from top)',
      'Search settings: Type in the search bar to filter settings by name',
      'Appearance: Theme (Dark/Light/Auto), Activity Bar position, Sidebar position, Tab wrap',
      'Editor·Behavior: Auto Save, Format on Save, Cursor style, Cursor blinking, Line height, Letter spacing',
      'Editor·Appearance: Font size, Font family, Line numbers, Minimap, Word wrap, Render whitespace, Bracket pair colorization',
      'Terminal: Font size, Font family, Cursor style',
      'Reset section: Click "Reset" at the top of each section to revert to defaults',
      'Theme: Ctrl+K Z toggles Zen Mode (distraction-free editing)',
      'Keybinding customizer: Edit keyboard shortcuts at the bottom of the Settings panel',
    ],
  },
  cloud: {
    title: 'Cloud Sync & Auth',
    content: 'Sign in to sync your projects across devices. IndraNext IDE supports email/password, Google, and GitHub authentication. When you\'re signed in, your files are automatically saved to the cloud and can be accessed from any device.',
    steps: [
      'Sign in: Click "Sign In" in the StatusBar, or go to Dashboard',
      'Methods: Email + password, Google OAuth, or GitHub OAuth',
      'Guest mode: Use the IDE without signing in — files save to your browser locally',
      'Cloud projects: Create multiple projects from the Dashboard',
      'Auto-sync: Changes are automatically synced to the cloud every 2 seconds when signed in',
      'Access anywhere: Sign in on any device to access your projects',
      'Dashboard: Click "Projects" in the StatusBar or press Ctrl+Shift+P → "Go to Dashboard"',
    ],
  },
  shortcuts: {
    title: 'Keyboard Shortcuts',
    content: 'Master these keyboard shortcuts to work faster in IndraNext IDE.',
    steps: [],
  },
}

const shortcutsList = [
  { keys: 'Ctrl+P', desc: 'Quick Open (files)' },
  { keys: 'Ctrl+Shift+P', desc: 'Command Palette' },
  { keys: 'Ctrl+S', desc: 'Save current file' },
  { keys: 'Ctrl+`', desc: 'Toggle Terminal' },
  { keys: 'Ctrl+B', desc: 'Toggle Sidebar' },
  { keys: 'Ctrl+Shift+F', desc: 'Search in files' },
  { keys: 'Ctrl+K Z', desc: 'Toggle Zen Mode' },
  { keys: 'Ctrl+Shift+`', desc: 'New Terminal' },
  { keys: 'Ctrl+Space', desc: 'Trigger IntelliSense' },
  { keys: 'Alt+Click', desc: 'Add multi-cursor' },
  { keys: 'Ctrl+D', desc: 'Select next occurrence' },
  { keys: 'Ctrl+/', desc: 'Toggle comment' },
  { keys: 'Ctrl+Shift+E', desc: 'Focus Explorer' },
  { keys: 'Escape', desc: 'Close panels / dialogs' },
]

function GuidePage({ onClose }: GuidePageProps) {
  const [activeSection, setActiveSection] = useState('welcome')
  const section = sectionContent[activeSection]
  const showShortcuts = activeSection === 'shortcuts'

  return (
    <div className="flex h-screen flex-col" style={{ backgroundColor: 'var(--bg-app)' }}>
      <header className="flex items-center justify-between px-4 h-[44px] shrink-0 border-b"
              style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="#007acc">
            <path d="M9.5 3.5L7 8l2.5 4.5H11L8.5 8 11 3.5H9.5zM5 3.5L2.5 8 5 12.5H6.5L4 8l2.5-4.5H5z" />
          </svg>
          <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>How to Use IndraNext IDE</h1>
        </div>
        <button onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
          <svg width="12" height="12" viewBox="0 0 10 10" fill="currentColor">
            <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Back to IDE
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-[200px] shrink-0 overflow-y-auto border-r py-2 max-md:hidden"
             style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className="w-full text-left px-4 py-2 text-xs transition-colors"
              style={{
                color: activeSection === s.id ? 'var(--text-primary)' : 'var(--text-dim)',
                backgroundColor: activeSection === s.id ? 'var(--bg-hover)' : 'transparent',
                borderRight: activeSection === s.id ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto px-6 py-6 max-md:px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              {section?.title}
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
              {section?.content}
            </p>

            {section?.steps && section.steps.length > 0 && (
              <div className="space-y-2 mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
                  Step-by-Step
                </h3>
                <ol className="space-y-2">
                  {section.steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                      <span className="shrink-0 flex items-center justify-center size-5 rounded-full text-[10px] font-medium"
                            style={{ backgroundColor: 'var(--accent)', color: 'white', marginTop: '2px' }}>
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {showShortcuts && (
              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-2">
                {shortcutsList.map((s) => (
                  <div key={s.keys} className="flex items-center gap-2 p-2 rounded-lg"
                       style={{ backgroundColor: 'var(--bg-sidebar)' }}>
                    <kbd className="px-2 py-1 rounded text-xs font-mono whitespace-nowrap"
                         style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      {s.keys}
                    </kbd>
                    <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{s.desc}</span>
                  </div>
                ))}
              </div>
            )}

            {activeSection !== 'shortcuts' && (
              <div className="flex max-md:hidden">
                {(() => {
                  const curIdx = sections.findIndex((x) => x.id === activeSection)
                  const next = sections[curIdx + 1]
                  if (!next) return null
                  return (
                    <button key={next.id} onClick={() => setActiveSection(next.id)}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium transition-colors mt-6"
                      style={{ backgroundColor: 'var(--bg-sidebar)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                      Next: {next.label}
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      </svg>
                    </button>
                  )
                })()}
              </div>
            )}

            <div className="mt-8 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[10px] text-center" style={{ color: 'var(--text-dim)' }}>
                IndraNext IDE v1.0 &middot; Developed by Ayush Kumar &middot; &copy; 2026 IndraNext Technologies
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default memo(GuidePage)
