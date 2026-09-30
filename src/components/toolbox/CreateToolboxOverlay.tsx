import { useEffect, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardPlus, ShieldAlert, X } from 'lucide-react'
import { siteInfo } from '@/data/mock'

type CreateToolboxOverlayProps = {
  open: boolean
  onClose?: () => void
  dismissible?: boolean
}

export function CreateToolboxOverlay({
  open,
  onClose,
  dismissible = false,
}: CreateToolboxOverlayProps) {
  const titleId = useId()
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open || !dismissible) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, dismissible, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label={dismissible ? 'Dismiss' : undefined}
        disabled={!dismissible}
        className="tutorial-backdrop-in absolute inset-0 bg-navy/75 backdrop-blur-[3px] disabled:cursor-default"
        onClick={dismissible ? onClose : undefined}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="tutorial-panel-in relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/35"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-white shadow-sm">
              <ClipboardPlus className="h-6 w-6" strokeWidth={2.25} />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                Before monitoring
              </p>
              <h2
                id={titleId}
                className="mt-1 text-xl font-bold tracking-tight text-ink"
              >
                Create a toolbox talk
              </h2>
            </div>
          </div>
          {dismissible ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-muted transition hover:bg-gray-100 hover:text-ink"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        <div className="px-5 py-5 sm:px-6">
          <p className="text-sm leading-relaxed text-muted">
            Live Feed stays blank until today’s toolbox talk is recorded for{' '}
            <span className="font-semibold text-ink">{siteInfo.name}</span>.
            Complete the pre-work briefing so the site can start monitoring.
          </p>

          <div className="mt-4 flex gap-3 rounded-xl border border-[#fed7aa] bg-[#fff7ed] p-3.5">
            <ShieldAlert
              className="mt-0.5 h-5 w-5 shrink-0 text-accent"
              strokeWidth={2.25}
            />
            <p className="text-sm leading-relaxed text-ink/90">
              Toolbox talks document hazards, required PPE, and crew attendance
              before work begins.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-surface/70 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/toolbox')}
            className="inline-flex h-10 min-w-[10rem] items-center justify-center gap-1.5 rounded-full bg-navy px-5 text-sm font-semibold text-white transition hover:bg-[#24314d]"
          >
            <ClipboardPlus className="h-4 w-4" />
            Create toolbox
          </button>
        </div>
      </div>
    </div>
  )
}
