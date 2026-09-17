import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { GearSightLogo } from '@/components/brand/GearSightLogo'
import { useAuth } from '@/context/AuthContext'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('account@gmail.com')
  const [projectId, setProjectId] = useState('')
  const [passcode, setPasscode] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    login(email, 'safety_officer')
    navigate('/')
  }

  return (
    <div className="flex h-full min-h-full w-full bg-white">
      {/* Left banner — full-height half */}
      <div className="relative hidden h-full min-h-screen w-1/2 shrink-0 md:block">
        <img
          src="/brand/login-banner.jpg"
          alt="Construction crew in PPE paving a road"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      </div>

      {/* Right form — full-height half */}
      <form
        onSubmit={onSubmit}
        className="flex min-h-screen min-w-0 w-full flex-1 flex-col justify-between px-8 py-10 sm:px-12 sm:py-12 lg:px-16 lg:py-14 xl:px-20"
      >
        <div className="mx-auto w-full max-w-md flex-1">
          <GearSightLogo
            variant="onLight"
            className="[&>span]:text-2xl sm:[&>span]:text-3xl [&>svg]:h-10"
          />

          <h1 className="mt-10 max-w-[18ch] text-2xl font-bold leading-tight tracking-tight text-ink sm:mt-12 sm:text-3xl lg:text-4xl">
            Begin your compliance system with GearSight!
          </h1>

          <div className="mt-10 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#6b7280] sm:text-base">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#6b7280] sm:text-base">
                Project ID
              </span>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="PRJ-0000-ABC"
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#6b7280] sm:text-base">
                Passcode
              </span>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••"
                className={fieldClass}
              />
            </label>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-[#6b7280] transition hover:text-navy hover:underline sm:text-base"
              >
                Forgot Passcode
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 flex w-full max-w-md items-center justify-between gap-4">
          <Link
            to="/signup"
            className="text-sm font-medium text-[#6b7280] transition hover:text-navy hover:underline sm:text-base"
          >
            Don&apos;t have an account?
          </Link>

          <button
            type="submit"
            className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-full bg-navy px-7 text-sm font-semibold text-white transition hover:bg-[#24314d] sm:text-base"
          >
            Log in
          </button>
        </div>
      </form>
    </div>
  )
}

const fieldClass =
  'h-11 w-full rounded-lg border border-[#d8dce3] bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-[#9ca3af] focus:border-navy focus:shadow-[0_0_0_3px_rgba(46,58,89,0.12)] sm:text-base'
