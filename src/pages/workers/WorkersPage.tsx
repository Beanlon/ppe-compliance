import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, UserPlus, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { AddWorkerOverlay } from '@/components/workers/AddWorkerOverlay'
import { useSite } from '@/context/SiteContext'
import type { Worker } from '@/types'

export function WorkersPage() {
  const { workers, projectName, projectId, reports } = useSite()
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)

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

  const reportCountByWorker = useMemo(() => {
    const map = new Map<string, number>()
    for (const report of reports) {
      map.set(report.workerId, (map.get(report.workerId) ?? 0) + 1)
    }
    return map
  }, [reports])

  return (
    <div className="w-full">
      <PageHeader
        title="Workers"
        subtitle={`Crew records for ${projectName} (${projectId})`}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search workers"
          className="w-full min-w-0 flex-1 sm:max-w-2xl"
        />
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-navy px-4 text-sm font-semibold text-white transition hover:bg-[#24314d]"
        >
          <UserPlus className="h-4 w-4" />
          Add worker
        </button>
      </div>

      <p className="mt-4 text-sm text-muted">
        {filtered.length}{' '}
        {filtered.length === 1 ? 'worker' : 'workers'} on this project site
      </p>

      <ul className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {workers.length === 0 ? (
          <li className="px-4 py-10 text-center">
            <UserRound className="mx-auto h-8 w-8 text-gray-300" strokeWidth={1.75} />
            <p className="mt-3 text-sm font-semibold text-ink">
              No workers registered yet
            </p>
            <p className="mt-1 text-sm text-muted">
              This project is new — add crew members to start tracking attendance
              and reports.
            </p>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="mt-4 inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-navy px-5 text-sm font-semibold text-white transition hover:bg-[#24314d]"
            >
              <UserPlus className="h-4 w-4" />
              Add first worker
            </button>
          </li>
        ) : filtered.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-muted">
            No workers match your search.
          </li>
        ) : (
          filtered.map((worker) => (
            <WorkerRow
              key={worker.id}
              worker={worker}
              reportCount={reportCountByWorker.get(worker.id) ?? 0}
            />
          ))
        )}
      </ul>

      <AddWorkerOverlay open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

function WorkerRow({
  worker,
  reportCount,
}: {
  worker: Worker
  reportCount: number
}) {
  return (
    <li>
      <Link
        to={`/workers/${worker.id}`}
        className="flex flex-wrap items-center gap-3 px-4 py-3.5 transition hover:bg-gray-50 sm:px-5"
      >
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-navy">
          <UserRound className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink sm:text-base">
            {worker.name}
          </p>
          <p className="truncate text-xs text-muted sm:text-sm">
            {worker.role}
            {worker.phone ? ` · ${worker.phone}` : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {reportCount > 0 ? (
            <span className="rounded-md bg-[#fecaca] px-2 py-1 text-xs font-bold uppercase tracking-wide text-[#9f1239]">
              {reportCount} {reportCount === 1 ? 'violation' : 'violations'}
            </span>
          ) : null}
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
        </div>
      </Link>
    </li>
  )
}
