import { Briefcase } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { toolboxSessions, workSessions, workers } from '@/data/mock'

export function ActiveToolboxCard() {
  const active = workSessions.find((s) => s.status === 'active')
  const toolbox = toolboxSessions.find((t) => t.id === active?.toolboxId)

  if (!toolbox || !active) {
    return (
      <article className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Active Toolbox</h2>
        <p className="mt-2 text-sm text-gray-500">
          No active work session. Create a toolbox to start PPE monitoring.
        </p>
      </article>
    )
  }

  const attendees = workers.filter((w) => toolbox.attendeeIds.includes(w.id))

  return (
    <article className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-brand">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Active Toolbox</h2>
            <p className="text-xs text-gray-500">
              {toolbox.date} · {toolbox.time}
            </p>
          </div>
        </div>
        <Badge tone="green">Live</Badge>
      </div>

      <p className="text-sm font-semibold text-ink">{toolbox.title}</p>
      <p className="mt-1 text-xs text-gray-500">{toolbox.location}</p>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Required PPE
        </p>
        <div className="flex flex-wrap gap-2">
          {toolbox.requiredPpe.map((item) => (
            <span
              key={item}
              className="rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-green-900"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-100 pt-4 text-sm">
        <div>
          <p className="text-xs text-gray-500">Attendance</p>
          <p className="font-bold text-ink">{attendees.length} workers</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Snapshots</p>
          <p className="font-bold text-ink">{active.snapshotCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Violations</p>
          <p className="font-bold text-ink">{active.violationCount}</p>
        </div>
      </div>
    </article>
  )
}
