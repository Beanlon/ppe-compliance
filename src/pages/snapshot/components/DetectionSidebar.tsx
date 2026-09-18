import { CheckCircle2, Flag, UserRound, XCircle } from 'lucide-react'
import { describePpeGap } from '@/data/mock'
import type { PersonDetection, PpeDetection, SnapshotDetail } from '@/types'

interface DetectionSidebarProps {
  detail: SnapshotDetail
  selectedPersonId: string | null
  onSelectPerson: (personId: string) => void
  onReportPerson?: (person: PersonDetection) => void
  reportedPersonIds?: Set<string>
}

export function DetectionSidebar({
  detail,
  selectedPersonId,
  onSelectPerson,
  onReportPerson,
  reportedPersonIds,
}: DetectionSidebarProps) {
  const selected =
    detail.people.find((p) => p.id === selectedPersonId) ?? detail.people[0]

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col bg-white">
      <div className="shrink-0 border-b border-gray-200 px-2.5 py-2 @[16rem]/detections:px-3 @[16rem]/detections:py-2.5">
        <h2 className="truncate text-sm font-bold text-ink sm:text-base">
          Detections
        </h2>
        <p className="mt-0.5 text-xs text-muted @[16rem]/detections:text-sm">
          {detail.people.length}{' '}
          {detail.people.length === 1 ? 'person' : 'people'} ·{' '}
          {detail.violationCount}{' '}
          {detail.violationCount === 1 ? 'gap' : 'gaps'}
        </p>
      </div>

      <div className="scrollbar-hidden flex shrink-0 gap-1.5 overflow-x-auto border-b border-gray-200 px-2 py-2 @[16rem]/detections:px-2.5">
        {detail.people.map((person) => {
          const active = person.id === selected?.id
          return (
            <button
              key={person.id}
              type="button"
              onClick={() => onSelectPerson(person.id)}
              className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition @[16rem]/detections:text-sm ${
                active
                  ? 'border-ink bg-ink text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <UserRound className="h-3.5 w-3.5" />
              {person.label}
            </button>
          )
        })}
      </div>

      {selected ? (
        <PersonDetail
          person={selected}
          requiredPpe={detail.requiredPpe}
          reported={reportedPersonIds?.has(selected.id) ?? false}
          onReport={onReportPerson ? () => onReportPerson(selected) : undefined}
        />
      ) : (
        <p className="p-2.5 text-sm text-muted">No people detected in this snapshot.</p>
      )}
    </section>
  )
}

function PersonDetail({
  person,
  requiredPpe,
  onReport,
  reported,
}: {
  person: PersonDetection
  requiredPpe: string[]
  onReport?: () => void
  reported: boolean
}) {
  const detected = person.ppe.filter((p) => isFullyDetected(p))
  const gaps = person.ppe.filter((p) => !isFullyDetected(p))
  const compliant = person.status === 'compliant'

  return (
    <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto p-2.5 @[16rem]/detections:p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-ink @[16rem]/detections:text-lg">
            {person.label}
          </h3>
          <p className="mt-0.5 text-xs leading-snug text-muted @[16rem]/detections:text-sm">
            Required: {requiredPpe.join(', ')}
          </p>
        </div>
        <StatusPill status={person.status} />
      </div>

      {onReport ? (
        <button
          type="button"
          onClick={onReport}
          disabled={compliant || reported}
          title={
            compliant
              ? 'Compliant detections cannot be reported'
              : reported
                ? 'Already reported'
                : 'Report this PPE detection'
          }
          className={`mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
            compliant || reported
              ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
              : 'border-gray-200 bg-white text-ink hover:bg-gray-50'
          }`}
        >
          <Flag
            className={`h-4 w-4 ${
              compliant || reported ? 'text-gray-400' : 'text-accent'
            }`}
            strokeWidth={2.25}
          />
          {reported ? 'Reported' : 'Report'}
        </button>
      ) : null}

      <section className="mt-3 border-t border-gray-200 pt-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wide text-ink">
          PPE detected
        </h4>
        {detected.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No required PPE fully detected.</p>
        ) : (
          <ul className="mt-2 overflow-hidden rounded-md border border-gray-200 divide-y divide-gray-100">
            {detected.map((item) => (
              <li key={item.id} className="flex items-start gap-2 px-2.5 py-2">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]"
                  strokeWidth={2.25}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{item.label}</p>
                  <p className="text-xs text-muted">
                    {countLabel(item)}
                    {item.confidence != null
                      ? ` · ${(item.confidence * 100).toFixed(0)}%`
                      : null}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-3 border-t border-gray-200 pt-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wide text-ink">
          Missing / incomplete
        </h4>
        {gaps.length === 0 ? (
          <p className="mt-2 text-sm text-[#166534]">
            All required PPE detected for this person.
          </p>
        ) : (
          <ul className="mt-2 overflow-hidden rounded-md border border-[#fecaca] divide-y divide-[#fecaca]">
            {gaps.map((item) => {
              const gap = describePpeGap(item)
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-2 bg-[#fef2f2] px-2.5 py-2"
                >
                  <XCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#dc2626]"
                    strokeWidth={2.25}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{item.label}</p>
                    <p className="text-xs font-medium text-[#9f1239]">
                      {gap ?? `${item.label} not detected`}
                    </p>
                    {item.detectedCount != null && item.requiredCount != null ? (
                      <p className="mt-0.5 text-xs text-muted">
                        Found {item.detectedCount} of {item.requiredCount} required
                      </p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function isFullyDetected(item: PpeDetection): boolean {
  if (
    item.requiredCount != null &&
    item.detectedCount != null &&
    item.detectedCount < item.requiredCount
  ) {
    return false
  }
  return item.detected
}

function countLabel(item: PpeDetection): string {
  if (item.requiredCount != null && item.detectedCount != null) {
    return `${item.detectedCount}/${item.requiredCount} detected`
  }
  return 'Detected'
}

function StatusPill({ status }: { status: PersonDetection['status'] }) {
  if (status === 'compliant') {
    return (
      <span className="inline-flex shrink-0 rounded-md bg-compliant px-2 py-1 text-xs font-bold uppercase tracking-wide text-compliant-text">
        Compliant
      </span>
    )
  }
  if (status === 'needs_checking') {
    return (
      <span className="inline-flex shrink-0 rounded-md bg-[#fef3c7] px-2 py-1 text-xs font-bold uppercase tracking-wide text-[#92400e]">
        Needs checking
      </span>
    )
  }
  return (
    <span className="inline-flex shrink-0 rounded-md bg-[#fecaca] px-2 py-1 text-xs font-bold uppercase tracking-wide text-[#9f1239]">
      Non-compliant
    </span>
  )
}
