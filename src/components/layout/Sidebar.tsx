import { useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  ClipboardPlus,
  Info,
  LogOut,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react'
import { GearSightLogo } from '@/components/brand/GearSightLogo'
import { useAuth } from '@/context/AuthContext'

const navLinks = [
  { to: '/', label: 'Live Feed', icon: Video, end: true },
  { to: '/toolbox', label: 'Toolbox', icon: ClipboardPlus },
  { to: '/records', label: 'Records', icon: ClipboardList },
  { to: '/about', label: 'About us', icon: Info },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
  onShowTutorial: () => void
}

const shellClass = 'flex flex-col overflow-y-auto bg-sidebar text-white'

export function Sidebar({ open, onClose, onShowTutorial }: SidebarProps) {
  const location = useLocation()

  useEffect(() => {
    onClose()
  }, [location.pathname, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
      {/* Desktop: always visible, width scales down with the viewport */}
      <aside
        className={`@container/nav sticky top-0 hidden h-full w-[clamp(13.5rem,16vw,17.5rem)] shrink-0 lg:flex ${shellClass}`}
      >
        <div className="border-b border-white/25 px-[clamp(0.75rem,1.2vw,1.25rem)] py-[clamp(1rem,1.5vw,1.5rem)]">
          <GearSightLogo
            variant="onDark"
            className="w-full min-w-0 [&>span]:text-xl xl:[&>span]:text-2xl [&>svg]:h-8 xl:[&>svg]:h-10"
          />
        </div>
        <SidebarNav onShowTutorial={onShowTutorial} />
      </aside>

      {/* Phone / tablet drawer only (< lg) */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <button
          type="button"
          aria-label="Close menu overlay"
          className={`absolute inset-0 bg-black/50 transition-opacity ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[min(280px,88vw)] shadow-2xl transition-transform duration-200 ${shellClass} ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-start justify-between gap-3 border-b border-white/25 px-5 py-6">
            <GearSightLogo
              variant="onDark"
              className="min-w-0 [&>span]:text-2xl [&>svg]:h-9"
            />
            <button
              type="button"
              onClick={onClose}
              className="px-2 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <SidebarNav onShowTutorial={onShowTutorial} />
        </aside>
      </div>
    </>
  )
}

function SidebarNav({ onShowTutorial }: { onShowTutorial: () => void }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <>
      <nav className="flex flex-1 flex-col gap-0.5 pt-[clamp(1rem,1.6vw,1.5rem)]">
        {navLinks.map((link) => (
          <SideLink key={link.to} {...link} />
        ))}

        <button
          type="button"
          onClick={onShowTutorial}
          className="mt-4 w-full border border-white/20 bg-white px-[clamp(0.75rem,1.2vw,1.25rem)] py-2.5 text-xs font-bold uppercase tracking-wider text-accent transition hover:bg-[#fff7ed] sm:py-3 sm:text-sm"
        >
          Show Tutorial
        </button>
      </nav>

      <button
        type="button"
        onClick={() => {
          logout()
          navigate('/login')
        }}
        className="mt-4 flex items-center gap-2 px-[clamp(0.75rem,1.2vw,1.25rem)] py-1 text-xs font-medium text-white/75 transition hover:text-white sm:mt-6 sm:pb-6 sm:text-sm"
      >
        <LogOut className="h-[1.1em] w-[1.1em]" />
        Log Out
      </button>
    </>
  )
}

function SideLink({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-[clamp(0.75rem,1.2vw,1.25rem)] py-2.5 text-sm font-medium transition sm:text-base ${
          isActive
            ? 'bg-accent/15 text-accent'
            : 'text-white/90 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <Icon className="h-[1.15em] w-[1.15em] shrink-0" strokeWidth={2} />
      <span className="truncate">{label}</span>
    </NavLink>
  )
}
