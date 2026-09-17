import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSite } from '@/context/SiteContext'
import { CreateToolboxOverlay } from '@/components/toolbox/CreateToolboxOverlay'
import { LiveFeedCard } from './components/LiveFeedCard'
import { ComplianceBenchmarkCard } from './components/ComplianceBenchmarkCard'
import { TodaysSummaryCard } from './components/TodaysSummaryCard'
import { RecentSnapshotsCard } from './components/RecentSnapshotsCard'

export function LiveFeedPage() {
  const { justLoggedIn, consumeJustLoggedIn } = useAuth()
  const { hasToolbox } = useSite()
  const [overlayOpen, setOverlayOpen] = useState(false)

  // Show the create-toolbox overlay only right after login, and only when
  // there is no active work session. Ending a session does not re-open it.
  // Logging back in with an active session continues the live feed silently.
  useEffect(() => {
    if (!justLoggedIn) return
    if (!hasToolbox) setOverlayOpen(true)
    consumeJustLoggedIn()
  }, [justLoggedIn, hasToolbox, consumeJustLoggedIn])

  return (
    <div className="-mx-3 -my-3 border border-gray-200 bg-white sm:-mx-4 sm:-my-4 lg:-mx-5 lg:-my-5 xl:-mx-8 xl:-my-6 2xl:-mx-10 2xl:-my-8">
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col">
          <LiveFeedCard active={hasToolbox} />
          {hasToolbox ? (
            <>
              <ComplianceBenchmarkCard />
              <TodaysSummaryCard />
            </>
          ) : (
            <div className="border-t border-gray-200 bg-white px-3 py-8 sm:px-4 sm:py-10">
              <p className="text-center text-sm font-semibold text-ink">
                Live monitoring is locked
              </p>
              <p className="mx-auto mt-1 max-w-md text-center text-sm text-muted">
                Generate today’s toolbox talk to unlock the camera feed,
                compliance benchmark, and site summary.
              </p>
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setOverlayOpen(true)}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-navy px-5 text-sm font-semibold text-white transition hover:bg-[#24314d]"
                >
                  Create toolbox
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="@container/snapshots flex w-full min-h-0 shrink-0 flex-col self-stretch border-t border-gray-200 lg:w-[clamp(11.5rem,28vw,18rem)] lg:max-w-[40%] lg:border-l lg:border-t-0 xl:w-[300px] xl:max-w-none 2xl:w-[360px]">
          {hasToolbox ? (
            <RecentSnapshotsCard />
          ) : (
            <div className="flex flex-1 items-center justify-center bg-white px-4 py-10">
              <p className="text-center text-sm text-muted">
                Recent snapshots appear after a toolbox talk is on record.
              </p>
            </div>
          )}
        </aside>
      </div>

      <CreateToolboxOverlay
        open={!hasToolbox && overlayOpen}
        dismissible
        onClose={() => setOverlayOpen(false)}
      />
    </div>
  )
}
