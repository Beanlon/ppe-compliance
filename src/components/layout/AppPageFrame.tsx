import type { ReactNode } from 'react'

/**
 * Fills the AppLayout main pane. Prefer flex-1 over h-full so height
 * resolves reliably inside the flex shell.
 */
const FRAME_CLASS = 'flex min-h-0 flex-1 flex-col bg-white'

/** Compact inner spacing for header / form pages */
const PAD_CLASS =
  'min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4'

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
