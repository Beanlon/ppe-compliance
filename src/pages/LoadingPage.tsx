import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { GearSightLogo } from '@/components/brand/GearSightLogo'
import { useAuth } from '@/context/AuthContext'

const LOAD_MS = 2200
export const ENTRY_FLAG = 'gearsight.pendingEntry'

export function LoadingPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) return

    sessionStorage.setItem(ENTRY_FLAG, '1')
    const started = performance.now()
    let frame = 0
    let done = false

    const finish = () => {
      if (done) return
      done = true
      sessionStorage.removeItem(ENTRY_FLAG)
      navigate('/', { replace: true })
    }

    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / LOAD_MS)
      const eased = 1 - (1 - t) ** 2
      setProgress(Math.round(eased * 100))
      if (t < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        finish()
      }
    }

    frame = requestAnimationFrame(tick)
    const fallback = window.setTimeout(finish, LOAD_MS + 250)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(fallback)
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-[#3d4a6b] to-accent px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(255,106,26,0.25),transparent_40%)]" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <div className="animate-pulse">
          <GearSightLogo
            variant="onDark"
            className="justify-center [&>span]:text-3xl sm:[&>span]:text-4xl [&>svg]:h-12"
          />
        </div>

        <p className="mt-8 text-sm font-medium text-white/80 sm:text-base">
          Preparing your compliance workspace…
        </p>

        <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-75 ease-linear"
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>

        <p className="mt-3 font-mono text-xs tracking-wide text-white/50 sm:text-sm">
          {progress}%
        </p>
      </div>
    </div>
  )
}
