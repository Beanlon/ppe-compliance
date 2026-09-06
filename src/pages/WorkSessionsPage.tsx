import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { toolboxSessions, workSessions } from '@/data/mock'

export function WorkSessionsPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Work Sessions
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Toolbox info, attendance, AI results, and violations per session.
          </p>
        </div>
        <Button type="button" onClick={() => navigate('/toolbox/create')}>
          + Create Toolbox
        </Button>
      </div>

      <div className="grid gap-4">
        {workSessions.map((session) => {
          const toolbox = toolboxSessions.find((t) => t.id === session.toolboxId)
          return (
            <article
              key={session.id}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {toolbox?.title ?? 'Toolbox session'}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Started {session.startedAt}
                    {session.endedAt ? ` · Ended ${session.endedAt}` : ''}
                  </p>
                </div>
                <Badge tone={session.status === 'active' ? 'green' : 'gray'}>
                  {session.status}
                </Badge>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500">Attendance</p>
                  <p className="text-lg font-bold">
                    {toolbox?.attendeeIds.length ?? 0} workers
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500">Snapshots</p>
                  <p className="text-lg font-bold">{session.snapshotCount}</p>
                </div>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500">Violations</p>
                  <p className="text-lg font-bold">{session.violationCount}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/work-sessions/${session.id}`}
                  className="rounded-full bg-sidebar px-4 py-2 text-sm font-semibold text-white"
                >
                  Open session
                </Link>
                {session.status === 'active' && (
                  <span className="rounded-full bg-alert-soft px-4 py-2 text-sm font-semibold text-red-800">
                    Live capture (mock)
                  </span>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
