import { memo } from 'react'

interface HamburgerButtonProps {
  isOpen: boolean
  onClick: () => void
}

function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-2 left-2 z-50 flex size-11 items-center justify-center rounded
                 text-[#cccccc] hover:bg-[#2a2d2e] md:hidden transition-colors"
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200">
        {isOpen ? (
          <path d="M18 6L6 18M6 6l12 12" />
        ) : (
          <path d="M3 12h18M3 6h18M3 18h18" />
        )}
      </svg>
    </button>
  )
}

export default memo(HamburgerButton)
