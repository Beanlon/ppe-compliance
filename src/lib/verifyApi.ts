export type SitePin = {
  name: string
  address: string
  projectId: string
  lat: number
  lng: number
}

export type PhoneLocation = {
  lat: number
  lng: number
  accuracy: number
  distanceM: number
  insideGeofence: boolean
}

export type PublicChallenge = {
  id: string
  email: string
  projectId: string
  site: SitePin
  createdAt: number
  expiresAt: number
  hasCode: boolean
  phoneLocation: PhoneLocation | null
  geofenceMeters: number
  consumed: boolean
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string }
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

export async function fetchVerifyHosts(): Promise<{
  lanOrigins: string[]
  port: number
  protocol: 'http' | 'https'
  geofenceMeters: number
}> {
  const res = await fetch('/api/verify/hosts')
  return parseJson(res)
}

export async function createChallenge(input: {
  email: string
  projectId: string
  site: SitePin
}): Promise<PublicChallenge> {
  const res = await fetch('/api/verify/challenges', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return parseJson(res)
}

export async function getChallenge(id: string): Promise<PublicChallenge> {
  const res = await fetch(`/api/verify/challenges/${encodeURIComponent(id)}`)
  return parseJson(res)
}

export async function submitPhoneLocation(
  id: string,
  input: { lat: number; lng: number; accuracy: number },
): Promise<PublicChallenge & { code: string }> {
  const res = await fetch(
    `/api/verify/challenges/${encodeURIComponent(id)}/location`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  )
  return parseJson(res)
}

export async function confirmChallengeCode(
  id: string,
  code: string,
): Promise<{
  ok: true
  email: string
  projectId: string
  phoneLocation: PhoneLocation | null
}> {
  const res = await fetch(
    `/api/verify/challenges/${encodeURIComponent(id)}/confirm`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    },
  )
  return parseJson(res)
}

/** Prefer a LAN origin for QR codes so phones on Wi‑Fi can open the link. */
export function pickPhoneOrigin(
  lanOrigins: string[],
  fallbackOrigin: string,
): string {
  if (lanOrigins.length === 0) return fallbackOrigin
  // Prefer private LAN ranges over whatever Vite listed first
  const preferred =
    lanOrigins.find((o) => /:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(o)) ??
    lanOrigins[0]
  // If the page is already opened via LAN, keep that host
  if (
    typeof window !== 'undefined' &&
    !/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
  ) {
    return window.location.origin
  }
  return preferred
}

export function qrImageUrl(data: string, size = 240) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`
}
