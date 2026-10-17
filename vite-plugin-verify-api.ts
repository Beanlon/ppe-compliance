import type { Plugin } from 'vite'
import os from 'node:os'
import type { IncomingMessage, ServerResponse } from 'node:http'

type SitePin = {
  name: string
  address: string
  projectId: string
  lat: number
  lng: number
}

type Challenge = {
  id: string
  email: string
  projectId: string
  site: SitePin
  createdAt: number
  expiresAt: number
  code: string | null
  phoneLocation: {
    lat: number
    lng: number
    accuracy: number
    distanceM: number
    insideGeofence: boolean
  } | null
  consumed: boolean
}

const TTL_MS = 10 * 60 * 1000
const GEOFENCE_M = 300
const challenges = new Map<string, Challenge>()

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.end(JSON.stringify(body))
}

function haversineM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function makeId() {
  return `ch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function makeCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function purgeExpired() {
  const now = Date.now()
  for (const [id, c] of challenges) {
    if (c.expiresAt < now || c.consumed) challenges.delete(id)
  }
}

function lanOrigins(port: number, protocol: 'http' | 'https'): string[] {
  const origins: string[] = []
  const nets = os.networkInterfaces()
  for (const entries of Object.values(nets)) {
    if (!entries) continue
    for (const entry of entries) {
      if (entry.family !== 'IPv4' || entry.internal) continue
      origins.push(`${protocol}://${entry.address}:${port}`)
    }
  }
  return origins
}

function getChallenge(id: string): Challenge | null {
  purgeExpired()
  const c = challenges.get(id)
  if (!c) return null
  if (c.expiresAt < Date.now()) {
    challenges.delete(id)
    return null
  }
  return c
}

function publicChallenge(c: Challenge) {
  return {
    id: c.id,
    email: c.email,
    projectId: c.projectId,
    site: c.site,
    createdAt: c.createdAt,
    expiresAt: c.expiresAt,
    hasCode: Boolean(c.code),
    phoneLocation: c.phoneLocation,
    geofenceMeters: GEOFENCE_M,
    consumed: c.consumed,
  }
}

export function verifyApiPlugin(): Plugin {
  return {
    name: 'gearsight-verify-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/verify')) return next()

        const url = new URL(req.url, 'http://127.0.0.1')
        const method = req.method ?? 'GET'

        if (method === 'OPTIONS') {
          sendJson(res, 204, {})
          return
        }

        try {
          if (method === 'GET' && url.pathname === '/api/verify/hosts') {
            const port = server.config.server.port ?? 5173
            const protocol = server.config.server.https ? 'https' : 'http'
            sendJson(res, 200, {
              lanOrigins: lanOrigins(port, protocol),
              port,
              protocol,
              geofenceMeters: GEOFENCE_M,
            })
            return
          }

          if (method === 'POST' && url.pathname === '/api/verify/challenges') {
            const raw = await readBody(req)
            const body = JSON.parse(raw || '{}') as {
              email?: string
              projectId?: string
              site?: SitePin
            }
            if (!body.email?.trim() || !body.projectId?.trim() || !body.site) {
              sendJson(res, 400, { error: 'email, projectId, and site are required' })
              return
            }
            const now = Date.now()
            const challenge: Challenge = {
              id: makeId(),
              email: body.email.trim(),
              projectId: body.projectId.trim(),
              site: body.site,
              createdAt: now,
              expiresAt: now + TTL_MS,
              code: null,
              phoneLocation: null,
              consumed: false,
            }
            challenges.set(challenge.id, challenge)
            sendJson(res, 201, publicChallenge(challenge))
            return
          }

          const match = url.pathname.match(
            /^\/api\/verify\/challenges\/([^/]+)(?:\/(location|confirm))?$/,
          )
          if (!match) {
            sendJson(res, 404, { error: 'Not found' })
            return
          }

          const id = decodeURIComponent(match[1])
          const action = match[2]
          const challenge = getChallenge(id)
          if (!challenge) {
            sendJson(res, 404, { error: 'Challenge expired or not found' })
            return
          }

          if (method === 'GET' && !action) {
            sendJson(res, 200, publicChallenge(challenge))
            return
          }

          if (method === 'POST' && action === 'location') {
            const raw = await readBody(req)
            const body = JSON.parse(raw || '{}') as {
              lat?: number
              lng?: number
              accuracy?: number
            }
            if (
              typeof body.lat !== 'number' ||
              typeof body.lng !== 'number' ||
              Number.isNaN(body.lat) ||
              Number.isNaN(body.lng)
            ) {
              sendJson(res, 400, { error: 'lat and lng are required' })
              return
            }
            const accuracy =
              typeof body.accuracy === 'number' && body.accuracy >= 0
                ? body.accuracy
                : 9999
            const distanceM = haversineM(
              { lat: body.lat, lng: body.lng },
              { lat: challenge.site.lat, lng: challenge.site.lng },
            )
            const insideGeofence = distanceM <= GEOFENCE_M
            challenge.phoneLocation = {
              lat: body.lat,
              lng: body.lng,
              accuracy,
              distanceM: Math.round(distanceM),
              insideGeofence,
            }
            // Feasibility: issue a code whenever the phone got a real GPS fix.
            // Geofence pass/fail is reported so you can compare accuracy.
            if (!challenge.code) challenge.code = makeCode()
            sendJson(res, 200, {
              ...publicChallenge(challenge),
              code: challenge.code,
            })
            return
          }

          if (method === 'POST' && action === 'confirm') {
            const raw = await readBody(req)
            const body = JSON.parse(raw || '{}') as { code?: string }
            const code = body.code?.trim() ?? ''
            if (!challenge.code || code !== challenge.code) {
              sendJson(res, 401, { error: 'Invalid verification code' })
              return
            }
            if (challenge.consumed) {
              sendJson(res, 409, { error: 'Code already used' })
              return
            }
            challenge.consumed = true
            sendJson(res, 200, {
              ok: true,
              email: challenge.email,
              projectId: challenge.projectId,
              phoneLocation: challenge.phoneLocation,
            })
            return
          }

          sendJson(res, 405, { error: 'Method not allowed' })
        } catch (err) {
          sendJson(res, 500, {
            error: err instanceof Error ? err.message : 'Server error',
          })
        }
      })
    },
  }
}
