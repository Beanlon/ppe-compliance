import { Link } from 'react-router-dom'
import { CameraOff } from 'lucide-react'
import { SnapshotThumb } from '@/components/SnapshotThumb'
import { useSite } from '@/context/SiteContext'

interface RecentSnapshotsStripProps {
  /** Hide the snapshot currently open on this page */
  currentId?: string
}

export function RecentSnapshotsStrip({ currentId }: RecentSnapshotsStripProps) {
  const { recentSnapshots } = useSite()
  const rows = recentSnapshots.filter((row) => row.id !== currentId).slice(0, 8)

  return (
    <section className="border-t border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-2.5 py-2 sm:px-3 sm:py-2.5">
        <h2 className="text-sm font-bold text-ink sm:text-base">
          Recent Snapshots
        </h2>
        {rows.length > 0 ? (
          <Link
            to="/records"
            className="shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold text-[#e8a06a] hover:bg-[#fff7ed] hover:underline sm:text-sm"
          >
            See all
          </Link>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-8">
          <CameraOff className="h-7 w-7 text-gray-300" strokeWidth={1.75} />
          <p className="mt-2 text-center text-sm font-semibold text-ink">
            No snapshots captured
          </p>
          <p className="mt-1 max-w-sm text-center text-xs text-muted">
            This project is newly set up. Captured moments will show up here.
          </p>
        </div>
      ) : (
        <div className="scrollbar-hidden overflow-x-auto overscroll-x-contain p-2.5 sm:p-3">
          <ul className="flex w-max gap-2.5">
            {rows.map((row) => {
              const hasViolations = row.violationCount > 0
              return (
                <li key={row.id} className="w-[168px] shrink-0 sm:w-[188px]">
                  <Link to={`/snapshots/${row.id}`} className="group block">
                    <SnapshotThumb
                      src={row.previewUrl}
                      className="aspect-video w-full rounded-md"
                    />
                    <div className="mt-1.5 min-w-0 px-0.5">
                      <p className="truncate text-sm font-bold text-ink group-hover:text-navy">
                        {row.snapshotId}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {row.date} · {row.time}
                      </p>
                      {hasViolations ? (
                        <span className="mt-1 inline-flex rounded-md bg-[#fecaca] px-1.5 py-0.5 text-xs font-semibold text-[#9f1239]">
                          {row.violationCount} violations
                        </span>
                      ) : (
                        <span className="mt-1 inline-flex rounded-md bg-[#bbf7d0] px-1.5 py-0.5 text-xs font-semibold text-[#166534]">
                          Compliant
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
