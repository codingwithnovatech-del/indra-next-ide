export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-app)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 animate-spin"
             style={{ borderColor: 'var(--text-dim)', borderTopColor: 'var(--accent)' }} />
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Loading...</p>
      </div>
    </div>
  )
}
