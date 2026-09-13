import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw, Video, VideoOff } from 'lucide-react'

type CameraDevice = {
  deviceId: string
  label: string
}

interface CameraDevicePickerProps {
  selectedDeviceId: string
  onSelect: (deviceId: string, label: string) => void
}

export function CameraDevicePicker({
  selectedDeviceId,
  onSelect,
}: CameraDevicePickerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [status, setStatus] = useState<
    'idle' | 'requesting' | 'ready' | 'denied' | 'none' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const attachStream = useCallback(async (deviceId?: string) => {
    stopStream()
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: deviceId
        ? { deviceId: { exact: deviceId } }
        : true,
    })
    streamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      await videoRef.current.play().catch(() => undefined)
    }
    return stream
  }, [stopStream])

  const discover = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('error')
      setErrorMessage('Camera access is not supported in this browser.')
      return
    }

    setStatus('requesting')
    setErrorMessage('')

    try {
      // Need an active stream once so enumerateDevices returns labels
      await attachStream()
      const devices = await navigator.mediaDevices.enumerateDevices()
      const list = devices
        .filter((d) => d.kind === 'videoinput')
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label?.trim() || `Camera ${i + 1}`,
        }))

      if (list.length === 0) {
        stopStream()
        setCameras([])
        setStatus('none')
        return
      }

      setCameras(list)

      const preferred =
        list.find((c) => c.deviceId === selectedDeviceId) ?? list[0]

      onSelectRef.current(preferred.deviceId, preferred.label)
      await attachStream(preferred.deviceId)
      setStatus('ready')
    } catch (err) {
      stopStream()
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setStatus('denied')
        setErrorMessage(
          'Camera permission was denied. Allow access in your browser settings, then try again.',
        )
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setStatus('none')
      } else {
        setStatus('error')
        setErrorMessage(
          err instanceof Error ? err.message : 'Could not access the camera.',
        )
      }
    }
  }, [attachStream, selectedDeviceId, stopStream])

  useEffect(() => {
    void discover()
    return () => stopStream()
    // Initial discovery only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handler = () => {
      void discover()
    }
    navigator.mediaDevices?.addEventListener?.('devicechange', handler)
    return () => {
      navigator.mediaDevices?.removeEventListener?.('devicechange', handler)
    }
  }, [discover])

  async function handleSelectChange(deviceId: string) {
    const label =
      cameras.find((c) => c.deviceId === deviceId)?.label ?? 'Camera'
    onSelect(deviceId, label)
    try {
      await attachStream(deviceId)
      setStatus('ready')
      setErrorMessage('')
    } catch {
      setStatus('error')
      setErrorMessage('Could not switch to the selected camera.')
    }
  }

  const showVideo = status === 'ready' || status === 'requesting'

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="relative mb-5 overflow-hidden rounded-2xl border border-[#d8dce3] bg-[#1a1a1a]">
        <div className="aspect-video w-full">
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className={`h-full w-full object-cover ${showVideo ? 'block' : 'hidden'}`}
          />

          {!showVideo && (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-[repeating-linear-gradient(45deg,#eaecef,#eaecef_8px,#f3f4f6_8px,#f3f4f6_16px)] px-6 text-center text-muted">
              <VideoOff className="h-8 w-8" strokeWidth={1.5} />
              <span className="font-mono text-xs tracking-wide sm:text-sm">
                {status === 'denied'
                  ? 'PERMISSION DENIED'
                  : status === 'none'
                    ? 'NO CAMERA FOUND'
                    : status === 'error'
                      ? 'CAMERA ERROR'
                      : 'NO SIGNAL'}
              </span>
              {errorMessage ? (
                <p className="max-w-sm text-xs leading-snug text-[#6b7280] sm:text-sm">
                  {errorMessage}
                </p>
              ) : null}
            </div>
          )}

          {status === 'requesting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white">
              Detecting cameras…
            </div>
          )}
        </div>
      </div>

      <div className="flex items-end gap-2">
        <label className="block min-w-0 flex-1">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-ink sm:text-base">
            <Video className="h-3.5 w-3.5" />
            Camera
          </span>
          <select
            value={selectedDeviceId}
            disabled={cameras.length === 0}
            onChange={(e) => void handleSelectChange(e.target.value)}
            className="h-11 w-full rounded-lg border border-[#d8dce3] bg-white px-3 text-sm text-ink outline-none transition focus:border-accent focus:shadow-[0_0_0_3px_#fdf1e7] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-muted sm:text-base"
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
        </label>

        <button
          type="button"
          onClick={() => void discover()}
          title="Refresh cameras"
          className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-[#d8dce3] bg-white text-muted transition hover:border-accent hover:text-accent"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-2 text-xs text-[#6b7280] sm:text-sm">
        {cameras.length > 0
          ? `${cameras.length} camera${cameras.length === 1 ? '' : 's'} detected on this machine.`
          : 'Allow camera access when prompted so the site can list available devices.'}
      </p>
    </div>
  )
}
