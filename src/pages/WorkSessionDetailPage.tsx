import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import {
  snapshots,
  toolboxSessions,
  violations,
  workSessions,
  workers,
} from '@/data/mock'

export function WorkSessionDetailPage() {
  const { sessionId } = useParams()
  const session = workSessions.find((s) => s.id === sessionId)
  const toolbox = toolboxSessions.find((t) => t.id === session?.toolboxId)

  if (!session || !toolbox) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="font-semibold">Work session not found.</p>
        <Link to="/work-sessions" className="mt-2 inline-block text-accent">
          Back
        </Link>
      </div>
    )
  }

  const sessionSnapshots = snapshots.filter(
    (s) => s.workSessionId === session.id,
  )
  const attendees = workers.filter((w) => toolbox.attendeeIds.includes(w.id))
  const sessionViolations = violations.filter(
    (v) => v.toolboxId === toolbox.id,
  )

  return (
    <div className="space-y-6">
      <div>
        <Link to="/work-sessions" className="text-sm font-semibold text-accent">
          ← Work Sessions
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
          {toolbox.title}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review toolbox attendance, mock AI snapshot results, and violations.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">Required PPE</h2>
          <div className="flex flex-wrap gap-2">
            {toolbox.requiredPpe.map((item) => (
              <Badge key={item} tone="green">
                {item}
              </Badge>
            ))}
          </div>
          <h2 className="mb-3 mt-6 text-lg font-bold">Attendance</h2>
          <ul className="space-y-2">
            {attendees.map((worker) => (
              <li
                key={worker.id}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm"
              >
                <span className="font-medium">{worker.name}</span>
                <Link
                  to={`/workers/${worker.id}`}
                  className="font-semibold text-accent"
                >
                  Profile
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">Snapshot results (mock)</h2>
          <ul className="space-y-3">
            {sessionSnapshots.map((snap) => (
              <li
                key={snap.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={snap.previewUrl}
                    alt=""
                    className="h-10 w-14 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold">{snap.snapshotId}</p>
                    <p className="text-xs text-gray-500">
                      Accuracy {snap.accuracy}%
                    </p>
                  </div>
                </div>
                <Badge tone={snap.violationCount ? 'red' : 'green'}>
                  {snap.violationCount
                    ? `${snap.violationCount} violations`
                    : 'Compliant'}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-bold">Recorded violations</h2>
        <ul className="space-y-3">
          {sessionViolations.map((item) => {
            const worker = workers.find((w) => w.id === item.workerId)
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3"
              >
                <div>
                  <p className="font-semibold">
                    {worker?.name} · {item.missingPpe.join(', ')}
                  </p>
                  <p className="text-sm text-gray-500">{item.notes}</p>
                </div>
                <Badge tone={item.reviewed ? 'green' : 'red'}>
                  {item.reviewed ? 'Reviewed' : 'Needs review'}
                </Badge>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
