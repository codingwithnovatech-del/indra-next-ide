import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useFileSystem } from './hooks/useFileSystem'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { useCloudProjects } from './hooks/useCloudProjects'
import { useCloudSync } from './hooks/useCloudSync'
import { bundleForPreview } from './data/previewBundler'
import HamburgerButton from './components/HamburgerButton'
import Sidebar from './components/Sidebar'
import TabBar from './components/TabBar'
import EditorArea from './components/EditorArea'
import LivePreview from './components/LivePreview'
import CommandPalette from './components/CommandPalette'
import type { Command } from './components/CommandPalette'
import StatusBar from './components/StatusBar'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import LoadingScreen from './components/LoadingScreen'
import type { FileNode } from './types'

type Screen = 'loading' | 'login' | 'dashboard' | 'ide'

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
  const { session, user, loading: authLoading, error: authError, signUp, signIn, signOut, setError: setAuthError } = useAuth()
  const { mode: themeMode, toggleTheme, setMode } = useTheme()

  const [screen, setScreen] = useState<Screen>('loading')
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) { setScreen('loading'); return }
    if (!session) { setScreen('login'); return }
    setScreen('dashboard')
  }, [authLoading, session])

  const { projects, loading: projectsLoading, createProject, deleteProject } = useCloudProjects(user)
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
  } = useFileSystem(currentProjectId ?? 'default')

  const cloudLoaded = useRef(false)
  useEffect(() => {
    if (!isIDE || !currentProjectId || cloudLoaded.current) return
    cloudLoaded.current = true
    loadSnapshot(currentProjectId).then((snapshot) => {
      if (snapshot && snapshot.children) {
        const openIds: string[] = []
        replaceRoot(snapshot, openIds, null)
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
  const isMobile = useMediaQuery('(max-width: 767px)')

  const activeTab = openFiles.find((t) => t.isActive)

  const computePreview = useCallback(() => bundleForPreview(activeFileId, flat), [activeFileId, flat])

  const previewContent = useMemo(() => {
    if (!previewOpen) return ''
    if (autoRefresh) return computePreview()
    return manualPreviewContent
  }, [previewOpen, autoRefresh, computePreview, manualPreviewContent])

  const handleRun = useCallback(() => {
    setManualPreviewContent(computePreview())
    setPreviewOpen(true)
  }, [computePreview])

  const handleTogglePreview = useCallback(() => {
    setPreviewOpen((prev) => {
      if (!prev) setManualPreviewContent(computePreview())
      return !prev
    })
  }, [computePreview])

  const handleSelectTab = useCallback((id: string) => openFile(id), [openFile])
  const handleCloseTab = useCallback((id: string) => closeFile(id), [closeFile])
  const toggleSidebar = useCallback(() => setSidebarOpen((p) => !p), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

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

  const commands: Command[] = useMemo(() => [
    { id: 'back', label: 'Go to Dashboard', description: 'Back to project list', category: 'Navigate', action: handleBackToDashboard },
    { id: 'toggle-preview', label: 'Toggle Preview Panel', category: 'View', action: handleTogglePreview },
    { id: 'run-preview', label: 'Run Preview', category: 'View', action: handleRun },
    { id: 'toggle-sidebar', label: 'Toggle Sidebar', category: 'View', action: toggleSidebar },
    { id: 'theme-dark', label: 'Theme: Dark', category: 'Preferences', action: () => setMode('dark') },
    { id: 'theme-light', label: 'Theme: Light', category: 'Preferences', action: () => setMode('light') },
    { id: 'theme-auto', label: 'Theme: Auto', category: 'Preferences', action: () => setMode('auto') },
  ], [handleBackToDashboard, handleTogglePreview, handleRun, toggleSidebar, setMode])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isIDE) return
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault(); setPaletteMode('commands'); setPaletteOpen(true); return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault(); setPaletteMode('files'); setPaletteOpen(true); return
      }
      if (e.key === 'Escape' && paletteOpen) setPaletteOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [paletteOpen, isIDE])

  if (screen === 'loading') return <LoadingScreen />
  if (screen === 'login') {
    return (
      <LoginPage
        onSignIn={signIn}
        onSignUp={signUp}
        error={authError}
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
        onCreateProject={handleNewProjectThenOpen}
        onDeleteProject={deleteProject}
        onOpenProject={handleOpenProject}
        onSignOut={handleSignOut}
        userName={user?.user_metadata?.name ?? user?.email}
      />
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
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

      <HamburgerButton isOpen={sidebarOpen} onClick={toggleSidebar} />

      {openFiles.length > 0 && (
        <TabBar
          tabs={openFiles}
          onSelect={handleSelectTab}
          onClose={handleCloseTab}
          onRun={handleRun}
          isPreviewOpen={previewOpen}
          onTogglePreview={handleTogglePreview}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          root={vfsRoot}
          activeFileId={activeFileId}
          onFileClick={handleFileClick}
          onCreateItem={handleCreateItem}
          onRename={renameItem}
          onDelete={deleteItem}
          isOpen={sidebarOpen}
        />

        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 z-30" style={{ backgroundColor: 'var(--bg-overlay)' }} onClick={closeSidebar} />
        )}

        <div className="flex flex-1 overflow-hidden">
          <EditorArea
            activeTab={activeTab}
            content={activeTab ? flat.get(activeTab.id)?.content ?? '' : ''}
            onChange={handleEditorChange}
          />

          {previewOpen && !isMobile && (
            <div className="w-1/2 min-w-[320px] border-l" style={{ borderColor: 'var(--border)' }}>
              <LivePreview
                content={previewContent}
                autoRefresh={autoRefresh}
                fileName={activeTab?.name}
                onClose={() => setPreviewOpen(false)}
                onToggleAutoRefresh={() => setAutoRefresh((p) => !p)}
                onRun={() => setManualPreviewContent(computePreview())}
              />
            </div>
          )}
        </div>
      </div>

      {previewOpen && isMobile && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: 'var(--bg-app)' }}>
          <LivePreview
            content={previewContent}
            autoRefresh={autoRefresh}
            fileName={activeTab?.name}
            onClose={() => setPreviewOpen(false)}
            onToggleAutoRefresh={() => setAutoRefresh((p) => !p)}
            onRun={() => setManualPreviewContent(computePreview())}
          />
        </div>
      )}

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
      </StatusBar>

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        mode={paletteMode}
        files={allFiles}
        commands={commands}
        activeFileId={activeFileId}
        onFileClick={handleFileClick}
        onCreateFile={(name) => {
          const id = createItem(vfsRoot.id, 'file', name)
          openFile(id)
        }}
      />
    </div>
  )
}

export default App
