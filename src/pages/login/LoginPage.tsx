import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, FolderKanban, LockKeyhole, Mail } from 'lucide-react'
import { GearSightLogo } from '@/components/brand/GearSightLogo'
import { useAuth } from '@/context/AuthContext'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('account@gmail.com')
  const [projectId, setProjectId] = useState('')
  const [passcode, setPasscode] = useState('')
  const [showPasscode, setShowPasscode] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    login(email, 'safety_officer')
    navigate('/')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#161b2b] px-4 py-10 sm:px-6">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-accent/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-[#4ade80]/10 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-[440px]">
        <GearSightLogo
          variant="onDark"
          className="mb-8 justify-center [&>span]:text-3xl [&>svg]:h-11"
        />

        <form
          onSubmit={onSubmit}
          className="overflow-hidden rounded-3xl bg-white shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
        >
          <div className="h-1.5 bg-gradient-to-r from-navy via-accent to-[#ffb088]" />

          <div className="px-6 py-8 sm:px-8 sm:py-9">
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Sign in
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6b7280] sm:text-base">
              Open your project workspace and pick up PPE monitoring where you
              left off.
            </p>

            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">
                  Email
                </span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${fieldClass} pl-11`}
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">
                  Project ID
                </span>
                <span className="relative block">
                  <FolderKanban className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                  <input
                    type="text"
                    autoComplete="off"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="PRJ-0000-ABC"
                    className={`${fieldClass} pl-11`}
                  />
                </span>
              </label>

              <div>
                <span className="mb-1.5 flex items-center justify-between gap-3">
                  <label htmlFor="passcode" className="text-sm font-semibold text-ink">
                    Passcode
                  </label>
                  <button
                    type="button"
                    className="text-sm font-medium text-accent transition hover:underline"
                  >
                    Forgot passcode?
                  </button>
                </span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                  <input
                    id="passcode"
                    type={showPasscode ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter your passcode"
                    className={`${fieldClass} pl-11 pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode((v) => !v)}
                    className="absolute right-0 top-0 flex h-12 w-11 items-center justify-center text-[#6b7280] transition hover:text-navy"
                    aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                  >
                    {showPasscode ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-full bg-navy text-sm font-semibold text-white transition hover:bg-[#24314d] sm:text-base"
            >
              Log in
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-white/70 sm:text-base">
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-white underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

const fieldClass =
  'h-12 w-full rounded-xl border border-[#d8dce3] bg-[#f8f9fb] px-3.5 text-sm text-ink outline-none transition placeholder:text-[#9ca3af] focus:border-navy focus:bg-white focus:shadow-[0_0_0_3px_rgba(46,58,89,0.12)] sm:text-base'
