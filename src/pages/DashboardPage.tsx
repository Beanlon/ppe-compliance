import { Camera, Percent, TriangleAlert, Users } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { LocationCard } from '@/components/dashboard/LocationCard'
import { RecentAnalyses } from '@/components/dashboard/RecentAnalyses'
import { ActiveToolboxCard } from '@/components/dashboard/ActiveToolboxCard'
import { PendingReviewsCard } from '@/components/dashboard/PendingReviewsCard'
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-brand-dark" />}
          badge={`${dashboardStats.currentWorkers} on site`}
          badgeTone="green"
          label="Total Workers"
          value={`${dashboardStats.totalWorkers}`}
        />
        <StatCard
          icon={<Percent className="h-5 w-5 text-brand-dark" />}
          badge={`${dashboardStats.workersCheckedToday} checked today`}
          badgeTone="green"
          label="Compliance Rate"
          value={`${dashboardStats.complianceRate}%`}
        />
        <StatCard
          icon={<Camera className="h-5 w-5 text-gray-600" />}
          badge={`${dashboardStats.snapshotsToday} today`}
          badgeTone="gray"
          label="Total Snapshots"
          value={`${dashboardStats.totalSnapshots}`}
        />
        <StatCard
          dark
          icon={<TriangleAlert className="h-5 w-5 text-alert" />}
          badge={`${dashboardStats.pendingReviews} pending review`}
          badgeTone="pink"
          label="Total Violations"
          value={`${dashboardStats.totalViolations}`}
        />
      </div>

      <LocationCard />

      <div className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
        <RecentAnalyses />
        <ActiveToolboxCard />
        <PendingReviewsCard />
      </div>
    </div>
  )
}
