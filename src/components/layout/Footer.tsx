import { Link } from 'react-router-dom'
import { Mail, MapPin } from 'lucide-react'
import { GearSightLogo } from '@/components/brand/GearSightLogo'

const quickLinks = [
  { to: '/', label: 'Live Feed' },
  { to: '/records', label: 'Records' },
  { to: '/about', label: 'About us' },
]

const resources = [
  { to: '/records', label: 'Snapshot history' },
  { to: '/about', label: 'About GearSight' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="shrink-0 border-t border-white/10 bg-[#1a1c24] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:gap-16 lg:px-8 lg:py-12">
        <div className="max-w-md">
          <GearSightLogo
            variant="onDark"
            className="mb-3 [&>span]:text-xl [&>svg]:h-8"
          />
          <p className="text-sm leading-relaxed text-white/55">
            AI-assisted PPE compliance for construction worksites. Making safety
            detection accessible and actionable for officers on site.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://maps.google.com/?q=A.M.+Mata+Compound+Matina+Davao+City"
              target="_blank"
              rel="noreferrer"
              aria-label="Site location"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-[#FF6A1A] hover:text-[#FF6A1A]"
            >
              <MapPin className="h-4 w-4" />
            </a>
            <a
              href="mailto:safety@gearsight.local"
              aria-label="Email contact"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-[#FF6A1A] hover:text-[#FF6A1A]"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-12 sm:gap-16 lg:gap-20">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#FF6A1A]">
              Quick links
            </p>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/55 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#FF6A1A]">
              Resources
            </p>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/55 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 text-xs text-white/40 sm:px-6 lg:px-8">
          © {year} GearSight. For worksite safety monitoring — not a substitute
          for officer judgment.
        </div>
      </div>
    </footer>
  )
}
