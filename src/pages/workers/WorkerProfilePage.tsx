import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Flag, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useSite } from '@/context/SiteContext'
import type { WorkerReport } from '@/types'

export function WorkerProfilePage() {
  const { workerId = '' } = useParams()
  const navigate = useNavigate()
  const { workers, reports, projectName } = useSite()

  const worker = useMemo(
    () => workers.find((w) => w.id === workerId) ?? null,
    [workers, workerId],
  )

  const violations = useMemo(
    () => reports.filter((r) => r.workerId === workerId),
    [reports, workerId],
  )

  if (!worker) {
    return (
      <div className="w-full">
        <PageHeader title="Worker" subtitle="Profile not found" />
        <p className="text-sm text-muted">
          This worker is not registered on {projectName}.
        </p>
        <button
          type="button"
          onClick={() => navigate('/workers')}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workers
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => navigate('/workers')}
        className="mb-3 inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-semibold text-muted transition hover:bg-gray-50 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Workers
      </button>

      <PageHeader title={worker.name} subtitle={worker.role} />

      <article className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-surface text-navy">
            <UserRound className="h-8 w-8" strokeWidth={2.25} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-ink sm:text-xl">
              {worker.name}
            </h2>
            <p className="mt-1 text-sm text-muted">{worker.role}</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {worker.phone ? (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                    Phone
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-ink">
                    {worker.phone}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                  Project site
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">
                  {projectName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                  Past violations
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">
                  {violations.length}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </article>

      <section className="mt-5">
        <h3 className="text-base font-bold text-ink sm:text-lg">
          Past violations
        </h3>
        <p className="mt-1 text-sm text-muted">
          Reports filed from snapshot detections for this worker.
        </p>

        {violations.length > 0 ? (
          <ul className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {violations.map((report) => (
              <ViolationRow key={report.id} report={report} />
            ))}
          </ul>
        ) : null}
      </section>

      {violations.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center sm:px-5">
          <Flag className="mx-auto h-8 w-8 text-gray-300" strokeWidth={2} />
          <p className="mt-3 text-sm font-semibold text-ink">
            No past violations on record
          </p>
          <p className="mt-1 text-sm text-muted">
            This worker has a clean compliance history on this project site.
          </p>
        </div>
      ) : null}
    </div>
  )
}

function ViolationRow({ report }: { report: WorkerReport }) {
  const when = formatReportDate(report.createdAt)

  return (
    <li>
      <Link
        to={`/snapshots/${report.snapshotId}`}
        className="flex flex-wrap items-start gap-3 px-4 py-3.5 transition hover:bg-gray-50 sm:px-5"
      >
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fef2f2] text-[#dc2626]">
          <Flag className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink">{report.reason}</p>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Linked from {report.personLabel} · Snapshot {report.snapshotId}
          </p>
          <p className="mt-1 text-xs text-muted">{when}</p>
        </div>
        <span className="rounded-md bg-[#fecaca] px-2 py-1 text-xs font-bold uppercase tracking-wide text-[#9f1239]">
          Reported
        </span>
      </Link>
    </li>
  )
}

function formatReportDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}
