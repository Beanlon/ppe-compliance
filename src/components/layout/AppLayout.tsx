import { useCallback, useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { GearSightLogo } from '@/components/brand/GearSightLogo'
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay'
import { useAuth } from '@/context/AuthContext'

export function AppLayout() {
  const { isAuthenticated } = useAuth()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const openTutorial = useCallback(() => {
    setMenuOpen(false)
    setTutorialOpen(true)
  }, [])
  const closeTutorial = useCallback(() => setTutorialOpen(false), [])

  const isAbout = pathname.startsWith('/about')

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-surface">
      {/* Collapsible menu only for phones / tablets (< lg) */}
      <header className="sticky top-0 z-40 flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="rounded-lg p-2 text-ink transition hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <GearSightLogo
          variant="onLight"
          className="min-w-0 [&>span]:text-xl [&>svg]:h-8"
        />
      </header>

      <div className="flex min-h-0 flex-1">
        <Sidebar
          open={menuOpen}
          onClose={closeMenu}
          onShowTutorial={openTutorial}
        />
        <main
          className={
            isAbout
              ? 'min-h-0 min-w-0 flex-1 overflow-y-auto bg-white px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5 xl:px-8 xl:py-6 2xl:px-10 2xl:py-8'
              : 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white'
          }
        >
          <Outlet />
        </main>
      </div>
      <Footer />

      <TutorialOverlay open={tutorialOpen} onClose={closeTutorial} />
    </div>
  )
}
