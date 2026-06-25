import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useFileSystem } from './hooks/useFileSystem'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { useCloudProjects } from './hooks/useCloudProjects'
import { useCloudSync } from './hooks/useCloudSync'
import { useSettings } from './hooks/useSettings'
import { bundleForPreview } from './data/previewBundler'
import ActivityBar from './components/ActivityBar'
import type { ActivityBarView } from './components/ActivityBar'
import HamburgerButton from './components/HamburgerButton'
import Sidebar from './components/Sidebar'
import TabBar from './components/TabBar'
import EditorArea from './components/EditorArea'
import Breadcrumbs from './components/Breadcrumbs'
import LivePreview from './components/LivePreview'
import CommandPalette from './components/CommandPalette'
import type { Command } from './components/CommandPalette'
import StatusBar from './components/StatusBar'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import LoadingScreen from './components/LoadingScreen'
import ContextMenu from './components/ContextMenu'
import type { ContextMenuItem } from './components/ContextMenu'
import TerminalPanel from './components/TerminalPanel'
import ProblemsPanel from './components/ProblemsPanel'
import type { FileNode } from './types'

type Screen = 'loading' | 'login' | 'dashboard' | 'ide'

type BottomPanelTab = 'terminal' | 'problems'

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    ts: 'TypeScript', tsx: 'TypeScript JSX',
    js: 'JavaScript', jsx: 'JavaScript JSX',
    html: 'HTML', htm: 'HTML',
    css: 'CSS',
    json: 'JSON',
    md: 'Markdown',
    py: 'Python',
  }
  return map[ext ?? ''] ?? 'Plain Text'
}

