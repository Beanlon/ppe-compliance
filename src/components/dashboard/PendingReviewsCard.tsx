import { Badge } from '@/components/ui/Badge'
import { violations, workers } from '@/data/mock'

function workerName(id: string) {
  return workers.find((w) => w.id === id)?.name ?? 'Unknown worker'
}

export function PendingReviewsCard() {
  const pending = violations.filter((v) => !v.reviewed)
  const recent = [...violations].slice(0, 3)

  return (
    <article className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Reviews & Violations
          </h2>
          <p className="text-xs text-gray-500">
            {pending.length} pending officer confirmation
          </p>
        </div>
        <Badge tone={pending.length ? 'red' : 'green'}>
          {pending.length ? `${pending.length} pending` : 'All clear'}
        </Badge>
      </div>

      <ul className="flex flex-1 flex-col gap-3">
        {recent.map((v) => (
          <li
            key={v.id}
            className="rounded-xl border border-gray-100 px-3.5 py-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {workerName(v.workerId)}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {v.date} · {v.time}
                </p>
              </div>
              <Badge tone={v.reviewed ? 'green' : 'pink'}>
                {v.reviewed ? 'Reviewed' : 'Pending'}
              </Badge>
            </div>
            <p className="mt-2 text-xs font-medium text-gray-600">
              Missing: {v.missingPpe.join(', ')}
            </p>
          </li>
        ))}
      </ul>
    </article>
  )
}
