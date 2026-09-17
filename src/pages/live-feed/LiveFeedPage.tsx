import { LiveFeedCard } from './components/LiveFeedCard'
import { ComplianceBenchmarkCard } from './components/ComplianceBenchmarkCard'
import { TodaysSummaryCard } from './components/TodaysSummaryCard'
import { RecentSnapshotsCard } from './components/RecentSnapshotsCard'

export function LiveFeedPage() {
  return (
    <div className="-mx-3 -my-3 border border-gray-200 bg-white sm:-mx-4 sm:-my-4 lg:-mx-5 lg:-my-5 xl:-mx-8 xl:-my-6 2xl:-mx-10 2xl:-my-8">
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col">
          <LiveFeedCard />
          <ComplianceBenchmarkCard />
          <TodaysSummaryCard />
        </div>

        <aside className="@container/snapshots flex w-full min-h-0 shrink-0 flex-col self-stretch border-t border-gray-200 lg:w-[clamp(11.5rem,28vw,18rem)] lg:max-w-[40%] lg:border-l lg:border-t-0 xl:w-[300px] xl:max-w-none 2xl:w-[360px]">
          <RecentSnapshotsCard />
        </aside>
      </div>
    </div>
  )
}
