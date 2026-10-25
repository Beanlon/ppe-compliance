import type { ReactNode } from 'react'

/**
 * At least the main pane tall, and taller when the page content needs it.
 * The pane itself is a definite-height scrollport (absolute inset).
 */
const FRAME_CLASS = 'flex min-h-full w-full min-w-0 flex-col bg-white'

/** Compact inner spacing for header / form pages. Fills the frame. */
const PAD_CLASS =
  'flex min-h-full w-full min-w-0 flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4'

type FrameProps = {
  children: ReactNode
  className?: string
  /** Compact padding for Toolbox / Records-style pages */
  padded?: boolean
}

/**
 * Enclosed page shell used across the app (except About).
 * Stretches to the same main-pane height on every route.
 */
export function AppPageFrame({
  children,
  className = '',
  padded = false,
}: FrameProps) {
  return (
    <div className={`${FRAME_CLASS} ${className}`.trim()}>
      {padded ? <div className={PAD_CLASS}>{children}</div> : children}
    </div>
  )
}
