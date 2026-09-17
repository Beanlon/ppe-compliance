import { Link } from 'react-router-dom'
import { SnapshotThumb } from '@/components/SnapshotThumb'
import { recentSnapshots } from '@/data/mock'

/** Two fewer cards so the rail lines up with Today's Summary */
const visibleSnapshots = recentSnapshots.slice(0, -2)

export function RecentSnapshotsCard() {
  return (
    <section className="flex min-h-0 w-full flex-1 flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-3 py-2.5 @[16rem]/snapshots:px-4 @[16rem]/snapshots:py-3">
        <h2 className="truncate text-sm font-bold text-ink sm:text-base">
          Recent Snapshots
        </h2>
        <Link
          to="/records"
          className="shrink-0 text-xs font-semibold text-[#e8a06a] hover:underline @[16rem]/snapshots:text-sm"
        >
          See all
        </Link>
      </div>

      {/* Phone / narrow: horizontal strip */}
      <div className="scrollbar-hidden overflow-x-auto overscroll-x-contain p-3 lg:hidden">
        <ul className="flex w-max gap-3">
          {visibleSnapshots.map((row) => (
            <li key={row.id} className="w-[200px] shrink-0 sm:w-[220px]">
              <SnapshotCard row={row} layout="stack" />
            </li>
          ))}
        </ul>
      </div>

      {/* Tablet landscape + desktop: compact when rail is narrow */}
      <ul className="scrollbar-hidden hidden min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-2 @[16rem]/snapshots:space-y-3 @[16rem]/snapshots:p-3 lg:block">
        {visibleSnapshots.map((row) => (
          <li key={row.id}>
            <SnapshotCard row={row} layout="row" />
          </li>
        ))}
      </ul>
    </section>
  )
}

function SnapshotCard({
  row,
  layout,
}: {
  row: (typeof recentSnapshots)[number]
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
