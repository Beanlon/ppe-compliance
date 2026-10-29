import { useEffect, useRef, useState, type RefObject } from 'react'
import {
  detectFrame,
  fetchDetectHealth,
  type FrameDetection,
} from '@/lib/detectApi'
import type { PersonDetection } from '@/types'

const RETRY_MS = 120
const JPEG_QUALITY = 0.85
const MAX_SIDE = 960

export type MeasuredFrame = {
  /** Keep the Blob for capture — object URLs are revoked on every new frame. */
  blob: Blob
  url: string
  width: number
  height: number
}

export type LiveDetectionStatus =
  | 'idle'
  | 'checking'
  | 'ready'
  | 'running'
  | 'offline'
  | 'error'

type Options = {
  enabled: boolean
  videoRef: RefObject<HTMLVideoElement | null>
  requiredPpe: string[]
}

export function useLiveDetection({ enabled, videoRef, requiredPpe }: Options) {
  const [people, setPeople] = useState<PersonDetection[]>([])
  const [detections, setDetections] = useState<FrameDetection[]>([])
  const [frame, setFrame] = useState<MeasuredFrame | null>(null)
  const [status, setStatus] = useState<LiveDetectionStatus>('idle')
  const [error, setError] = useState('')
  const [device, setDevice] = useState('')
  const [modelName, setModelName] = useState('RT-DETR-L')
  const busyRef = useRef(false)
  const frameUrlRef = useRef<string | null>(null)
  const requiredRef = useRef(requiredPpe)
  requiredRef.current = requiredPpe

  useEffect(() => {
    if (!enabled) {
      setPeople([])
      setDetections([])
      setFrame(null)
      if (frameUrlRef.current) {
        URL.revokeObjectURL(frameUrlRef.current)
        frameUrlRef.current = null
      }
      setStatus('idle')
      setError('')
      return
    }

    let cancelled = false
    const canvas = document.createElement('canvas')
    const ctrl = new AbortController()
    let timer: number | undefined

    async function ensureHealthy() {
      setStatus('checking')
      try {
        const health = await fetchDetectHealth(ctrl.signal)
        if (cancelled) return false
        if (!health.ok || !health.weightsPresent) {
          setStatus('offline')
          setError('RT-DETR weights missing. See detect/README.md.')
          return false
        }
        setDevice(health.device)
        setModelName(health.model ?? 'RT-DETR-L')
        setStatus('ready')
        setError('')
        return true
      } catch {
        if (cancelled) return false
        setStatus('offline')
        setError('Start the detect service: npm run detect')
        return false
      }
    }

    function grabFrame(
      video: HTMLVideoElement,
    ): { blob: Blob; url: string; width: number; height: number } | null {
      const vw = video.videoWidth
      const vh = video.videoHeight
      if (!vw || !vh) return null
      const scale = Math.min(1, MAX_SIDE / Math.max(vw, vh))
      const width = Math.max(1, Math.round(vw * scale))
      const height = Math.max(1, Math.round(vh * scale))
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      ctx.drawImage(video, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
      const bin = atob(dataUrl.split(',')[1] ?? '')
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i)
      const blob = new Blob([bytes], { type: 'image/jpeg' })
      return { blob, url: URL.createObjectURL(blob), width, height }
    }

    function showFrame(next: MeasuredFrame) {
      if (frameUrlRef.current && frameUrlRef.current !== next.url) {
        URL.revokeObjectURL(frameUrlRef.current)
      }
      frameUrlRef.current = next.url
      setFrame(next)
    }

    async function tick() {
      if (cancelled || busyRef.current) return
      const video = videoRef.current
      if (!video || video.readyState < 2) {
        timer = window.setTimeout(() => void tick(), RETRY_MS)
        return
      }
      const shot = grabFrame(video)
      if (!shot) {
        timer = window.setTimeout(() => void tick(), RETRY_MS)
        return
      }

      busyRef.current = true
      setStatus('running')
      let retryIn = 0
      try {
        const result = await detectFrame(shot.blob, requiredRef.current, ctrl.signal)
        if (cancelled) {
          URL.revokeObjectURL(shot.url)
          return
        }
        showFrame({
          blob: shot.blob,
          url: shot.url,
          width: shot.width,
          height: shot.height,
        })
        setPeople(result.people)
        setDetections(result.detections ?? [])
        setDevice(result.device)
        if (result.model) setModelName(result.model)
        setError('')
      } catch (err) {
        URL.revokeObjectURL(shot.url)
        if (
          cancelled ||
          (err instanceof DOMException && err.name === 'AbortError')
        ) {
          return
        }
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Detection failed')
        retryIn = RETRY_MS
      } finally {
        busyRef.current = false
        if (!cancelled) timer = window.setTimeout(() => void tick(), retryIn)
      }
    }

    void ensureHealthy().then((ok) => {
      if (ok && !cancelled) void tick()
    })

    return () => {
      cancelled = true
      ctrl.abort()
      if (timer != null) window.clearTimeout(timer)
      busyRef.current = false
      setFrame(null)
      if (frameUrlRef.current) {
        URL.revokeObjectURL(frameUrlRef.current)
        frameUrlRef.current = null
      }
    }
  }, [enabled, videoRef])

  return { people, detections, frame, status, error, device, modelName }
}
