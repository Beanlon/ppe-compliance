import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  tone?: 'green' | 'red' | 'gray' | 'pink' | 'dark'
  className?: string
}

const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
  green: 'bg-[#86efac] text-[#14532d]',
  red: 'bg-[#fca5a5] text-[#7f1d1d]',
  gray: 'bg-gray-200 text-gray-700',
  pink: 'bg-[#fecdd3] text-[#9f1239]',
  dark: 'bg-gray-800 text-white',
}

export function Badge({ children, tone = 'gray', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
