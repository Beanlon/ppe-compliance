import { Link } from 'react-router-dom'
import { SnapshotThumb } from '@/components/SnapshotThumb'
import type { SnapshotRecord } from '@/types'

interface RecordsListProps {
  rows: SnapshotRecord[]
}

interface RecordsGridProps {
  rows: SnapshotRecord[]
}

export function RecordsList({ rows }: RecordsListProps) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <article
          key={row.id}
          className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-3 sm:flex-row sm:gap-5 sm:p-4"
        >
          <SnapshotThumb
            src={row.previewUrl}
            className="h-40 w-full shrink-0 rounded-xl sm:h-[110px] sm:w-[168px]"
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-ink sm:text-xl">
                  {row.snapshotId}
                </h3>
                <p className="mt-1 text-sm text-muted">{row.date}</p>
                <p className="text-sm text-muted">{row.time}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>

            <div className="mt-auto flex justify-end pt-3">
              <Link
                to={`/snapshots/${row.id}`}
                className="inline-flex w-full items-center justify-center rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white sm:w-auto sm:py-2"
              >
                View more
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export function RecordsGrid({ rows }: RecordsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <Link
          key={row.id}
          to={`/snapshots/${row.id}`}
          className="block overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300"
        >
          <SnapshotThumb
            src={row.previewUrl}
            className="aspect-[16/10] w-full"
          />
          <div className="flex items-end justify-between gap-3 p-4">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-ink sm:text-lg">
                {row.snapshotId}
              </h3>
              <p className="mt-1 text-sm text-muted">{row.date}</p>
              <p className="text-sm text-muted">{row.time}</p>
            </div>
            <StatusBadge status={row.status} />
          </div>
        </Link>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: SnapshotRecord['status'] }) {
  if (status === 'compliant') {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-compliant px-3 py-1 text-xs font-bold uppercase tracking-wide text-compliant-text">
        Compliant
      </span>
    )
  }

  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-[#fecaca] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#9f1239]">
      Non-compliant
    </span>
  )
}
