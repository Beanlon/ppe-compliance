import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ClipboardList,
  Info,
  LogOut,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react'
import { GearSightLogo } from '@/components/brand/GearSightLogo'
import { useAuth } from '@/context/AuthContext'

const homeLinks = [
  { to: '/', label: 'Live Feed', icon: Video, end: true },
  { to: '/records', label: 'Records', icon: ClipboardList },
]

const aboutLinks = [{ to: '/about', label: 'About us', icon: Info }]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
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
      <aside className="@container/nav sticky top-0 hidden h-screen w-[clamp(13.5rem,16vw,17.5rem)] shrink-0 flex-col overflow-y-auto bg-sidebar px-[clamp(0.75rem,1.2vw,1.25rem)] py-[clamp(1rem,1.5vw,1.5rem)] text-white lg:flex">
        <div className="mb-[clamp(1.25rem,2vw,2rem)]">
          <GearSightLogo
            variant="onDark"
            className="w-full min-w-0 [&>span]:text-[clamp(1.15rem,1.6vw,1.85rem)] [&>svg]:h-[clamp(1.75rem,2.4vw,2.75rem)]"
          />
        </div>
        <SidebarNav />
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
          className={`absolute inset-y-0 left-0 flex w-[min(280px,88vw)] flex-col overflow-y-auto bg-sidebar px-5 py-6 text-white shadow-2xl transition-transform duration-200 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="mb-8 flex items-start justify-between gap-3">
            <GearSightLogo
              variant="onDark"
              className="min-w-0 [&>span]:text-[1.5rem] [&>svg]:h-9"
            />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <SidebarNav />
        </aside>
      </div>
    </>
  )
}

function SidebarNav() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [homeOpen, setHomeOpen] = useState(true)
  const [aboutOpen, setAboutOpen] = useState(true)
  const [helpOpen, setHelpOpen] = useState(true)

  return (
    <>
      <nav className="flex flex-1 flex-col gap-[clamp(1rem,1.8vw,1.5rem)]">
        <Section
          title="HOME"
          open={homeOpen}
          onToggle={() => setHomeOpen((v) => !v)}
        >
          {homeLinks.map((link) => (
            <SideLink key={link.to} {...link} />
          ))}
        </Section>

        <Section
          title="ABOUT"
          open={aboutOpen}
          onToggle={() => setAboutOpen((v) => !v)}
        >
          {aboutLinks.map((link) => (
            <SideLink key={link.to} {...link} />
          ))}
        </Section>

        <Section
          title="HELP"
          open={helpOpen}
          onToggle={() => setHelpOpen((v) => !v)}
        >
          <button
            type="button"
            className="mt-1 w-full rounded-full bg-[#FF6A1A] px-3 py-[clamp(0.65rem,1.1vw,0.875rem)] text-[clamp(9px,0.85vw,11px)] font-bold uppercase tracking-[0.08em] text-white"
          >
            Show Tutorial
          </button>
        </Section>
      </nav>

      <button
        type="button"
        onClick={() => {
          logout()
          navigate('/login')
        }}
        className="mt-[clamp(1rem,1.5vw,1.5rem)] flex items-center gap-2 px-1 py-1 text-[clamp(0.75rem,1.05vw,0.875rem)] font-medium text-white/75 transition hover:text-white"
      >
        <LogOut className="h-[1.1em] w-[1.1em]" />
        Log Out
      </button>
    </>
  )
}

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="mb-2 flex w-full items-center justify-between px-1 text-[clamp(9px,0.85vw,11px)] font-medium uppercase tracking-[0.16em] text-white/40"
      >
        {title}
        <ChevronDown
          className={`h-3.5 w-3.5 transition ${open ? '' : '-rotate-90'}`}
        />
      </button>
      {open ? <div className="flex flex-col gap-1">{children}</div> : null}
    </div>
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
        `flex items-center gap-2 rounded-lg px-2 py-2 text-[clamp(0.75rem,1.05vw,0.875rem)] font-medium transition @[14rem]/nav:gap-3 @[14rem]/nav:px-2.5 @[14rem]/nav:py-2.5 ${
          isActive ? 'text-white' : 'text-white/50 hover:text-white/85'
        }`
      }
    >
      <Icon className="h-[1.1em] w-[1.1em] shrink-0" strokeWidth={2} />
      <span className="truncate">{label}</span>
    </NavLink>
  )
}
