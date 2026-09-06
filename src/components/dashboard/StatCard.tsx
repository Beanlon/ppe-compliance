import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/Badge'

interface StatCardProps {
  icon: ReactNode
  badge: string
  badgeTone?: 'green' | 'gray' | 'pink'
  label: string
  value: string
  dark?: boolean
}

export function StatCard({
  icon,
  badge,
  badgeTone = 'gray',
  label,
  value,
  dark = false,
}: StatCardProps) {
  return (
    <article
      className={`rounded-2xl p-5 shadow-sm ${
        dark ? 'bg-[#14161f] text-white' : 'bg-white text-gray-900'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            dark ? 'bg-white/10' : 'bg-gray-100'
          }`}
        >
          {icon}
        </div>
        <Badge tone={badgeTone}>{badge}</Badge>
      </div>
      <p
        className={`text-sm font-medium ${dark ? 'text-white/70' : 'text-gray-500'}`}
      >
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
    </article>
  )
}
