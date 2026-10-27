import { Boxes } from 'lucide-react'
import type { FrameDetection } from '@/lib/detectApi'
import type { LiveDetectionStatus } from '@/hooks/useLiveDetection'
import type { PersonDetection } from '@/types'

type Props = {
  detections: FrameDetection[]
  people: PersonDetection[]
  status: LiveDetectionStatus
  error?: string
  modelName?: string
  device?: string
}

const CLASS_ORDER = [
  'person',
  'helmet',
  'gloves',
  'high_visibility',
  'boots',
  'safety_glasses',
  'harness',
]

export function ComplianceBenchmarkCard({
  detections,
  people,
  status,
  error = '',
  modelName = 'RT-DETR-L',
  device = '',
}: Props) {
  const counts = countByClass(detections)
  const total = detections.length
  const rows = orderedCounts(counts)
  const live = status === 'running' || status === 'ready'
  const waiting =
    status === 'idle' || status === 'checking' || status === 'ready'
  const failed = status === 'offline' || status === 'error'
  const compliant = people.filter((p) => p.status === 'compliant').length
  const nonCompliant = people.filter((p) => p.status === 'non_compliant').length
  const needsChecking = people.filter((p) => p.status === 'needs_checking').length

  return (
    <section className="flex w-full flex-col border-t border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-bold text-ink sm:text-lg">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#e0e7ff] text-[#4338ca]">
            <Boxes className="h-4 w-4" strokeWidth={2.25} />
          </span>
          Live detections
        </h2>
        <p className="text-xs font-semibold tabular-nums text-muted sm:text-sm">
          {total} {total === 1 ? 'box' : 'boxes'}
          {live && modelName ? (
            <span className="font-medium">
              {' '}
              · {modelName}
              {device ? ` · ${device}` : ''}
            </span>
          ) : null}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200">
        <StatusPill label="Compliant" value={compliant} color="#22c55e" />
        <StatusPill
          label="Non-compliant"
          value={nonCompliant}
          color="#f87171"
        />
        <StatusPill
          label="Needs checking"
          value={needsChecking}
          color="#fb923c"
        />
      </div>

      {failed ? (
        <p className="mt-4 text-sm text-muted">
          {error || 'Detector offline — start with npm run detect.'}
        </p>
      ) : waiting && total === 0 ? (
        <p className="mt-4 text-sm text-muted">
          {status === 'checking'
            ? 'Checking detector…'
            : status === 'ready'
              ? 'Waiting for the first frame…'
              : 'Start the camera to see detected boxes.'}
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No boxes in the current frame.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {rows.map(({ className, count }) => (
            <li
              key={className}
              className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5"
            >
              <span className="min-w-0 truncate text-sm font-semibold capitalize text-ink">
                {formatClass(className)}
              </span>
              <span className="shrink-0 text-sm font-bold tabular-nums text-navy">
                {count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function StatusPill({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-50/80 px-2 py-3 text-center sm:py-4">
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {value}
      </span>
      <span
        className="mt-2 text-xs font-semibold leading-tight sm:text-sm"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  )
}

function countByClass(detections: FrameDetection[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const detection of detections) {
    counts.set(detection.class, (counts.get(detection.class) ?? 0) + 1)
  }
  return counts
}

function orderedCounts(counts: Map<string, number>) {
  const known = CLASS_ORDER.filter((name) => counts.has(name)).map(
    (className) => ({ className, count: counts.get(className) ?? 0 }),
  )
  const extras = [...counts.keys()]
    .filter((name) => !CLASS_ORDER.includes(name))
    .sort()
    .map((className) => ({ className, count: counts.get(className) ?? 0 }))
  return [...known, ...extras]
}

function formatClass(name: string) {
  return name.replaceAll('_', ' ')
}
