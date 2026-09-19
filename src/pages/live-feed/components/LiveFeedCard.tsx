import { ChevronDown } from 'lucide-react'
import { siteInfo } from '@/data/mock'

const boxes = [
  { top: '14%', left: '16%', w: '17%', h: '52%', color: '#4ade80' },
  { top: '22%', left: '40%', w: '15%', h: '48%', color: '#4ade80' },
  { top: '18%', left: '60%', w: '16%', h: '50%', color: '#4ade80' },
  { top: '10%', left: '44%', w: '8%', h: '11%', color: '#ef4444' },
  { top: '12%', left: '22%', w: '7%', h: '10%', color: '#3b82f6' },
]

type LiveFeedCardProps = {
  /** When false, show a blank white panel instead of the camera feed */
  active?: boolean
}

export function LiveFeedCard({ active = true }: LiveFeedCardProps) {
  if (!active) {
    return (
      <div className="relative aspect-video w-full overflow-hidden border-b border-gray-100 bg-white">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <p className="text-sm font-semibold text-gray-400">No live feed</p>
          <p className="mt-1 text-xs text-gray-300">
            Waiting for today’s toolbox talk
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-[#1a1a1a]">
      <img
        src={siteInfo.liveFeedUrl}
        alt="Live site feed"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {boxes.map((box, i) => (
        <span
          key={i}
          className="pointer-events-none absolute border-[2.5px]"
          style={{
            top: box.top,
            left: box.left,
            width: box.w,
            height: box.h,
            borderColor: box.color,
          }}
        />
      ))}

      <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white sm:left-4 sm:top-4 sm:px-3 sm:text-sm">
        <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
        Live
      </div>

      <button
        type="button"
        className="absolute right-3 top-3 inline-flex max-w-[45%] items-center gap-1.5 truncate rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 sm:right-4 sm:top-4 sm:max-w-none sm:px-3 sm:text-sm"
      >
        <span className="truncate">{siteInfo.cameraLabel}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-500" />
      </button>
    </div>
  )
}
