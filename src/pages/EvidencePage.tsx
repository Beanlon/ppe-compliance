import { Badge } from '@/components/ui/Badge'
import { snapshots } from '@/data/mock'

export function EvidencePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-950">
          Review Evidence
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          AI-analyzed snapshots stored as evidence (mock detection results).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {snapshots.map((snap) => (
          <article
            key={snap.id}
            className="overflow-hidden rounded-2xl bg-white shadow-sm"
          >
            <img
              src={snap.previewUrl}
              alt={snap.snapshotId}
              className="h-40 w-full object-cover"
            />
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-gray-900">{snap.snapshotId}</p>
                <Badge tone={snap.violationCount ? 'red' : 'green'}>
                  {snap.violationCount ? 'Non-compliant' : 'Compliant'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {snap.date} · {snap.time}
              </p>
              <p className="text-sm text-gray-600">
                Mock accuracy score:{' '}
                <span className="font-semibold">{snap.accuracy}%</span>
              </p>
              <p className="text-xs text-gray-400">
                YOLOv8 detection placeholder — frontend mock only.
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
