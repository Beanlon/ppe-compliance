import type { CameraSource } from '@/types'

export type CameraErrorKind = 'denied' | 'missing' | 'busy' | 'error'

export function describeCameraError(err: unknown): {
  kind: CameraErrorKind
  message: string
} {
  const name = err instanceof DOMException ? err.name : ''
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
    case 'SecurityError':
      return {
        kind: 'denied',
        message:
          'Camera permission was denied. Allow camera access, then try again.',
      }
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return {
        kind: 'missing',
        message: 'The selected camera is not connected.',
      }
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return {
        kind: 'busy',
        message:
          'The camera is being used by another app. Close it there, then retry.',
      }
    default:
      return {
        kind: 'error',
        message:
          err instanceof Error && err.message
            ? err.message
            : 'Could not open the camera.',
      }
  }
}

/**
 * Device IDs can change when browser storage is reset, so fall back to the
 * label to find the same physical camera.
 */
export function resolveCamera(
  cameras: CameraSource[],
  wanted: CameraSource | null | undefined,
): CameraSource | null {
  if (!wanted) return null
  return (
    cameras.find((c) => c.deviceId === wanted.deviceId) ??
    cameras.find((c) => c.label === wanted.label) ??
    null
  )
}
