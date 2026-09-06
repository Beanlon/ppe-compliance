import { MapPin } from 'lucide-react'
import { siteInfo } from '@/data/mock'

export function LocationCard() {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="grid gap-0 md:grid-cols-[1fr_280px]">
        <div className="p-5 pb-5 md:pb-5">
          <div className="overflow-hidden rounded-xl">
            <img
              src={siteInfo.mapImage}
              alt="Site satellite map"
              className="h-52 w-full object-cover md:h-64"
            />
          </div>
        </div>
        <div className="flex items-end p-5 pt-0 md:items-center md:border-l md:border-gray-100 md:p-6">
          <div className="flex w-full items-start gap-3 rounded-xl bg-[#f3f4f6] px-4 py-3 md:bg-transparent md:px-0">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-bold text-gray-900">Location</p>
              <p className="mt-1 text-sm font-medium leading-snug text-gray-700">
                {siteInfo.address}
              </p>
              <p className="mt-2 text-xs text-gray-500">{siteInfo.name}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
