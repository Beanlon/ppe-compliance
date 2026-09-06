import { NavLink, useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  HardHat,
  LayoutDashboard,
  Plus,
  Settings,
} from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/records', label: 'Records', icon: ClipboardList },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col overflow-y-auto bg-sidebar px-4 py-5 text-white">
      <div className="mb-8 flex items-center gap-2 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/20 text-brand">
          <HardHat className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">PPE Guard</p>
          <p className="text-[10px] uppercase tracking-wide text-white/50">
            Compliance
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/toolbox/create')}
        className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-3 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(74,222,128,0.35)] transition hover:bg-brand-dark"
      >
        <Plus className="h-4 w-4" strokeWidth={3} />
        Create Toolbox
      </button>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-white text-sidebar'
                  : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
