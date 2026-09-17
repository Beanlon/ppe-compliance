/** Dual-tone PPE icons inspired by SVG Repo style (brown outline + peach accents). */

const OUTLINE = '#6B5344'
const ACCENT = '#FF9E67'
const OUTLINE_MUTED = '#9CA3AF'
const ACCENT_MUTED = '#D1D5DB'

type IconProps = {
  selected?: boolean
  className?: string
}

function tones(selected: boolean) {
  return {
    outline: selected ? OUTLINE : OUTLINE_MUTED,
    accent: selected ? ACCENT : ACCENT_MUTED,
  }
}

/** Matches the gloves-svgrepo dual-tone mark the user provided. */
export function GlovesIcon({ selected = true, className = 'h-6 w-6' }: IconProps) {
  const { outline, accent } = tones(selected)
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      <path
        d="M22 22V14c0-2.8 2.2-5 5-5h1.5c2.2 0 4 1.5 4.5 3.6L34 20l1.2-8.2C35.7 9 37.8 7.5 40 7.5h1c2.8 0 5 2.2 5 5V22l1-6c.5-2.5 2.8-4.2 5.3-4h.2c3 0 5.5 2.5 5.5 5.5V36c0 11-7.5 18.5-18.5 18.5H28C19.5 54.5 14 47 14 38.5V34c0-4.5 2.8-8.5 7-10z"
        stroke={outline}
        strokeWidth="4.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M21 30c-5.5.8-9.5 5.5-8.5 11 1 4.2 5 6.5 9 5.2"
        stroke={outline}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="26" y="12" width="5.5" height="15" rx="2.75" fill={accent} />
      <rect x="33.5" y="9" width="5.5" height="17" rx="2.75" fill={accent} />
      <rect x="41" y="11" width="5.5" height="15" rx="2.75" fill={accent} />
      <rect x="48.5" y="14" width="5.5" height="13" rx="2.75" fill={accent} />
      <rect x="24" y="42" width="22" height="6.5" rx="3.25" fill={accent} />
    </svg>
  )
}

export function SafetyVestIcon({
  selected = true,
  className = 'h-6 w-6',
}: IconProps) {
  const { outline, accent } = tones(selected)
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      <path
        d="M18 16l10 8h8l10-8 7 9-5 4v27H16V29l-5-4z"
        stroke={outline}
        strokeWidth="4.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M24 18c2 4 4 6 8 6s6-2 8-6"
        stroke={outline}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M20 32h24M20 42h24"
        stroke={accent}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M26 24l5 28M38 24l-5 28"
        stroke={accent}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SafetyShoesIcon({
  selected = true,
  className = 'h-6 w-6',
}: IconProps) {
  const { outline, accent } = tones(selected)
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      <path
        d="M10 42c2-12 9-18 18-20 5-1 9.5 1 11.5 5.5L42 32h10c5.5 0 10 4 10 9.5V48H10v-6z"
        stroke={outline}
        strokeWidth="4.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M10 48h52"
        stroke={outline}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M16 42c5-8 13-11 22-8"
        stroke={accent}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <rect x="30" y="24" width="9" height="12" rx="3.5" fill={accent} />
      <path
        d="M44 38h10"
        stroke={accent}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="18" cy="48" r="2.5" fill={accent} />
      <circle cx="28" cy="48" r="2.5" fill={accent} />
      <circle cx="48" cy="48" r="2.5" fill={accent} />
    </svg>
  )
}

export function HardHatIcon({ selected = true, className = 'h-6 w-6' }: IconProps) {
  const { outline, accent } = tones(selected)
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      <path
        d="M12 38c1-15 10-26 20-26s19 11 20 26"
        stroke={outline}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 40h48c-1 5-6 10-12 10H20c-6 0-11-5-12-10z"
        stroke={outline}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <path
        d="M32 14v24"
        stroke={accent}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M14 38h36"
        stroke={accent}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M22 22c3-3 7-4 10-4s7 1 10 4"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function HarnessIcon({ selected = true, className = 'h-6 w-6' }: IconProps) {
  const { outline, accent } = tones(selected)
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      <path
        d="M20 10c1 10-1 18-1 26M44 10c-1 10 1 18 1 26"
        stroke={outline}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M14 26h36M12 38h40M32 18v30"
        stroke={outline}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M20 48c4 4 8 6 12 6s8-2 12-6"
        stroke={outline}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="26" y="23" width="12" height="7" rx="2.5" fill={accent} />
      <rect x="25" y="35" width="14" height="7" rx="2.5" fill={accent} />
      <circle cx="32" cy="52" r="4.5" fill={accent} />
    </svg>
  )
}

export const PPE_ICON_MAP = {
  vest: SafetyVestIcon,
  shoes: SafetyShoesIcon,
  gloves: GlovesIcon,
  harness: HarnessIcon,
  hat: HardHatIcon,
} as const

export type PpeIconName = keyof typeof PPE_ICON_MAP
