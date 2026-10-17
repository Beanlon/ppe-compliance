import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Loader2, QrCode, RefreshCw, Smartphone } from 'lucide-react'
import { GearSightLogo } from '@/components/brand/GearSightLogo'
import { useAuth } from '@/context/AuthContext'
import {
  fetchVerifyHosts,
  pickPhoneOrigin,
  qrImageUrl,
} from '@/lib/verifyApi'

export function LoginVerifyPage() {
  const {
    isAuthenticated,
    pendingLogin,
    startSiteVerification,
    completeSiteVerification,
    clearPendingLogin,
  } = useAuth()
  const navigate = useNavigate()
  const [phoneOrigin, setPhoneOrigin] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [renewing, setRenewing] = useState(false)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const hosts = await fetchVerifyHosts()
        if (!cancelled) {
          setPhoneOrigin(
            pickPhoneOrigin(hosts.lanOrigins, window.location.origin),
          )
        }
      } catch {
        if (!cancelled) setPhoneOrigin(window.location.origin)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const verifyUrl = useMemo(() => {
    if (!pendingLogin || !phoneOrigin) return ''
    return `${phoneOrigin}/verify/${pendingLogin.challengeId}`
  }, [pendingLogin, phoneOrigin])

  const secondsLeft = pendingLogin
    ? Math.max(0, Math.floor((pendingLogin.expiresAt - now) / 1000))
    : 0
  const expired = Boolean(pendingLogin && secondsLeft <= 0)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (!pendingLogin) {
    return <Navigate to="/login" replace />
  }

  async function onConfirm(e: FormEvent) {
    e.preventDefault()
    if (expired) {
      setError('This QR expired. Generate a new one.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await completeSiteVerification(code.trim())
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function renewQr() {
    const pending = pendingLogin
    if (!pending) return
    setRenewing(true)
    setError('')
    setCode('')
    try {
      await startSiteVerification(
        pending.email,
        pending.role,
        pending.projectId,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not renew QR')
    } finally {
      setRenewing(false)
    }
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

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

      <div className="relative w-full max-w-[520px]">
        <GearSightLogo
          variant="onDark"
          className="mb-8 justify-center [&>span]:text-3xl [&>svg]:h-11"
        />

        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="h-1.5 bg-gradient-to-r from-navy via-accent to-[#ffb088]" />

          <div className="px-6 py-8 sm:px-8 sm:py-9">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
              Step 2 of 4
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Verify you are on site
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6b7280] sm:text-base">
              Scan this QR with your phone. The phone uses GPS + a map, then
              shows a code to type here.
            </p>

            <div className="mt-6 rounded-2xl border border-[#e5e7eb] bg-[#f8f9fb] p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1e8] text-accent">
                  <Smartphone className="h-5 w-5" />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-ink">
                    {pendingLogin.site.name}
                  </p>
                  <p className="mt-0.5 text-[#6b7280]">
                    Project {pendingLogin.projectId}
                  </p>
                  <p className="mt-1 truncate text-[#6b7280]">
                    {pendingLogin.site.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center">
              <div className="relative rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm">
                {verifyUrl && !expired ? (
                  <img
                    src={qrImageUrl(verifyUrl, 220)}
                    alt="Site verification QR code"
                    width={220}
                    height={220}
                    className="h-[220px] w-[220px]"
                  />
                ) : (
                  <div className="flex h-[220px] w-[220px] flex-col items-center justify-center gap-2 text-[#6b7280]">
                    <QrCode className="h-10 w-10 opacity-40" />
                    <p className="text-sm font-medium">
                      {expired ? 'QR expired' : 'Preparing QR…'}
                    </p>
                  </div>
                )}
              </div>

              <p
                className={`mt-3 text-sm font-semibold ${expired ? 'text-[#b45309]' : 'text-ink'}`}
              >
                {expired ? 'Expired' : `Expires in ${mm}:${ss}`}
              </p>

              {verifyUrl ? (
                <p className="mt-2 max-w-full break-all text-center font-mono text-[11px] leading-relaxed text-[#6b7280]">
                  {verifyUrl}
                </p>
              ) : null}

              <p className="mt-2 text-center text-xs leading-relaxed text-[#9ca3af]">
                Phone must be on the same Wi‑Fi and open the{' '}
                <span className="font-semibold text-[#6b7280]">https://</span>{' '}
                link. If the phone warns about the certificate, tap Advanced →
                Proceed. Then tap <span className="font-semibold text-[#6b7280]">Allow location</span> so the GPS popup can appear.
              </p>

              <button
                type="button"
                onClick={() => void renewQr()}
                disabled={renewing}
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#d8dce3] px-4 text-sm font-semibold text-ink transition hover:border-navy disabled:opacity-60"
              >
                {renewing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                New QR
              </button>
            </div>

            <form onSubmit={onConfirm} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">
                  Verification code from phone
                </span>
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder="6-digit code"
                  className="h-12 w-full rounded-xl border border-[#d8dce3] bg-[#f8f9fb] px-3.5 text-center font-mono text-lg tracking-[0.35em] text-ink outline-none transition placeholder:tracking-normal placeholder:text-[#9ca3af] focus:border-navy focus:bg-white focus:shadow-[0_0_0_3px_rgba(46,58,89,0.12)]"
                />
              </label>

              {error ? (
                <p className="text-sm font-medium text-[#b45309]">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={submitting || code.length < 6 || expired}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-navy text-sm font-semibold text-white transition hover:bg-[#24314d] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Confirm and open GearSight'
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                clearPendingLogin()
                navigate('/login')
              }}
              className="mt-4 w-full text-center text-sm font-medium text-[#6b7280] transition hover:text-navy"
            >
              Back to sign in
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white/70">
          Need an account?{' '}
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
