import { CalendarDays } from 'lucide-react'
import { siteInfo } from '@/data/mock'

export function TodaysSummaryCard() {
  return (
    <section className="flex w-full flex-col border-t border-gray-200 bg-white p-4">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink sm:text-lg">
        <span className="inline-flex h-8 w-8 rounded-md items-center justify-center bg-[#ffedd5] text-[#FF6A1A]">
          <CalendarDays className="h-4 w-4" strokeWidth={2.25} />
        </span>
        Today&apos;s Summary
      </h2>

      <p className="mt-3 text-sm font-bold leading-snug text-ink sm:text-base">
        {siteInfo.address}
      </p>

      <div className="mt-3 space-y-1.5 text-sm">
        <p>
          <span className="text-muted">Current Date: </span>
          <span className="font-semibold text-ink">{siteInfo.currentDate}</span>
        </p>
        <p>
          <span className="text-muted">Current Time: </span>
          <span className="font-semibold text-ink">{siteInfo.currentTime}</span>
        </p>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-semibold text-ink">PPE Required:</p>
        <div className="flex flex-wrap gap-1">
          {siteInfo.requiredPpe.map((item) => (
            <span
              key={item}
              className="rounded-md bg-[#dcfce7] px-2.5 py-1 text-xs font-semibold text-[#166534]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
