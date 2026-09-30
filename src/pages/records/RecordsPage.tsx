import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  HardHat,
  Users,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppPageFrame } from '@/components/layout/AppPageFrame'
import { SearchInput } from '@/components/ui/SearchInput'
import { getSessionStats, useSite } from '@/context/SiteContext'
import type { ToolboxSessionRecord } from '@/types'

const PAGE_SIZE = 6

export function RecordsPage() {
  const { toolboxSessions } = useSite()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return toolboxSessions
    return toolboxSessions.filter(
      (s) =>
        s.contractorCompanyName.toLowerCase().includes(q) ||
        s.dateOfApplication.includes(q) ||
        s.permitReceiver.toLowerCase().includes(q) ||
        s.workType.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q),
    )
  }, [toolboxSessions, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [query])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  const from = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, filtered.length)

  return (
    <AppPageFrame padded>
      <PageHeader
        title="Records"
        subtitle="Toolbox sessions and their captured snapshots"
      />

      {toolboxSessions.length === 0 ? (
        <div className="mt-2 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-4 py-16">
          <ClipboardList className="h-10 w-10 text-gray-300" strokeWidth={1.75} />
          <p className="mt-4 text-base font-semibold text-ink">No sessions yet</p>
          <p className="mt-1 max-w-sm text-center text-sm text-muted">
            Create a toolbox talk to start a work session. Ended sessions and
            their snapshots will appear here.
          </p>
          <Link
            to="/toolbox"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-navy px-5 text-sm font-semibold text-white transition hover:bg-[#24314d]"
          >
            Open toolbox
          </Link>
        </div>
      ) : (
        <>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by contractor, date, work type…"
            className="w-full max-w-2xl"
          />

          <p className="mt-4 text-sm text-muted">
            {filtered.length}{' '}
            {filtered.length === 1 ? 'session' : 'sessions'}
            {filtered.length > 0 ? (
              <span className="text-gray-400">
                {' '}
                · Showing {from}–{to}
              </span>
            ) : null}
          </p>

          <div className="mt-4 space-y-3">
            {pageRows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center">
                <p className="text-sm font-semibold text-ink">No sessions found</p>
                <p className="mt-1 text-sm text-muted">
                  Nothing matches your search.
                </p>
              </div>
            ) : (
              pageRows.map((session) => (
                <SessionRecordCard key={session.id} session={session} />
              ))
            )}
          </div>

          {filtered.length > 0 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          ) : null}
        </>
      )}
    </AppPageFrame>
  )
}

function SessionRecordCard({ session }: { session: ToolboxSessionRecord }) {
  const stats = getSessionStats(session)
  const active = session.endedAt == null

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-ink sm:text-lg">
              {session.contractorCompanyName}
            </h3>
            {active ? (
              <span className="rounded-md bg-[#dcfce7] px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[#166534]">
                Active
              </span>
            ) : (
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-muted">
                Ended
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            {session.dateOfApplication} · {session.timeOfApplication} ·{' '}
            {session.workType === 'arboreal' ? 'Arboreal' : 'Ground'}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            Permit receiver {session.permitReceiver}
          </p>
        </div>
        <Link
          to={`/records/${session.id}`}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-navy px-4 text-sm font-semibold text-white transition hover:bg-[#24314d]"
        >
          View session
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 sm:grid-cols-4">
        <StatChip
          label="Snapshots"
          value={String(stats.snapshotCount)}
        />
        <StatChip
          label="Violations"
          value={String(stats.totalViolations)}
          alert={stats.totalViolations > 0}
        />
        <StatChip
          label="Compliance"
          value={`${stats.complianceRate}%`}
        />
        <StatChip
          label="Workers"
          value={String(session.workers.length)}
          icon={<Users className="h-3.5 w-3.5" />}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <HardHat className="h-3.5 w-3.5 text-muted" />
        {session.requiredPpe.slice(0, 4).map((item) => (
          <span
            key={item}
            className="rounded-md bg-[#eef1f7] px-2 py-0.5 text-xs font-semibold text-navy"
          >
            {item}
          </span>
        ))}
        {session.requiredPpe.length > 4 ? (
          <span className="text-xs text-muted">
            +{session.requiredPpe.length - 4} more
          </span>
        ) : null}
      </div>
    </article>
  )
}

function StatChip({
  label,
  value,
  alert,
  icon,
}: {
  label: string
  value: string
  alert?: boolean
  icon?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-surface/60 px-2.5 py-2">
      <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
        {icon}
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm font-bold tabular-nums ${
          alert ? 'text-[#dc2626]' : 'text-ink'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  const pages = useMemo(
    () => getRecordPageNumbers(page, totalPages),
    [page, totalPages],
  )

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
      <p className="text-sm text-muted">
        Page {page} of {totalPages}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((item, index) =>
          item === '…' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1.5 text-sm text-muted"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onChange(item)}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-semibold transition ${
                item === page
                  ? 'border-ink bg-ink text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function getRecordPageNumbers(
  page: number,
  totalPages: number,
): Array<number | '…'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (page <= 3) return [1, 2, 3, 4, '…', totalPages]
  if (page >= totalPages - 2) {
    return [1, '…', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  return [1, '…', page - 1, page, page + 1, '…', totalPages]
}
