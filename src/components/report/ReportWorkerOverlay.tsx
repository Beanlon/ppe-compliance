import { useEffect, useId, useMemo, useState } from 'react'
import { Flag, UserRound, X } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { useSite } from '@/context/SiteContext'
import type { Worker } from '@/types'

type ReportWorkerOverlayProps = {
  open: boolean
  onClose: () => void
  snapshotId: string
  personLabel: string
  personDetectionId: string
}

export function ReportWorkerOverlay({
  open,
  onClose,
  snapshotId,
  personLabel,
  personDetectionId,
}: ReportWorkerOverlayProps) {
  const titleId = useId()
  const { workers, projectName, reportWorker } = useSite()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submittedName, setSubmittedName] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return workers
    return workers.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.role.toLowerCase().includes(q) ||
        (w.phone?.toLowerCase().includes(q) ?? false),
    )
  }, [workers, query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setSelectedId(null)
    setSubmittedName(null)
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

  function handleConfirm() {
    if (!selectedId) return
    const report = reportWorker({
      workerId: selectedId,
      snapshotId,
      personLabel,
      personDetectionId,
    })
    if (report) {
      setSubmittedName(report.workerName)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Dismiss report overlay"
        className="tutorial-backdrop-in absolute inset-0 bg-navy/75 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="tutorial-panel-in relative z-10 flex max-h-[min(92vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/35"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
              Identify worker
            </p>
            <h2
              id={titleId}
              className="mt-1 text-xl font-bold tracking-tight text-ink"
            >
              Report {personLabel}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Match this detection to a registered worker at {projectName}.
            </p>
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

        {submittedName ? (
          <div className="flex flex-1 flex-col justify-center px-5 py-8 sm:px-6">
            <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-center">
              <Flag className="mx-auto h-8 w-8 text-[#16a34a]" strokeWidth={2.25} />
              <p className="mt-3 text-base font-bold text-ink">
                Report filed for {submittedName}
              </p>
              <p className="mt-1 text-sm text-muted">
                Linked from {personLabel} on this snapshot.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-navy px-5 text-sm font-semibold text-white transition hover:bg-[#24314d]"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="shrink-0 border-b border-gray-100 px-5 py-3 sm:px-6">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search workers by name or role"
                className="w-full"
              />
            </div>

            <ul className="min-h-0 flex-1 overflow-y-auto px-2 py-2 sm:px-3">
              {filtered.length === 0 ? (
                <li className="px-3 py-8 text-center text-sm text-muted">
                  No workers match your search.
                </li>
              ) : (
                filtered.map((worker) => (
                  <WorkerRow
                    key={worker.id}
                    worker={worker}
                    selected={worker.id === selectedId}
                    onSelect={() => setSelectedId(worker.id)}
                  />
                ))
              )}
            </ul>

            <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-surface/70 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-semibold text-muted transition hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedId}
                onClick={handleConfirm}
                className="inline-flex h-10 min-w-[9rem] items-center justify-center gap-1.5 rounded-full bg-navy px-5 text-sm font-semibold text-white transition hover:bg-[#24314d] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Flag className="h-4 w-4" />
                Report worker
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function WorkerRow({
  worker,
  selected,
  onSelect,
}: {
  worker: Worker
  selected: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
          selected
            ? 'bg-navy text-white'
            : 'hover:bg-gray-50 text-ink'
        }`}
      >
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            selected ? 'bg-white/15 text-white' : 'bg-surface text-navy'
          }`}
        >
          <UserRound className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            {worker.name}
          </span>
          <span
            className={`block truncate text-xs ${
              selected ? 'text-white/75' : 'text-muted'
            }`}
          >
            {worker.role}
            {worker.phone ? ` · ${worker.phone}` : null}
          </span>
        </span>
      </button>
    </li>
  )
}
