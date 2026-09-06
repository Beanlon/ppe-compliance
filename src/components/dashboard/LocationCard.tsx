import { MapPin } from 'lucide-react'
import { siteInfo } from '@/data/mock'

export function LocationCard() {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-lg font-bold text-gray-900">Location</h2>
      </div>
      <div className="px-5 pt-4">
        <div className="overflow-hidden rounded-xl">
          <img
            src={siteInfo.mapImage}
            alt="Site satellite map"
            className="h-56 w-full object-cover"
          />
        </div>
      </div>
      <div className="m-5 mt-4 flex items-start gap-3 rounded-xl bg-[#f3f4f6] px-4 py-3">
        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <p className="text-sm font-medium leading-snug text-gray-700">
          {siteInfo.address}
        </p>
      </div>
    </article>
  )
}
