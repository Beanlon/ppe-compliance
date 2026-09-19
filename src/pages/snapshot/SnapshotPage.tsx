import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Camera } from 'lucide-react'
import { AppPageFrame } from '@/components/layout/AppPageFrame'
import { useSite } from '@/context/SiteContext'
import { getSnapshotDetail } from '@/data/mock'
import type { PersonDetection } from '@/types'
import { DetectionSidebar } from './components/DetectionSidebar'
import { RecentSnapshotsStrip } from './components/RecentSnapshotsStrip'
import { SnapshotAnnotatedImage } from './components/SnapshotAnnotatedImage'

export function SnapshotPage() {
  const { snapshotId = '' } = useParams()
  const navigate = useNavigate()
  const { reportDetection, reports } = useSite()
  const detail = useMemo(() => getSnapshotDetail(snapshotId), [snapshotId])
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)

  const reportedPersonIds = useMemo(() => {
    if (!detail) return new Set<string>()
    return new Set(
      reports
        .filter((r) => r.snapshotId === detail.id)
        .map((r) => r.personDetectionId),
    )
  }, [reports, detail])

  useEffect(() => {
    setSelectedPersonId(detail?.people[0]?.id ?? null)
  }, [detail])

  function handleReportPerson(person: PersonDetection) {
    if (!detail || person.status === 'compliant') return
    if (reportedPersonIds.has(person.id)) return
    reportDetection({
      snapshotId: detail.id,
      personLabel: person.label,
      personDetectionId: person.id,
    })
  }

  if (!detail) {
    return (
      <AppPageFrame>
        <div className="border-b border-gray-200 px-3 py-2.5">
          <Link
            to="/records"
            className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-semibold text-muted hover:bg-gray-50 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Records
          </Link>
        </div>
        <div className="px-3 py-5">
          <h1 className="text-xl font-bold text-ink">Snapshot not found</h1>
          <p className="mt-1 text-sm text-muted">
            It may have been removed from records.
          </p>
        </div>
      </AppPageFrame>
    )
  }

  return (
    <AppPageFrame>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
            <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-200 px-2.5 py-2 sm:px-3 sm:py-2.5">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-semibold text-muted transition hover:bg-gray-50 hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <span className="hidden h-4 w-px bg-gray-200 sm:block" />
              <h1 className="min-w-0 truncate text-base font-bold text-ink sm:text-lg">
                {detail.snapshotId}
              </h1>
              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-ink sm:text-sm">
                  <Camera className="h-3.5 w-3.5 text-muted" />
                  {detail.cameraLabel}
                </span>
                <span className="text-xs text-muted sm:text-sm">
                  {detail.date} · {detail.time}
                </span>
                <OverallStatus
                  status={detail.status}
                  violations={detail.violationCount}
                />
              </div>
            </header>

            <SnapshotAnnotatedImage
              detail={detail}
              selectedPersonId={selectedPersonId}
              onSelectPerson={setSelectedPersonId}
            />

            <section className="shrink-0 border-t border-gray-200 px-2.5 py-2.5 sm:px-3 sm:py-3">
              <h2 className="text-sm font-bold text-ink sm:text-base">
                Detection legend
              </h2>
              <p className="mt-1 text-xs text-muted sm:text-sm">
                Outer boxes mark each person; inner boxes mark that person’s PPE.
              </p>
              <Legend />
            </section>
          </div>

          <aside className="@container/detections flex min-h-[16rem] w-full shrink-0 flex-col self-stretch border-t border-gray-200 lg:min-h-0 lg:w-[clamp(11.5rem,28vw,18rem)] lg:max-w-[40%] lg:border-l lg:border-t-0 xl:w-[300px] xl:max-w-none 2xl:w-[360px]">
            <DetectionSidebar
              detail={detail}
              selectedPersonId={selectedPersonId}
              onSelectPerson={setSelectedPersonId}
              onReportPerson={handleReportPerson}
              reportedPersonIds={reportedPersonIds}
            />
          </aside>
        </div>

        <RecentSnapshotsStrip currentId={detail.id} />
      </div>
    </AppPageFrame>
  )
}

function OverallStatus({
  status,
  violations,
}: {
  status: string
  violations: number
}) {
  if (status === 'compliant') {
    return (
      <span className="rounded-md bg-compliant px-2 py-1 text-xs font-bold uppercase tracking-wide text-compliant-text">
        Compliant
      </span>
    )
  }
  return (
    <span className="rounded-md bg-[#fecaca] px-2 py-1 text-xs font-bold uppercase tracking-wide text-[#9f1239]">
      Non-compliant · {violations} gaps
    </span>
  )
}

function Legend() {
  return (
    <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted sm:text-sm">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm border-2 border-[#4ade80]" />
        Person (compliant)
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm border-2 border-[#ef4444]" />
        Person (non-compliant)
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm border-2 border-[#3b82f6]" />
        PPE detected
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm border-2 border-[#f59e0b]" />
        PPE partial / incomplete
      </span>
    </div>
  )
}
