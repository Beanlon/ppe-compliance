import { Link } from 'react-router-dom'

const links = [
  { to: '/', label: 'Live Feed' },
  { to: '/records', label: 'Records' },
  { to: '/about', label: 'About us' },
]

/** Slim app footer so main content keeps a consistent tall viewport. */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="shrink-0 border-t border-white/10 bg-[#1a1c24] text-white">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-5 lg:px-6">
        <p className="text-xs text-white/45">
          © {year} GearSight · Worksite PPE monitoring
        </p>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-xs font-medium text-white/55 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
