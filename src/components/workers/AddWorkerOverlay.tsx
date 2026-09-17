import { useEffect, useId, useState, type FormEvent } from 'react'
import { UserPlus, X } from 'lucide-react'
import { useSite } from '@/context/SiteContext'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-navy focus:ring-[3px] focus:ring-navy/15'

type AddWorkerOverlayProps = {
  open: boolean
  onClose: () => void
}

export function AddWorkerOverlay({ open, onClose }: AddWorkerOverlayProps) {
  const titleId = useId()
  const { addWorker, projectName } = useSite()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (!open) return
    setName('')
    setRole('')
    setPhone('')
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !role.trim()) return
    addWorker({ name, role, phone })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Dismiss"
        className="tutorial-backdrop-in absolute inset-0 bg-navy/75 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="tutorial-panel-in relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/35"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-white shadow-sm">
              <UserPlus className="h-6 w-6" strokeWidth={2.25} />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                Register worker
              </p>
              <h2
                id={titleId}
                className="mt-1 text-xl font-bold tracking-tight text-ink"
              >
                Add worker
              </h2>
              <p className="mt-1 text-sm text-muted">
                Add a new crew member to {projectName}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-gray-100 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
          <div className="space-y-3.5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">
                Full name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
                placeholder="e.g. Juan Dela Cruz"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">
                Role / trade
              </span>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className={inputClass}
                placeholder="e.g. Mason, Welder, Laborer"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">
                Phone (optional)
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="+63 917 000 0000"
              />
            </label>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-navy px-5 text-sm font-semibold text-white transition hover:bg-[#24314d]"
            >
              <UserPlus className="h-4 w-4" />
              Save worker
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