function App() {
  const { session, user, loading: authLoading, error: authError, message: authMessage, signUp, signIn, signOut, setError: setAuthError } = useAuth()
  const { mode: themeMode, toggleTheme, setMode, isDark } = useTheme()
  const { settings, updateSettings } = useSettings()

  const [screen, setScreen] = useState<Screen>('loading')
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) { setScreen('loading'); return }
    if (!session) { setScreen('login'); return }
    setScreen('dashboard')
  }, [authLoading, session])

  const { projects, loading: projectsLoading, error: projectsError, createProject, deleteProject } = useCloudProjects(user)
  const { syncing, loadSnapshot, saveSnapshot } = useCloudSync()

  const handleOpenProject = useCallback(async (id: string) => {
    setCurrentProjectId(id)
    setScreen('ide')
  }, [])

  const handleNewProjectThenOpen = useCallback(async (name: string) => {
    const id = await createProject(name)
    if (id) {
      setCurrentProjectId(id)
      setScreen('ide')
    }
  }, [createProject])

  const handleBackToDashboard = useCallback(() => {
    setCurrentProjectId(null)
    setScreen('dashboard')
  }, [])

  const handleSignOut = useCallback(async () => {
    await signOut()
    setCurrentProjectId(null)
  }, [signOut])

  const isIDE = screen === 'ide'

  const {
    root: vfsRoot,
    flat,
    openFiles,
    activeFileId,
    openFile,
    closeFile,
    updateContent,
    createItem,
    deleteItem,
    renameItem,
    replaceRoot,
    reorderTabs,
  } = useFileSystem(currentProjectId ?? 'default')

  const cloudLoadedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!isIDE || !currentProjectId) return
    if (cloudLoadedRef.current === currentProjectId) return
    cloudLoadedRef.current = currentProjectId
    loadSnapshot(currentProjectId).then((snapshot) => {
      if (snapshot && snapshot.children) {
        replaceRoot(snapshot, [], null)
      }
    })
  }, [isIDE, currentProjectId, loadSnapshot, replaceRoot])

  const cloudSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevRootRef = useRef<FileNode>(vfsRoot)
  useEffect(() => {
    if (!isIDE || !currentProjectId) return
    if (prevRootRef.current === vfsRoot) return
    prevRootRef.current = vfsRoot
    if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current)
    cloudSaveTimer.current = setTimeout(() => {
      saveSnapshot(currentProjectId, vfsRoot)
    }, 2000)
  }, [vfsRoot, isIDE, currentProjectId, saveSnapshot])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [manualPreviewContent, setManualPreviewContent] = useState('')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [paletteMode, setPaletteMode] = useState<'files' | 'commands'>('files')
  const [sidebarView, setSidebarView] = useState<ActivityBarView>('explorer')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [zenMode, setZenMode] = useState(false)
  const [bottomPanelTab, setBottomPanelTab] = useState<BottomPanelTab>('terminal')
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [terminalHeight, setTerminalHeight] = useState(200)
  const [problemsOpen, setProblemsOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null)
  const [splitFileId, setSplitFileId] = useState<string | null>(null)

  const isMobile = useMediaQuery('(max-width: 767px)')
  const paletteOpenRef = useRef(paletteOpen)
  paletteOpenRef.current = paletteOpen
  const isIDERef = useRef(isIDE)
  isIDERef.current = isIDE

  const activeTab = openFiles.find((t) => t.isActive)

  const computePreview = useCallback(() => bundleForPreview(activeFileId, flat), [activeFileId, flat])

  const previewContent = useMemo(() => {
    if (!previewOpen) return ''
    if (autoRefresh) return computePreview()
    return manualPreviewContent
  }, [previewOpen, autoRefresh, computePreview, manualPreviewContent])

  const handleSplitEditor = useCallback((fileId: string) => {
    setSplitFileId((prev) => prev === fileId ? null : fileId)
  }, [])

  const handleCloseSplit = useCallback(() => {
    setSplitFileId(null)
  }, [])

  const handleRun = useCallback(() => {
    setManualPreviewContent(computePreview())
    setPreviewOpen(true)
  }, [computePreview])

  const handleTogglePreview = useCallback(() => {
    setPreviewOpen((prev) => {
      if (!prev) {
        requestAnimationFrame(() => setManualPreviewContent(computePreview()))
      }
      return !prev
    })
  }, [computePreview])

  const handleSelectTab = useCallback((id: string) => openFile(id), [openFile])
  const handleCloseTab = useCallback((id: string) => closeFile(id), [closeFile])
  const toggleSidebar = useCallback(() => setSidebarOpen((p) => !p), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const handleViewChange = useCallback((view: ActivityBarView) => {
    setSidebarView(view)
    if (isMobile) setSidebarOpen(true)
  }, [isMobile])

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (activeFileId && value !== undefined) updateContent(activeFileId, value)
    },
    [activeFileId, updateContent],
  )

  const handleFileClick = useCallback(
    (id: string) => {
      openFile(id)
      if (isMobile) setSidebarOpen(false)
    },
    [openFile, isMobile],
  )

  const handleCreateItem = useCallback(
    (parentId: string, type: 'file' | 'folder', name: string) => createItem(parentId, type, name),
    [createItem],
  )

  const handlePaletteCreateFile = useCallback((name: string) => {
    const id = createItem(vfsRoot.id, 'file', name)
    if (id) openFile(id)
  }, [createItem, openFile, vfsRoot.id])

  const handleClosePreview = useCallback(() => setPreviewOpen(false), [])
  const handleToggleAutoRefresh = useCallback(() => setAutoRefresh((p) => !p), [])
  const handlePreviewManualRun = useCallback(() => setManualPreviewContent(computePreview()), [computePreview])

  const toggleZenMode = useCallback(() => setZenMode((p) => !p), [])
  const toggleTerminal = useCallback(() => setTerminalOpen((p) => !p), [])

  const allFiles = useMemo(() => {
    const result: FileNode[] = []
    function walk(nodes: FileNode[]) {
      for (const n of nodes) {
        if (n.type === 'file') result.push(n)
        if (n.children) walk(n.children)
      }
    }
    if (vfsRoot.children) walk(vfsRoot.children)
    return result
  }, [vfsRoot])

  const recentFiles = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('indranext-recent-files') || '[]') as { id: string; name: string; time: number }[]
      return stored.filter(s => flat.has(s.id)).slice(0, 5).map(s => ({ id: s.id, name: s.name }))
    } catch { return [] }
  }, [flat, activeFileId])

  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  const commands: Command[] = useMemo(() => [
    { id: 'back', label: 'Go to Dashboard', description: 'Back to project list', category: 'Navigate', action: handleBackToDashboard },
    { id: 'toggle-preview', label: 'Toggle Preview Panel', category: 'View', action: handleTogglePreview },
    { id: 'run-preview', label: 'Run Preview', category: 'View', action: handleRun },
    { id: 'toggle-sidebar', label: 'Toggle Sidebar', category: 'View', action: toggleSidebar },
    { id: 'toggle-terminal', label: 'Toggle Terminal', category: 'View', action: toggleTerminal },
    { id: 'zen-mode', label: 'Toggle Zen Mode', category: 'View', action: toggleZenMode },
    { id: 'theme-dark', label: 'Theme: Dark', category: 'Preferences', action: () => setMode('dark') },
    { id: 'theme-light', label: 'Theme: Light', category: 'Preferences', action: () => setMode('light') },
    { id: 'theme-auto', label: 'Theme: Auto', category: 'Preferences', action: () => setMode('auto') },
  ], [handleBackToDashboard, handleTogglePreview, handleRun, toggleSidebar, toggleTerminal, toggleZenMode, setMode])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isIDERef.current) return
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault(); setPaletteMode('commands'); setPaletteOpen(true); return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault(); setPaletteMode('files'); setPaletteOpen(true); return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '`') {
        e.preventDefault(); toggleTerminal(); return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const handleZ = (ev: KeyboardEvent) => {
          if (ev.key === 'z') { toggleZenMode(); window.removeEventListener('keyup', handleZ) }
          else window.removeEventListener('keyup', handleZ)
        }
        window.addEventListener('keyup', handleZ)
        return
      }
      if (e.key === 'Escape' && paletteOpenRef.current) setPaletteOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleTerminal, toggleZenMode])

  if (screen === 'loading') return <LoadingScreen />
  if (screen === 'login') {
    return (
      <LoginPage
        onSignIn={signIn}
        onSignUp={signUp}
        error={authError}
        message={authMessage}
        setError={setAuthError}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
      />
    )
  }
  if (screen === 'dashboard') {
    return (
      <Dashboard
        projects={projects}
        loading={projectsLoading}
        error={projectsError}
        onCreateProject={handleNewProjectThenOpen}
        onDeleteProject={deleteProject}
        onOpenProject={handleOpenProject}
        onSignOut={handleSignOut}
        userName={user?.user_metadata?.name ?? user?.email}
      />
    )
  }

  const bottomOpen = terminalOpen || problemsOpen

  return (
    <div className={'flex h-screen flex-col overflow-hidden' + (zenMode ? '' : '')}
         style={{ backgroundColor: 'var(--bg-app)' }}>
      {syncing && (
        <div className="absolute right-3 top-1 z-50 flex items-center gap-1.5 rounded px-2 py-0.5 text-xs text-white/60"
             style={{ backgroundColor: 'var(--bg-sidebar)' }}>
          <svg className="animate-spin" width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8 8 0 110 16A8 8 0 018 0zm0 2a6 6 0 100 12A6 6 0 008 2z" opacity="0.3" />
            <path d="M8 0a8 8 0 018 8h-2a6 6 0 00-6-6V0z" />
          </svg>
          Syncing
        </div>
      )}

      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} items={contextMenu.items} onClose={closeContextMenu} />}

      {!zenMode && <HamburgerButton isOpen={sidebarOpen} onClick={toggleSidebar} />}

      <div className={'flex flex-1 overflow-hidden' + (zenMode ? '' : '')}>
        {!zenMode && <ActivityBar activeView={sidebarView} onViewChange={handleViewChange} />}

        {!zenMode && (
          <Sidebar
            root={vfsRoot}
            activeFileId={activeFileId}
            onFileClick={handleFileClick}
            onCreateItem={handleCreateItem}
            onRename={renameItem}
            onDelete={deleteItem}
            isOpen={sidebarOpen}
            view={sidebarView}
            renamingId={renamingId}
            onStartRename={setRenamingId}
            themeMode={themeMode}
            onThemeChange={setMode}
            settings={settings}
            onSettingsChange={updateSettings}
            onContextMenu={(e, fileId) => {
              e.preventDefault()
              const node = flat.get(fileId)
              const items: ContextMenuItem[] = [
                { id: 'open', label: 'Open', action: () => openFile(fileId) },
                ...(node?.type === 'file' ? [{ id: 'split', label: 'Split Right', action: () => handleSplitEditor(fileId) }] : []),
                { id: 'rename', label: 'Rename', action: () => setRenamingId(fileId) },
                { id: 'delete', label: 'Delete', action: () => deleteItem(fileId) },
                { id: 'div1', label: '', divider: true, action: () => {} },
                { id: 'new-file', label: 'New File', action: () => handleCreateItem(fileId, 'file', 'new-file.ts') },
                { id: 'new-folder', label: 'New Folder', action: () => handleCreateItem(fileId, 'folder', 'new-folder') },
              ]
              setContextMenu({ x: e.clientX, y: e.clientY, items })
            }}
          />
        )}

        {!zenMode && isMobile && sidebarOpen && (
          <div className="fixed inset-0 z-30 backdrop-blur" style={{ backgroundColor: 'var(--bg-overlay)' }} onClick={closeSidebar} />
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          {openFiles.length > 0 && !isMobile && !zenMode && (
            <TabBar
              tabs={openFiles}
              onSelect={handleSelectTab}
              onClose={handleCloseTab}
              onRun={handleRun}
              isPreviewOpen={previewOpen}
              onTogglePreview={handleTogglePreview}
              onReorder={reorderTabs}
            />
          )}

          {activeFileId && !zenMode && (
            <Breadcrumbs root={vfsRoot} activeFileId={activeFileId} onNavigate={handleFileClick} />
          )}

          <div className="flex flex-1 overflow-hidden">
            <EditorArea
              activeTab={activeTab}
              content={activeTab ? flat.get(activeTab.id)?.content ?? '' : ''}
              onChange={handleEditorChange}
              isDark={isDark}
              recentFiles={recentFiles}
              onFileSelect={handleFileClick}
              onCreateFile={handlePaletteCreateFile}
            />

            {!zenMode && splitFileId && (
              <div className="flex relative border-l" style={{ borderColor: 'var(--border)', width: '50%', minWidth: '200px' }}>
                <div className="absolute top-1 right-1 z-10 flex gap-1">
                  <button onClick={handleCloseSplit}
                    className="size-5 flex items-center justify-center rounded text-[10px] hover:bg-[var(--bg-hover)] transition-colors"
                    style={{ color: 'var(--text-dim)' }}
                    title="Close Split">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                      <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </button>
                </div>
                <EditorArea
                  activeTab={openFiles.find((t) => t.id === splitFileId)}
                  content={flat.get(splitFileId)?.content ?? ''}
                  onChange={(value) => { if (value !== undefined) updateContent(splitFileId, value) }}
                  isDark={isDark}
                  recentFiles={recentFiles}
                  onFileSelect={handleFileClick}
                  onCreateFile={handlePaletteCreateFile}
                />
              </div>
            )}

            {!zenMode && previewOpen && !isMobile && !splitFileId && (
              <div className="w-1/2 min-w-[320px] border-l" style={{ borderColor: 'var(--border)' }}>
                <LivePreview
                  content={previewContent}
                  autoRefresh={autoRefresh}
                  fileName={activeTab?.name}
                  onClose={handleClosePreview}
                  onToggleAutoRefresh={handleToggleAutoRefresh}
                  onRun={handlePreviewManualRun}
                />
              </div>
            )}
          </div>

          {!zenMode && bottomOpen && (
            <div className="flex flex-col shrink-0 animate-slide-up"
                 style={{ maxHeight: `${terminalHeight + 30}px` }}>
              <div className="flex items-center border-t border-b h-[30px] shrink-0 px-2 text-xs"
                   style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
                <button onClick={() => setBottomPanelTab('terminal')}
                  className="flex items-center gap-1.5 px-3 h-full transition-colors"
                  style={{
                    color: bottomPanelTab === 'terminal' ? 'var(--text-primary)' : 'var(--text-dim)',
                    borderBottom: bottomPanelTab === 'terminal' ? '2px solid var(--accent)' : '2px solid transparent',
                  }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 2v12h4V2H2zm1 1h2v3H3V3zm0 4h2v7H3V7zm5-5v12h4V2H8zm1 1h2v7H9V3zm0 8h2v3H9v-3zm5-5v9h4V6h-4zm1 1h2v7h-2V7zm0 8h2v2h-2v-2z" />
                  </svg>
                  TERMINAL
                </button>
                <button onClick={() => setBottomPanelTab('problems')}
                  className="flex items-center gap-1.5 px-3 h-full transition-colors"
                  style={{
                    color: bottomPanelTab === 'problems' ? 'var(--text-primary)' : 'var(--text-dim)',
                    borderBottom: bottomPanelTab === 'problems' ? '2px solid var(--accent)' : '2px solid transparent',
                  }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1L1 14h14L8 1zm0 3.5h1v4.5H8V4.5zm0 6h1v1.5H8V10.5z" />
                  </svg>
                  PROBLEMS
                </button>
                <div className="flex-1" />
                <button onClick={() => { setTerminalOpen(false); setProblemsOpen(false) }}
                  className="size-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
                  style={{ color: 'var(--text-dim)' }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {bottomPanelTab === 'terminal' && (
                  <TerminalPanel visible={true} height={terminalHeight} onResize={setTerminalHeight} />
                )}
                {bottomPanelTab === 'problems' && (
                  <ProblemsPanel visible={true} />
                )}
              </div>
            </div>
          )}
        </div>

        {!zenMode && openFiles.length > 0 && isMobile && (
          <TabBar
            tabs={openFiles}
            onSelect={handleSelectTab}
            onClose={handleCloseTab}
            onRun={handleRun}
            isPreviewOpen={previewOpen}
            onTogglePreview={handleTogglePreview}
            onReorder={reorderTabs}
          />
        )}
      </div>

      {!zenMode && previewOpen && isMobile && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: 'var(--bg-app)' }}>
          <LivePreview
            content={previewContent}
            autoRefresh={autoRefresh}
            fileName={activeTab?.name}
            onClose={handleClosePreview}
            onToggleAutoRefresh={handleToggleAutoRefresh}
            onRun={handlePreviewManualRun}
          />
        </div>
      )}

      {!zenMode && (
        <StatusBar
          tabName={activeTab?.name}
          language={activeTab ? getLanguage(activeTab.name) : undefined}
          themeMode={themeMode}
          onThemeToggle={toggleTheme}
        >
          <button onClick={handleBackToDashboard}
            className="flex items-center gap-1 text-white/70 hover:text-white transition-colors">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 1h5v5H2V1zm7 0h5v5H9V1zM2 8h5v5H2V8zm7 0h5v5H9V8z" />
            </svg>
            Projects
          </button>
          <button onClick={toggleTerminal} className="flex items-center gap-1 text-white/70 hover:text-white transition-colors ml-2">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2v12h4V2H2zm1 1h2v3H3V3zm0 4h2v7H3V7zm5-5v12h4V2H8zm1 1h2v7H9V3zm0 8h2v3H9v-3zm5-5v9h4V6h-4zm1 1h2v7h-2V7zm0 8h2v2h-2v-2z" />
            </svg>
            Terminal
          </button>
        </StatusBar>
      )}

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        mode={paletteMode}
        files={allFiles}
        commands={commands}
        activeFileId={activeFileId}
        onFileClick={handleFileClick}
        onCreateFile={handlePaletteCreateFile}
      />
    </div>
  )
}

export default App
