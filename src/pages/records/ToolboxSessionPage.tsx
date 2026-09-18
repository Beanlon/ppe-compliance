import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Gauge,
  HardHat,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { AppPageFrame } from '@/components/layout/AppPageFrame'
import { SnapshotThumb } from '@/components/SnapshotThumb'
import { getSessionStats, useSite } from '@/context/SiteContext'
import type { SnapshotRecord } from '@/types'

export function ToolboxSessionPage() {
  const { sessionId = '' } = useParams()
  const navigate = useNavigate()
  const { getToolboxSession } = useSite()
  const session = useMemo(
    () => getToolboxSession(sessionId),
    [getToolboxSession, sessionId],
  )

  if (!session) {
    return (
      <AppPageFrame>
        <div className="border-b border-gray-200 px-3 py-2.5">
          <Link
            to="/records"
            className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-semibold text-muted hover:bg-gray-50 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Records
          </Link>
        </div>
        <div className="px-4 py-10 text-center">
          <p className="text-base font-bold text-ink">Session not found</p>
          <p className="mt-1 text-sm text-muted">
            This toolbox session may have been removed.
          </p>
        </div>
      </AppPageFrame>
    )
  }

  const stats = getSessionStats(session)
  const active = session.endedAt == null

  return (
    <AppPageFrame>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-200 px-2.5 py-2 sm:px-3 sm:py-2.5">
            <button
              type="button"
              onClick={() => navigate('/records')}
              className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-semibold text-muted transition hover:bg-gray-50 hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              Records
            </button>
            <span className="hidden h-4 w-px bg-gray-200 sm:block" />
            <h1 className="min-w-0 truncate text-base font-bold text-ink sm:text-lg">
              {session.contractorCompanyName}
            </h1>
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              {active ? (
                <span className="rounded-md bg-[#dcfce7] px-2 py-1 text-xs font-bold uppercase tracking-wide text-[#166534]">
                  Active session
                </span>
              ) : (
                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-bold uppercase tracking-wide text-muted">
                  Ended
                </span>
              )}
              <span className="text-xs text-muted sm:text-sm">
                {session.dateOfApplication} · {session.timeOfApplication}
              </span>
            </div>
          </header>

          <section className="border-b border-gray-200 p-3 sm:p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink sm:text-base">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#dcfce7] text-[#16a34a]">
                <Gauge className="h-4 w-4" strokeWidth={2.25} />
              </span>
              Session summary
            </h2>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <SummaryStat
                icon={<Camera className="h-4 w-4" />}
                label="Snapshots recorded"
                value={String(stats.snapshotCount)}
              />
              <SummaryStat
                icon={<TriangleAlert className="h-4 w-4" />}
                label="Total violations"
                value={String(stats.totalViolations)}
                tone={stats.totalViolations > 0 ? 'alert' : 'default'}
              />
              <SummaryStat
                icon={<Gauge className="h-4 w-4" />}
                label="Compliance rate"
                value={`${stats.complianceRate}%`}
                tone="good"
              />
              <SummaryStat
                icon={<Users className="h-4 w-4" />}
                label="Workers assigned"
                value={String(session.workers.length)}
              />
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                  Work type
                </dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {session.workType === 'arboreal' ? 'Arboreal' : 'Ground'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                  Permit receiver
                </dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {session.permitReceiver}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                  Site address
                </dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {session.siteAddressName}
                </dd>
              </div>
            </dl>
          </section>

          <section className="border-b border-gray-200 p-3 sm:p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink sm:text-base">
              <HardHat className="h-4 w-4 text-navy" />
              PPE required
            </h2>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {session.requiredPpe.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-2.5 py-1 text-xs font-semibold text-[#166534]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="p-3 sm:p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink sm:text-base">
              <Users className="h-4 w-4 text-navy" />
              Workers assigned
            </h2>
            <ul className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
              {session.workers.map((w) => (
                <li
                  key={w.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2.5"
                >
                  <span className="text-sm font-semibold text-ink">{w.name}</span>
                  <span className="text-sm text-muted">{w.position}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="@container/snapshots flex min-h-[16rem] w-full shrink-0 flex-col border-t border-gray-200 lg:min-h-0 lg:w-[clamp(11.5rem,28vw,18rem)] lg:max-w-[40%] lg:border-l lg:border-t-0 xl:w-[300px] xl:max-w-none 2xl:w-[360px]">
          <SessionSnapshotsPanel snapshots={session.snapshots} />
        </aside>
      </div>
    </AppPageFrame>
  )
}

const SESSION_SNAPSHOTS_PAGE_SIZE = 10

function SessionSnapshotsPanel({ snapshots }: { snapshots: SnapshotRecord[] }) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [snapshots])

  const needsPagination = snapshots.length > SESSION_SNAPSHOTS_PAGE_SIZE
  const totalPages = Math.max(
    1,
    Math.ceil(snapshots.length / SESSION_SNAPSHOTS_PAGE_SIZE),
  )

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageRows = useMemo(() => {
    if (!needsPagination) return snapshots
    const start = (page - 1) * SESSION_SNAPSHOTS_PAGE_SIZE
    return snapshots.slice(start, start + SESSION_SNAPSHOTS_PAGE_SIZE)
  }, [snapshots, page, needsPagination])

  const from =
    snapshots.length === 0
      ? 0
      : needsPagination
        ? (page - 1) * SESSION_SNAPSHOTS_PAGE_SIZE + 1
        : 1
  const to = needsPagination
    ? Math.min(page * SESSION_SNAPSHOTS_PAGE_SIZE, snapshots.length)
    : snapshots.length

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-3 py-2.5">
        <h2 className="truncate text-sm font-bold text-ink sm:text-base">
          Session snapshots
        </h2>
        <span className="text-xs font-semibold text-muted">{snapshots.length}</span>
      </div>

      {snapshots.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
          <ClipboardList className="h-8 w-8 text-gray-300" strokeWidth={1.75} />
          <p className="mt-3 text-center text-sm font-semibold text-ink">
            No snapshots yet
          </p>
          <p className="mt-1 max-w-[14rem] text-center text-xs text-muted">
            Snapshots captured during this toolbox session will list here.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: horizontal strip — scroll through the current page */}
          <div className="scrollbar-hidden overflow-x-auto overscroll-x-contain p-3 lg:hidden">
            <ul className="flex w-max gap-3">
              {pageRows.map((row) => (
                <li key={row.id} className="w-[200px] shrink-0 sm:w-[220px]">
                  <SnapshotCard row={row} layout="stack" />
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop rail: up to 10 per page, scroll within the page */}
          <ul className="scrollbar-hidden hidden min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-2 @[16rem]/snapshots:space-y-3 @[16rem]/snapshots:p-3 lg:block">
            {pageRows.map((row) => (
              <li key={row.id}>
                <SnapshotCard row={row} layout="row" />
              </li>
            ))}
          </ul>

          {needsPagination ? (
            <div className="shrink-0 border-t border-gray-200 px-2 py-2.5 sm:px-3">
              <p className="mb-2 text-xs text-muted">
                Showing {from}–{to} of {snapshots.length}
              </p>
              <SnapshotPagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </div>
          ) : null}
        </>
      )}
    </>
  )
}

function SnapshotPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  const pages = useMemo(
    () => getPageNumbers(page, totalPages),
    [page, totalPages],
  )

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex flex-wrap items-center gap-1">
        {pages.map((item, index) =>
          item === '…' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-xs text-muted"
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
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition ${
                item === page
                  ? 'border-ink bg-ink text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function getPageNumbers(page: number, totalPages: number): Array<number | '…'> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (page <= 3) return [1, 2, 3, 4, '…', totalPages]
  if (page >= totalPages - 2) {
    return [1, '…', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  return [1, '…', page - 1, page, page + 1, '…', totalPages]
}

function SummaryStat({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: ReactNode
  label: string
  value: string
  tone?: 'default' | 'alert' | 'good'
}) {
  const valueClass =
    tone === 'alert'
      ? 'text-[#dc2626]'
      : tone === 'good'
        ? 'text-[#16a34a]'
        : 'text-ink'

  return (
    <div className="rounded-xl border border-gray-200 bg-surface/50 px-3 py-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <span className="text-navy">{icon}</span>
        {label}
      </p>
      <p className={`mt-1.5 text-xl font-bold tabular-nums ${valueClass}`}>
        {value}
      </p>
    </div>
  )
}

function SnapshotCard({
  row,
  layout,
}: {
  row: SnapshotRecord
  layout: 'row' | 'stack'
}) {
  const hasViolations = row.violationCount > 0

  if (layout === 'stack') {
    return (
      <Link to={`/snapshots/${row.id}`} className="group block">
        <SnapshotThumb
          src={row.previewUrl}
          className="aspect-video w-full rounded-lg"
        />
        <div className="mt-2 min-w-0 px-0.5">
          <p className="truncate text-sm font-bold text-ink group-hover:text-navy">
            {row.snapshotId}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted">
            {row.date} · {row.time}
          </p>
          <StatusChip hasViolations={hasViolations} count={row.violationCount} />
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/snapshots/${row.id}`}
      className="group flex gap-2 @[16rem]/snapshots:gap-3"
    >
      <SnapshotThumb
        src={row.previewUrl}
        className="aspect-video w-[96px] shrink-0 rounded-md @[16rem]/snapshots:w-[128px] @[16rem]/snapshots:rounded-lg @[22rem]/snapshots:w-[168px]"
      />
      <div className="min-w-0 flex-1 py-0.5">
        <p className="line-clamp-2 text-xs font-bold leading-snug text-ink group-hover:text-navy @[16rem]/snapshots:text-sm">
          {row.snapshotId}
        </p>
        <p className="mt-0.5 text-xs text-muted @[16rem]/snapshots:mt-1">
          {row.date}
        </p>
        <p className="text-xs text-muted">{row.time}</p>
        <StatusChip hasViolations={hasViolations} count={row.violationCount} />
      </div>
    </Link>
  )
}

function StatusChip({
  hasViolations,
  count,
}: {
  hasViolations: boolean
  count: number
}) {
  if (hasViolations) {
    return (
      <span className="mt-1 inline-flex rounded-md bg-[#fecaca] px-1.5 py-0.5 text-xs font-semibold text-[#9f1239] @[16rem]/snapshots:mt-1.5 @[16rem]/snapshots:px-2">
        {count} violations
      </span>
    )
  }

  return (
    <span className="mt-1 inline-flex rounded-md bg-[#bbf7d0] px-1.5 py-0.5 text-xs font-semibold text-[#166534] @[16rem]/snapshots:mt-1.5 @[16rem]/snapshots:px-2">
      Compliant
    </span>
  )
}
