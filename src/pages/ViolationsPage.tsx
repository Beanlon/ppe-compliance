import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { toolboxSessions, violations, workers, snapshots } from '@/data/mock'

export function ViolationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-950">
          Review Violations
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Worker + violation + toolbox + evidence for officer and engineer
          review.
        </p>
      </div>

      <div className="space-y-3">
        {violations.map((item) => {
          const worker = workers.find((w) => w.id === item.workerId)
          const toolbox = toolboxSessions.find((t) => t.id === item.toolboxId)
          const snap = snapshots.find((s) => s.id === item.snapshotId)

          return (
            <article
              key={item.id}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {worker?.name ?? 'Unknown worker'}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {item.date} {item.time} · {toolbox?.title}
                  </p>
                </div>
                <Badge tone={item.reviewed ? 'green' : 'red'}>
                  {item.reviewed ? 'Reviewed' : 'Pending review'}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                {snap && (
                  <img
                    src={snap.previewUrl}
                    alt=""
                    className="h-16 w-24 rounded-xl object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Missing: {item.missingPpe.join(', ')}
                  </p>
                  <p className="text-sm text-gray-500">{item.notes}</p>
                  <div className="mt-2 flex gap-3 text-sm font-semibold">
                    <Link to={`/workers/${worker?.id}`} className="text-accent">
                      Worker profile
                    </Link>
                    <Link to="/evidence" className="text-accent">
                      Evidence
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
