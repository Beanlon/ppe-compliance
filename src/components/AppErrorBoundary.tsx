import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

/** Catches render crashes so Electron does not stick on a blank white window. */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('GearSight render crash:', error, info.componentStack)
  }

  render() {
    return (
      <div className="flex h-full min-h-0 w-full flex-col">
        {this.state.error ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-surface px-6 text-center">
            <p className="text-lg font-bold text-ink">Something went wrong</p>
            <p className="mt-2 max-w-md text-sm text-muted">
              The app hit a render error. Reload to continue your session.
            </p>
            <p className="mt-3 max-w-lg break-words font-mono text-xs text-[#9f1239]">
              {this.state.error.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-navy px-5 text-sm font-semibold text-white transition hover:bg-[#24314d]"
            >
              Reload app
            </button>
          </div>
        ) : (
          this.props.children
        )}
      </div>
    )
  }
}
