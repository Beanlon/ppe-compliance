import { useCallback, useEffect, useRef, useState } from 'react'
import { describeCameraError, type CameraErrorKind } from '@/lib/camera'

export type CameraStreamStatus = 'idle' | 'starting' | 'live' | CameraErrorKind

type StreamResult = {
  key: string
  status: CameraStreamStatus
  error: string
}

/**
 * Opens the given camera and plays it in `videoRef`. The video element must
 * stay mounted (hide it with CSS) so the stream has somewhere to attach.
 */
export function useCameraStream(deviceId: string | null) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<StreamResult | null>(null)
  const key = deviceId ? `${deviceId}#${attempt}` : null

  useEffect(() => {
    if (!deviceId || !key) return
    const video = videoRef.current
    let cancelled = false
    let stream: MediaStream | null = null

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream = s
        s.getVideoTracks()[0]?.addEventListener('ended', () => {
          if (cancelled) return
          setResult({
            key,
            status: 'missing',
            error: 'The camera was disconnected.',
          })
        })
        if (video) {
          video.srcObject = s
          void video.play().catch(() => undefined)
        }
        setResult({ key, status: 'live', error: '' })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const { kind, message } = describeCameraError(err)
        setResult({ key, status: kind, error: message })
      })

    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
      if (video) video.srcObject = null
    }
  }, [deviceId, key])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  const current = key && result?.key === key ? result : null
  const status: CameraStreamStatus = !key
    ? 'idle'
    : (current?.status ?? 'starting')

  return { videoRef, status, error: current?.error ?? '', retry }
}
