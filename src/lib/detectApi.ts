import type { BoundingBox, PersonDetection } from '@/types'

/** One box from RT-DETR, in the same order the demo window draws them. */
export type FrameDetection = {
  class: string
  confidence: number
  box: BoundingBox
}

const DETECT_URL = import.meta.env.VITE_DETECT_URL ?? '/api/detect'
const HEALTH_URL = import.meta.env.VITE_DETECT_HEALTH_URL ?? '/api/detect/health'

export type DetectResponse = {
  width: number
  height: number
  model?: string
  device: string
  requiredPpe: string[]
  detections: FrameDetection[]
  people: PersonDetection[]
}

export type DetectHealth = {
  ok: boolean
  model?: string
  weights: string
  weightsPresent: boolean
  device: string
  classes: string[]
}

export async function fetchDetectHealth(
  signal?: AbortSignal,
): Promise<DetectHealth> {
  const res = await fetch(HEALTH_URL, { signal })
  if (!res.ok) throw new Error(`Detect service unavailable (${res.status})`)
  return (await res.json()) as DetectHealth
}

export async function detectFrame(
  blob: Blob,
  requiredPpe: string[],
  signal?: AbortSignal,
): Promise<DetectResponse> {
  const body = new FormData()
  body.append('file', blob, 'frame.jpg')
  body.append('conf', '0.35')
  if (requiredPpe.length > 0) {
    body.append('required_ppe', requiredPpe.join(','))
  }
  const res = await fetch(DETECT_URL, { method: 'POST', body, signal })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Detect failed (${res.status})`)
  }
  return (await res.json()) as DetectResponse
}
