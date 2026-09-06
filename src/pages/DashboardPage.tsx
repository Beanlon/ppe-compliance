import { Camera, TriangleAlert, Users } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { LocationCard } from '@/components/dashboard/LocationCard'
import { RecentAnalyses } from '@/components/dashboard/RecentAnalyses'
import { dashboardStats } from '@/data/mock'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Site Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of the conditions of PPE compliance on-site.
          </p>
        </div>
        <p className="text-sm font-medium text-gray-600">Sept. 06, 2026</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Users className="h-5 w-5 text-brand-dark" />}
          badge={`${dashboardStats.currentWorkers} current workers`}
          badgeTone="green"
          label="Total Workers"
          value={`${dashboardStats.totalWorkers} workers`}
        />
        <StatCard
          icon={<Camera className="h-5 w-5 text-gray-600" />}
          badge={`${dashboardStats.snapshotsToday} snapshots today`}
          badgeTone="gray"
          label="Total Snapshots"
          value={`${dashboardStats.totalSnapshots} snapshots`}
        />
        <StatCard
          dark
          icon={<TriangleAlert className="h-5 w-5 text-alert" />}
          badge={`${dashboardStats.violationsToday} violations today`}
          badgeTone="pink"
          label="Total Violations"
          value={`${dashboardStats.totalViolations} violations`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LocationCard />
        <RecentAnalyses />
      </div>
    </div>
  )
}
