import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { workers, violations, toolboxSessions } from '@/data/mock'

export function WorkerDetailPage() {
  const { workerId } = useParams()
  const worker = workers.find((w) => w.id === workerId)

  if (!worker) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="font-semibold">Worker not found.</p>
        <Link to="/workers" className="mt-2 inline-block text-accent">
          Back to workers
        </Link>
      </div>
    )
  }

  const history = violations.filter((v) => v.workerId === worker.id)

  return (
    <div className="space-y-6">
      <div>
        <Link to="/workers" className="text-sm font-semibold text-accent">
          ← Workers
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
          {worker.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Compliance history and toolbox attendance profile.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Employee ID</p>
          <p className="mt-1 text-lg font-bold">{worker.employeeId}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Trade</p>
          <p className="mt-1 text-lg font-bold">{worker.trade}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Violations</p>
          <p className="mt-1 text-lg font-bold">{worker.violationCount}</p>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Violation History</h2>
        <ul className="space-y-3">
          {history.length === 0 && (
            <li className="text-sm text-gray-500">No violations recorded.</li>
          )}
          {history.map((item) => {
            const toolbox = toolboxSessions.find((t) => t.id === item.toolboxId)
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {item.missingPpe.join(', ')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.date} {item.time} · {toolbox?.title ?? 'Toolbox'}
                  </p>
                </div>
                <Badge tone={item.reviewed ? 'green' : 'red'}>
                  {item.reviewed ? 'Reviewed' : 'Pending'}
                </Badge>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
