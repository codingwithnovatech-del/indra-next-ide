import { memo, type ReactNode } from 'react'

function HelpPanel() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
      <div className="px-3 h-[30px] flex items-center text-[11px] font-semibold uppercase tracking-wider select-none"
           style={{ color: 'var(--text-muted)' }}>
        Help & About
      </div>

      <div className="p-3 space-y-4 text-sm">
        <Section title="About">
          <div className="space-y-2 text-xs" style={{ color: 'var(--text-primary)' }}>
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
              <div className="size-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(0,122,204,0.15)' }}>
                <svg width="22" height="22" viewBox="0 0 16 16" fill="#007acc">
                  <path d="M9.5 3.5L7 8l2.5 4.5H11L8.5 8 11 3.5H9.5zM5 3.5L2.5 8 5 12.5H6.5L4 8l2.5-4.5H5z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">IndraNext IDE</p>
                <p style={{ color: 'var(--text-dim)' }}>Version 1.0.0</p>
              </div>
            </div>
            <p><span className="font-medium">Developer:</span> Ayush Kumar</p>
            <p><span className="font-medium">Company:</span> IndraNext Technologies</p>
          </div>
        </Section>

        <Section title="Links">
          <div className="space-y-2">
            <LinkButton url="https://indranextechnologies.in/" icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            } label="Website" />
            <LinkButton url="mailto:info@indranextechnologies.in" icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M.05 3.555A2 2 0 012 2h12a2 2 0 011.95 1.555L8 8.414.05 3.555zM0 4.697v7.104l5.803-3.558L0 4.697zM6.761 8.83l-6.57 4.027A2 2 0 002 14h12a2 2 0 001.808-1.144l-6.57-4.027L8 9.586l-1.239-.757zm3.436-.586L16 11.801V4.697l-5.803 3.546z" />
              </svg>
            } label="info@indranextechnologies.in" />
            <LinkButton url="https://wa.me/917870373226" icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 00-6.95 11.93l-1.04 3.07 3.07-1.04A8 8 0 108 0zm4.4 11.68a.6.6 0 01-.44.82c-.37.07-1.17.38-2.3-.37a8.36 8.36 0 01-2.88-2.88c-.75-1.13-.44-1.93-.37-2.3a.6.6 0 01.82-.44c.18.08.35.17.5.28.47.36 1.17 1.17 1.31 1.5.4.94-.94 2.23-1.5 2.23-.56 0-.56-.56-.56-.56s.84-1.68.94-2.06c.1-.38-.94-1.5-.94-1.5l-1.5-2.44s-.38-.56-.94-.56c-.56 0-1.13.38-1.13.38s-1.13 1.13-.56 2.44c.18.38 1.5 2.82 3.57 4.78 2.07 1.96 4.1 2.72 4.78 2.9 1.31.47 2.44-.56 2.44-.56s.38-.57.38-1.13-.56-.94-.56-.94z" />
              </svg>
            } label="+91 7870373226" />
          </div>
        </Section>

        <Section title="Help Topics">
          <div className="space-y-1 text-xs">
            {[
              { title: 'Getting Started', desc: 'Learn the basics of IndraNext IDE', icon: 'M8 1L1 5v6l7 4 7-4V5L8 1z' },
              { title: 'Keyboard Shortcuts', desc: 'All available keyboard shortcuts', icon: 'M4 2h8v2H4V2zm0 4h8v2H4V6zm0 4h8v2H4v-2z' },
              { title: 'File Management', desc: 'Create, edit, rename, delete files', icon: 'M2 1h5v5H2V1zm7 0h5v5H9V1zM2 8h5v5H2V8zm7 0h5v5H9V8z' },
              { title: 'Git Integration', desc: 'Stage, commit, and manage changes', icon: 'M9.5 3.5L7 8l2.5 4.5H11L8.5 8 11 3.5H9.5zM5 3.5L2.5 8 5 12.5H6.5L4 8l2.5-4.5H5z' },
              { title: 'AI Chat', desc: 'Use AI assistant for coding help', icon: 'M8 1a3 3 0 100 6 3 3 0 000-6zM2 13c0 2 2.5 3 6 3s6-1 6-3c0-2-2.5-3-6-3s-6 1-6 3z' },
              { title: 'Snippets', desc: 'Create and use code snippets', icon: 'M1 2.5A1.5 1.5 0 012.5 1h3.207a1.5 1.5 0 011.06.44l3.754 3.753a1.5 1.5 0 01.44 1.06V13.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 13.5V2.5z' },
            ].map(topic => (
              <div key={topic.title} className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)] cursor-pointer">
                <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--bg-input)' }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="#007acc">
                    <path d={topic.icon} />
                  </svg>
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{topic.title}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{topic.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Contact Support">
          <div className="space-y-2">
            <a href="mailto:info@indranextechnologies.in"
              className="flex items-center justify-center gap-2 h-[36px] rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M.05 3.555A2 2 0 012 2h12a2 2 0 011.95 1.555L8 8.414.05 3.555zM0 4.697v7.104l5.803-3.558L0 4.697zM6.761 8.83l-6.57 4.027A2 2 0 002 14h12a2 2 0 001.808-1.144l-6.57-4.027L8 9.586l-1.239-.757zm3.436-.586L16 11.801V4.697l-5.803 3.546z" />
              </svg>
              Email Support
            </a>
            <a href="https://wa.me/917870373226"
              className="flex items-center justify-center gap-2 h-[36px] rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 00-6.95 11.93l-1.04 3.07 3.07-1.04A8 8 0 108 0zm4.4 11.68a.6.6 0 01-.44.82c-.37.07-1.17.38-2.3-.37a8.36 8.36 0 01-2.88-2.88c-.75-1.13-.44-1.93-.37-2.3a.6.6 0 01.82-.44c.18.08.35.17.5.28.47.36 1.17 1.17 1.31 1.5.4.94-.94 2.23-1.5 2.23-.56 0-.56-.56-.56-.56s.84-1.68.94-2.06c.1-.38-.94-1.5-.94-1.5l-1.5-2.44s-.38-.56-.94-.56c-.56 0-1.13.38-1.13.38s-1.13 1.13-.56 2.44c.18.38 1.5 2.82 3.57 4.78 2.07 1.96 4.1 2.72 4.78 2.9 1.31.47 2.44-.56 2.44-.56s.38-.57.38-1.13-.56-.94-.56-.94z" />
              </svg>
              WhatsApp Chat
            </a>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
        {title}
      </h4>
      {children}
    </div>
  )
}

function LinkButton({ url, icon, label }: { url: string; icon: ReactNode; label: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 p-2.5 rounded-lg text-xs transition-colors hover:bg-[var(--bg-hover)]"
      style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-input)' }}>
      <span className="shrink-0" style={{ color: 'var(--accent)' }}>{icon}</span>
      <span className="truncate">{label}</span>
      <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="ml-auto shrink-0" style={{ color: 'var(--text-dim)' }}>
        <path d="M5.5 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    </a>
  )
}

export default memo(HelpPanel)
