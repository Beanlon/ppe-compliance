import { useEffect } from 'react'
import { RefreshCw, VideoOff } from 'lucide-react'
import { useCameraDevices } from '@/hooks/useCameraDevices'
import { useCameraStream } from '@/hooks/useCameraStream'
import { resolveCamera } from '@/lib/camera'
import type { CameraSource } from '@/types'

interface CameraSelectFieldProps {
  id: string
  value: CameraSource | null
  onChange: (camera: CameraSource | null) => void
}

/** Camera dropdown with a live preview of the selected device. */
export function CameraSelectField({ id, value, onChange }: CameraSelectFieldProps) {
  const {
    cameras,
    status: devicesStatus,
    error: devicesError,
    reload,
    refreshing,
  } = useCameraDevices()
  const selected = resolveCamera(cameras, value)
  const {
    videoRef,
    status: streamStatus,
    error: streamError,
    retry,
  } = useCameraStream(selected?.deviceId ?? null)

  // Keep the value pointing at a camera that is actually connected
  useEffect(() => {
    if (devicesStatus === 'none' && value) {
      onChange(null)
      return
    }
    if (devicesStatus !== 'ready' || cameras.length === 0) return
    const next = resolveCamera(cameras, value) ?? cameras[0]
    if (next.deviceId !== value?.deviceId || next.label !== value?.label) {
      onChange(next)
    }
  }, [cameras, devicesStatus, value, onChange])

  const live = streamStatus === 'live'

  async function reloadAndReconnect() {
    await reload()
    if (!live) retry()
  }

  const message =
    devicesStatus === 'loading'
      ? 'Detecting cameras…'
      : devicesStatus === 'none'
        ? 'No camera found on this machine.'
        : devicesStatus !== 'ready'
          ? devicesError
          : streamStatus === 'starting'
            ? 'Connecting…'
            : streamError || 'No signal'

  return (
    <div className="max-w-xl">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-[#1a1a1a]">
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className={`h-full w-full object-cover ${live ? 'block' : 'hidden'}`}
        />
        {!live && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-white/70">
            <VideoOff className="h-7 w-7" strokeWidth={1.5} />
            <p className="text-sm">{message}</p>
            {(streamStatus === 'busy' || streamStatus === 'error') && (
              <button
                type="button"
                onClick={retry}
                className="mt-1 rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <select
          id={id}
          aria-label="Camera"
          value={selected?.deviceId ?? ''}
          disabled={cameras.length === 0}
          onChange={(e) =>
            onChange(cameras.find((c) => c.deviceId === e.target.value) ?? null)
          }
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-navy focus:ring-[3px] focus:ring-navy/15 disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted"
        >
          {cameras.length === 0 ? (
            <option value="">No cameras detected</option>
          ) : (
            cameras.map((cam) => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label}
              </option>
            ))
          )}
        </select>
        <button
          type="button"
          onClick={() => void reloadAndReconnect()}
          disabled={refreshing}
          title="Refresh cameras"
          aria-label="Refresh cameras"
          className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-muted transition hover:bg-gray-50 hover:text-ink disabled:cursor-wait"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  )
}
