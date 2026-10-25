import { useCallback, useEffect, useState } from 'react'
import { describeCameraError } from '@/lib/camera'
import type { CameraSource } from '@/types'

export type CameraDevicesStatus =
  | 'loading'
  | 'ready'
  | 'none'
  | 'denied'
  | 'unsupported'
  | 'error'

/** Lists the video inputs on this machine and keeps the list current. */
export function useCameraDevices() {
  const [cameras, setCameras] = useState<CameraSource[]>([])
  const [status, setStatus] = useState<CameraDevicesStatus>('loading')
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    const media = navigator.mediaDevices
    if (!media?.enumerateDevices || !media.getUserMedia) {
      setCameras([])
      setStatus('unsupported')
      setError('Camera access is not supported here.')
      return
    }

    try {
      let devices = await media.enumerateDevices()
      // Labels and IDs stay blank until camera permission has been granted
      if (devices.some((d) => d.kind === 'videoinput' && !d.label)) {
        const probe = await media.getUserMedia({ video: true, audio: false })
        probe.getTracks().forEach((t) => t.stop())
        devices = await media.enumerateDevices()
      }

      const list = devices
        .filter((d) => d.kind === 'videoinput' && d.deviceId)
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label.trim() || `Camera ${i + 1}`,
        }))

      setCameras(list)
      setStatus(list.length > 0 ? 'ready' : 'none')
      setError('')
    } catch (err) {
      const { kind, message } = describeCameraError(err)
      setCameras([])
      if (kind === 'missing') {
        setStatus('none')
        setError('')
      } else {
        setStatus(kind === 'denied' ? 'denied' : 'error')
        setError(message)
      }
    }
  }, [])

  useEffect(() => {
    void refresh()
    const media = navigator.mediaDevices
    const onChange = () => void refresh()
    media?.addEventListener?.('devicechange', onChange)
    return () => media?.removeEventListener?.('devicechange', onChange)
  }, [refresh])

  const [refreshing, setRefreshing] = useState(false)

  /** User-triggered refresh; stays in `refreshing` long enough to be seen. */
  const reload = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([
      refresh(),
      new Promise((resolve) => setTimeout(resolve, 500)),
    ])
    setRefreshing(false)
  }, [refresh])

  return { cameras, status, error, refresh, reload, refreshing }
}
