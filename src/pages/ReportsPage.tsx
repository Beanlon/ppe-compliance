import { dashboardStats, violations, workers, workSessions } from '@/data/mock'
import { Button } from '@/components/ui/Button'

export function ReportsPage() {
  const pendingReviews = violations.filter((v) => !v.reviewed).length
  const activeWorkers = workers.filter((w) => w.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Generate Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Project-level PPE compliance summary for officers and engineers.
          </p>
        </div>
        <Button type="button">Download PDF (mock)</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Active workers', value: activeWorkers },
          { label: 'Work sessions', value: workSessions.length },
          { label: 'Total violations', value: dashboardStats.totalViolations },
          { label: 'Pending reviews', value: pendingReviews },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">Compliance summary</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
          Mock report: site compliance is tracked from toolbox-required PPE
          against snapshot assessments. Non-compliant and uncertain results are
          routed to manual review, then attached to worker profiles and toolbox
          history. AI model integration is deferred — all metrics here use
          static front-end data.
        </p>
      </section>
    </div>
  )
}
