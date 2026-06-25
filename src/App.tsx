import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useFileSystem } from './hooks/useFileSystem'
import { useFileSystemAccess } from './hooks/useFileSystemAccess'
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
import ContextMenu from './components/ContextMenu'
import type { ContextMenuItem } from './components/ContextMenu'
import TerminalPanel from './components/TerminalPanel'
import ProblemsPanel from './components/ProblemsPanel'
import type { FileNode } from './types'
import GuidePage from './components/GuidePage'
import MobileBottomNav from './components/MobileBottomNav'
import NotificationToast, { showToast } from './components/NotificationToast'
import TurnstileChallenge from './components/TurnstileChallenge'

type Screen = 'loading' | 'login' | 'dashboard' | 'ide' | 'guide'

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
  const { session, user, error: authError, message: authMessage, signUp, signIn, signInWithOAuth, signOut, setError: setAuthError } = useAuth()
  const { mode: themeMode, toggleTheme, setMode, isDark } = useTheme()
  const { settings, updateSettings } = useSettings()
  const fsa = useFileSystemAccess()
  const idToPathRef = useRef<Map<string, string>>(new Map())

  const [screen, setScreen] = useState<Screen>('ide')
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

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
    if (!session) { setShowLoginModal(true); return }
    setCurrentProjectId(null)
    setScreen('dashboard')
  }, [session])

  const handleSignOut = useCallback(async () => {
    await signOut()
    setCurrentProjectId(null)
    setScreen('ide')
  }, [signOut])

  const handleOpenGuide = useCallback(() => setScreen('guide'), [])
  const handleCloseGuide = useCallback(() => setScreen('ide'), [])

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
    saveFile,
    isDirty: isFileDirty,
  } = useFileSystem(currentProjectId ?? 'default')

  const handleSave = useCallback(async () => {
    if (!activeFileId) return
    const node = flat.get(activeFileId)
    if (node && node.path && fsa.isActive && fsa.writeFile) {
      try {
        await fsa.writeFile(node.path, node.content || '')
        saveFile(activeFileId)
        showToast('Saved to disk', 'success')
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to save file', 'error')
      }
      return
    }
    saveFile(activeFileId)
  }, [activeFileId, saveFile, flat, fsa])

  const handleOpenFolder = useCallback(async () => {
    try {
      const result = await fsa.openFolder()
      if (result) {
        idToPathRef.current = result.idToPath
        replaceRoot(result.root, [], null)
        showToast(`Opened folder: ${fsa.folderName || 'Unknown'}`, 'success')
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to open folder', 'error')
    }
  }, [fsa, replaceRoot])

  const handleCloseFolder = useCallback(() => {
    fsa.closeFolder()
    idToPathRef.current = new Map()
    const emptyRoot: FileNode = { id: '__root__', name: 'workspace', type: 'folder', children: [] }
    replaceRoot(emptyRoot, [], null)
    showToast('Folder closed', 'info')
  }, [fsa, replaceRoot])

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
  const [cursor, setCursor] = useState<{ line: number; col: number; tabSize: number }>({ line: 1, col: 1, tabSize: 2 })
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0)
  const [turnstilePassed, setTurnstilePassed] = useState(() => sessionStorage.getItem('cf-turnstile') === '1')

  const handleTurnstileSuccess = useCallback(() => {
    sessionStorage.setItem('cf-turnstile', '1')
    setTurnstilePassed(true)
  }, [])

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
  }, [previewOpen, autoRefresh, computePreview, manualPreviewContent, previewRefreshKey])

  const handleSplitEditor = useCallback((fileId: string) => {
    setSplitFileId((prev) => prev === fileId ? null : fileId)
  }, [])

  const handleCloseSplit = useCallback(() => {
    setSplitFileId(null)
  }, [])

  const handleRun = useCallback(() => {
    setManualPreviewContent(computePreview())
    setPreviewOpen(true)
    setPreviewRefreshKey(prev => prev + 1)
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
  const handleCloseTab = useCallback((id: string) => {
    if (isFileDirty(id)) {
      const result = window.confirm(`"${flat.get(id)?.name ?? id}" has unsaved changes. Do you want to close without saving?`)
      if (!result) return
    }
    closeFile(id)
  }, [closeFile, isFileDirty, flat])
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
    (parentId: string, type: 'file' | 'folder', name: string) => {
      const id = createItem(parentId, type, name)
      if (fsa.isActive && id) {
        const parentPath = idToPathRef.current.get(parentId) || ''
        const relativePath = parentPath ? `${parentPath}/${name}` : name
        idToPathRef.current.set(id, relativePath)
        if (type === 'file') {
          fsa.createFile(relativePath).catch((err: Error) => showToast(err.message, 'error'))
        } else {
          fsa.createDirectory(relativePath).catch((err: Error) => showToast(err.message, 'error'))
        }
      }
      return id
    },
    [createItem, fsa],
  )

  const handlePaletteCreateFile = useCallback((name: string) => {
    const id = createItem(vfsRoot.id, 'file', name)
    if (id) openFile(id)
  }, [createItem, openFile, vfsRoot.id])

  const handleDeleteItem = useCallback((id: string) => {
    if (fsa.isActive) {
      const path = idToPathRef.current.get(id)
      if (path) {
        fsa.deleteEntry(path).catch((err: Error) => showToast(err.message, 'error'))
      }
    }
    deleteItem(id)
  }, [deleteItem, fsa])

  const handleRenameItem = useCallback((id: string, name: string) => {
    if (fsa.isActive) {
      const oldPath = idToPathRef.current.get(id)
      if (oldPath) {
        const parts = oldPath.split('/')
        parts[parts.length - 1] = name
        const newPath = parts.join('/')
        idToPathRef.current.set(id, newPath)
        fsa.renameEntry(oldPath, newPath).catch((err: Error) => showToast(err.message, 'error'))
      }
    }
    renameItem(id, name)
  }, [renameItem, fsa])

  const handleClosePreview = useCallback(() => setPreviewOpen(false), [])
  const handleToggleAutoRefresh = useCallback(() => setAutoRefresh((p) => !p), [])
  const handlePreviewManualRun = useCallback(() => setManualPreviewContent(computePreview()), [computePreview])

  const toggleZenMode = useCallback(() => setZenMode((p) => !p), [])
  const toggleTerminal = useCallback(() => setTerminalOpen((p) => !p), [])

  const handleMonacoCommand = useCallback((cmd: string) => {
    if (cmd === 'palette') { setPaletteMode('commands'); setPaletteOpen(true); return }
    if (cmd === 'quickOpen') { setPaletteMode('files'); setPaletteOpen(true); return }
    if (cmd === 'terminal') { toggleTerminal(); return }
    if (cmd === 'sidebar') { toggleSidebar(); return }
  }, [toggleTerminal, toggleSidebar])

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
    { id: 'guide', label: 'How to Use IndraNext IDE', description: 'Getting started guide', category: 'Help', action: handleOpenGuide },
    { id: 'toggle-preview', label: 'Toggle Preview Panel', category: 'View', action: handleTogglePreview },
    { id: 'run-preview', label: 'Run Preview', category: 'View', action: handleRun },
    { id: 'toggle-sidebar', label: 'Toggle Sidebar', category: 'View', action: toggleSidebar },
    { id: 'toggle-terminal', label: 'Toggle Terminal', category: 'View', action: toggleTerminal },
    { id: 'zen-mode', label: 'Toggle Zen Mode', category: 'View', action: toggleZenMode },
    { id: 'theme-dark', label: 'Theme: Dark', category: 'Preferences', action: () => setMode('dark') },
    { id: 'theme-light', label: 'Theme: Light', category: 'Preferences', action: () => setMode('light') },
    { id: 'theme-auto', label: 'Theme: Auto', category: 'Preferences', action: () => setMode('auto') },
    { id: 'save', label: 'Save File', description: 'Save current file (Ctrl+S)', category: 'File', action: handleSave },
  ], [handleBackToDashboard, handleOpenGuide, handleTogglePreview, handleRun, toggleSidebar, toggleTerminal, toggleZenMode, setMode, handleSave])

  const handleSaveRef = useRef(handleSave)
  handleSaveRef.current = handleSave

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isIDERef.current) return
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault(); handleSaveRef.current?.(); return
      }
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

  if (!turnstilePassed) {
    return <TurnstileChallenge onSuccess={handleTurnstileSuccess} />
  }

  if (screen === 'login') {
    return (
      <LoginPage
        onSignIn={signIn}
        onSignUp={signUp}
        onSignInWithOAuth={signInWithOAuth}
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

  if (screen === 'guide') {
    return <GuidePage onClose={handleCloseGuide} />
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

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="relative max-w-sm w-full">
            <button onClick={() => setShowLoginModal(false)}
              className="absolute -top-10 right-0 text-sm text-white/70 hover:text-white transition-colors">
              Skip → Continue as Guest
            </button>
            <LoginPage
              onSignIn={(email, pwd, captchaToken) => { signIn(email, pwd, captchaToken); setShowLoginModal(false) }}
              onSignUp={(email, pwd, name, captchaToken) => { signUp(email, pwd, name, captchaToken); setShowLoginModal(false) }}
              onSignInWithOAuth={(provider) => signInWithOAuth(provider)}
              error={authError}
              message={authMessage}
              setError={setAuthError}
              themeMode={themeMode}
              onToggleTheme={toggleTheme}
            />
          </div>
        </div>
      )}

      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} items={contextMenu.items} onClose={closeContextMenu} />}

      {!zenMode && <HamburgerButton isOpen={sidebarOpen} onClick={toggleSidebar} />}

      <div className={'flex flex-1 overflow-hidden' + (zenMode ? '' : '')}>
        {!zenMode && <div className="max-md:hidden"><ActivityBar activeView={sidebarView} onViewChange={handleViewChange} /></div>}

        {!zenMode && (
          <Sidebar
            root={vfsRoot}
            activeFileId={activeFileId}
            onFileClick={handleFileClick}
            onCreateItem={handleCreateItem}
            onRename={handleRenameItem}
            onDelete={handleDeleteItem}
            isOpen={sidebarOpen}
            view={sidebarView}
            renamingId={renamingId}
            onStartRename={setRenamingId}
            themeMode={themeMode}
            onThemeChange={setMode}
            settings={settings}
            onSettingsChange={updateSettings}
            onOpenGuide={handleOpenGuide}
            onOpenFolder={handleOpenFolder}
            onCloseFolder={handleCloseFolder}
            fsSupported={fsa.isSupported}
            fsActive={fsa.isActive}
            folderName={fsa.folderName}
            onContextMenu={(e, fileId) => {
              e.preventDefault()
              const node = flat.get(fileId)
              const items: ContextMenuItem[] = [
                { id: 'open', label: 'Open', action: () => openFile(fileId) },
                ...(node?.type === 'file' ? [{ id: 'split', label: 'Split Right', action: () => handleSplitEditor(fileId) }] : []),
                { id: 'rename', label: 'Rename', action: () => setRenamingId(fileId) },
                { id: 'delete', label: 'Delete', action: () => handleDeleteItem(fileId) },
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
              isMobile={isMobile}
              recentFiles={recentFiles}
              onFileSelect={handleFileClick}
              onCreateFile={handlePaletteCreateFile}
              onCursorChange={(line, col, tabSize) => setCursor({ line, col, tabSize })}
              onSave={handleSave}
              onMonacoCommand={handleMonacoCommand}
              onOpenFolder={handleOpenFolder}
              fsSupported={fsa.isSupported}
              fsActive={fsa.isActive}
              folderName={fsa.folderName}
              recentProjects={fsa.getRecentProjects()}
            />

            {!zenMode && !isMobile && splitFileId && (
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
                  isMobile={isMobile}
                  recentFiles={recentFiles}
                  onFileSelect={handleFileClick}
                  onCreateFile={handlePaletteCreateFile}
                  onCursorChange={(line, col, tabSize) => setCursor({ line, col, tabSize })}
                  onSave={handleSave}
                  onMonacoCommand={handleMonacoCommand}
                  onOpenFolder={handleOpenFolder}
                  fsSupported={fsa.isSupported}
                  fsActive={fsa.isActive}
                  folderName={fsa.folderName}
                  recentProjects={fsa.getRecentProjects()}
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
                  refreshKey={previewRefreshKey}
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
            refreshKey={previewRefreshKey}
          />
        </div>
      )}

      {!zenMode && isMobile && (
        <MobileBottomNav
          activeView={sidebarView}
          onViewChange={handleViewChange}
          onRun={handleRun}
          onToggleTerminal={toggleTerminal}
        />
      )}

      {!zenMode && (
        <StatusBar
          tabName={activeTab?.name}
          language={activeTab ? getLanguage(activeTab.name) : undefined}
          themeMode={themeMode}
          onThemeToggle={toggleTheme}
          line={cursor.line}
          col={cursor.col}
          tabSize={cursor.tabSize}
          isDirty={activeFileId ? isFileDirty(activeFileId) : undefined}
          folderName={fsa.isActive ? fsa.folderName : undefined}
        >
          {session ? (
            <span className="flex items-center gap-1 text-[#4ec9b0] ml-2 text-[10px]">● Cloud Sync</span>
          ) : (
            <span className="flex items-center gap-1 text-[#e0a800] ml-2 text-[10px]">● Guest (Local)</span>
          )}
          {session ? (
            <button onClick={handleBackToDashboard}
              className="flex items-center gap-1 text-white/70 hover:text-white transition-colors ml-2">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 1h5v5H2V1zm7 0h5v5H9V1zM2 8h5v5H2V8zm7 0h5v5H9V8z" />
              </svg>
              Projects
            </button>
          ) : (
            <button onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1 text-white/70 hover:text-white transition-colors ml-2">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a3 3 0 100 6 3 3 0 000-6zM2 13c0 2 2.5 3 6 3s6-1 6-3c0-2-2.5-3-6-3s-6 1-6 3z" />
              </svg>
              Sign In
            </button>
          )}
          <button onClick={toggleTerminal} className="flex items-center gap-1 text-white/70 hover:text-white transition-colors ml-2">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2v12h4V2H2zm1 1h2v3H3V3zm0 4h2v7H3V7zm5-5v12h4V2H8zm1 1h2v7H9V3zm0 8h2v3H9v-3zm5-5v9h4V6h-4zm1 1h2v7h-2V7zm0 8h2v2h-2v-2z" />
            </svg>
            Terminal
          </button>
        </StatusBar>
      )}

      <NotificationToast />

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
