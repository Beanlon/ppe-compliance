interface GearSightLogoProps {
  /** `onDark` = white marks for sidebar; `onLight` = dark marks for light backgrounds */
  variant?: 'onDark' | 'onLight'
  className?: string
}

/**
 * Linear GearSight lockup: icon + tall condensed wordmark.
 * Wordmark is HTML text (not SVG <text>) so "Sight" never clips.
 */
export function GearSightLogo({
  variant = 'onDark',
  className = '',
}: GearSightLogoProps) {
  const stroke = variant === 'onDark' ? '#F5F5F5' : '#1B1E23'
  const wordmark = variant === 'onDark' ? '#FFFFFF' : '#1B1E23'

  return (
    <div
      className={`flex items-center gap-2.5 ${className}`}
      role="img"
      aria-label="GearSight"
    >
      <svg
        viewBox="0 0 244 280"
        xmlns="http://www.w3.org/2000/svg"
        className="h-11 w-auto shrink-0"
        aria-hidden
      >
        <g
          stroke={stroke}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M25,150 A95,105 0 0 1 215,150" />
          <line x1="104" y1="66" x2="104" y2="136" />
          <line x1="140" y1="66" x2="140" y2="136" />
          <rect
            x="8"
            y="142"
            width="228"
            height="24"
            rx="12"
            fill="#FF6A1A"
            stroke={stroke}
            strokeWidth="8"
          />
          <rect x="28" y="198" width="184" height="70" rx="32" />
          <rect x="4" y="218" width="26" height="30" rx="6" />
          <rect x="210" y="218" width="26" height="30" rx="6" />
          <line x1="118" y1="198" x2="118" y2="268" />
          <line x1="92" y1="208" x2="118" y2="208" />
          <line x1="134" y1="208" x2="150" y2="208" />
        </g>
      </svg>

      <span
        className="font-display text-[1.85rem] font-extrabold leading-[0.85] tracking-[-0.03em] whitespace-nowrap"
        style={{ color: wordmark }}
      >
        GearSight
      </span>
    </div>
  )
}
