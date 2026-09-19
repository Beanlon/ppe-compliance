import type { ReactNode } from 'react'
import { Building2, CalendarDays, MapPin, Users } from 'lucide-react'
import { useSite } from '@/context/SiteContext'
import { siteInfo } from '@/data/mock'

export function TodaysSummaryCard() {
  const { toolbox, projectName, projectId } = useSite()

  return (
    <section className="flex w-full flex-col border-t border-gray-200 bg-white p-4">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink sm:text-lg">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#ffedd5] text-[#FF6A1A]">
          <CalendarDays className="h-4 w-4" strokeWidth={2.25} />
        </span>
        Site information
      </h2>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoRow
          icon={<Building2 className="h-3.5 w-3.5" />}
          label="Project"
          value={`${projectName} · ${projectId}`}
        />
        <InfoRow
          icon={<MapPin className="h-3.5 w-3.5" />}
          label="Site address"
          value={toolbox?.siteAddressName ?? siteInfo.address}
        />
        {toolbox ? (
          <>
            <InfoRow
              label="Contractor"
              value={toolbox.contractorCompanyName}
            />
            <InfoRow
              label="Work type"
              value={toolbox.workType === 'arboreal' ? 'Arboreal' : 'Ground'}
            />
            <InfoRow
              label="Date of application"
              value={toolbox.dateOfApplication}
            />
            <InfoRow
              label="Time of application"
              value={toolbox.timeOfApplication}
            />
            <InfoRow label="Permit receiver" value={toolbox.permitReceiver} />
            <InfoRow
              icon={<Users className="h-3.5 w-3.5" />}
              label="Workers assigned"
              value={`${toolbox.workers.length} on this session`}
            />
          </>
        ) : (
          <>
            <InfoRow label="Current date" value={siteInfo.currentDate} />
            <InfoRow label="Current time" value={siteInfo.currentTime} />
          </>
        )}
      </dl>
    </section>
  )
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-lg border border-gray-100 bg-surface/50 px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-semibold text-ink">{value}</dd>
    </div>
  )
}
