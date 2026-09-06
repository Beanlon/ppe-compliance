import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'dark' | 'ghost'
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[#4ade80] text-white hover:bg-[#22c55e] shadow-sm',
  secondary:
    'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50',
  dark: 'bg-[#14161f] text-white hover:bg-black',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
