import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useParams } from 'react-router-dom'
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import {
  Check,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  ShieldAlert,
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { GearSightLogo } from '@/components/brand/GearSightLogo'
import {
  getChallenge,
  submitPhoneLocation,
  type PublicChallenge,
} from '@/lib/verifyApi'

const siteIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#ff6a1a;border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.35)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const phoneIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.35)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function FitBounds({
  site,
  phone,
}: {
  site: { lat: number; lng: number }
  phone: { lat: number; lng: number } | null
}) {
  const map = useMap()
  useEffect(() => {
    if (phone) {
      const bounds = L.latLngBounds(
        [site.lat, site.lng],
        [phone.lat, phone.lng],
      )
      map.fitBounds(bounds.pad(0.35))
    } else {
      map.setView([site.lat, site.lng], 15)
    }
  }, [map, site.lat, site.lng, phone?.lat, phone?.lng])
  return null
}

function formatCoords(lat: number, lng: number) {
  const latHem = lat >= 0 ? 'N' : 'S'
  const lngHem = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(5)}° ${latHem}, ${Math.abs(lng).toFixed(5)}° ${lngHem}`
}

export function PhoneVerifyPage() {
  const { challengeId = '' } = useParams()
  const [challenge, setChallenge] = useState<PublicChallenge | null>(null)
  const [loadError, setLoadError] = useState('')
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState('')
  const [code, setCode] = useState<string | null>(null)
  const [phonePos, setPhonePos] = useState<{
    lat: number
    lng: number
    accuracy: number
  } | null>(null)

  const secureContext = typeof window !== 'undefined' && window.isSecureContext
  const geoAvailable =
    typeof navigator !== 'undefined' && Boolean(navigator.geolocation)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const data = await getChallenge(challengeId)
        if (!cancelled) setChallenge(data)
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : 'Challenge not found',
          )
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [challengeId])

  const readGps = useCallback(() => {
    // Must run from a tap — many phones never show the permission popup
    // if geolocation is requested automatically on page load.
    if (!window.isSecureContext) {
      setLocateError(
        'This page is not HTTPS. Open the https:// link from the desktop QR (accept the certificate warning), then tap Allow location again.',
      )
      return
    }
    if (!navigator.geolocation) {
      setLocateError(
        'GPS is blocked in this browser. Use Chrome/Safari, enable Location for the browser in phone Settings, then try again.',
      )
      return
    }
    setLocating(true)
    setLocateError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPhonePos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          setLocateError(
            'Location was denied. On iPhone: Settings → Safari (or Chrome) → Location → Allow. On Android: Site settings → Location → Allow. Then tap the button again.',
          )
          return
        }
        if (err.code === err.TIMEOUT) {
          setLocateError(
            'GPS timed out. Step outside or near a window, wait a few seconds, then tap again.',
          )
          return
        }
        setLocateError(
          'Could not read GPS. Keep the page open, enable Location Services, and tap Allow location again.',
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 25000,
        maximumAge: 0,
      },
    )
  }, [])

  async function submitLocation() {
    if (!challenge || !phonePos) return
    setLocating(true)
    setLocateError('')
    setCode(null)
    try {
      const result = await submitPhoneLocation(challenge.id, phonePos)
      setChallenge(result)
      if (!result.phoneLocation?.insideGeofence) {
        setCode(null)
        return
      }
      setCode(result.code)
    } catch (err) {
      setLocateError(err instanceof Error ? err.message : 'Submit failed')
    } finally {
      setLocating(false)
    }
  }

  const distanceLabel = useMemo(() => {
    const d = challenge?.phoneLocation?.distanceM
    if (d == null) return null
    if (d < 1000) return `${d} m from project pin`
    return `${(d / 1000).toFixed(2)} km from project pin`
  }, [challenge?.phoneLocation?.distanceM])

  if (loadError) {
    return (
      <Shell>
        <div className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-5 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-[#b91c1c]" />
          <p className="mt-3 text-base font-semibold text-ink">{loadError}</p>
          <p className="mt-1 text-sm text-[#6b7280]">
            Ask the desktop to generate a new QR and scan again.
          </p>
        </div>
      </Shell>
    )
  }

  if (!challenge) {
    return (
      <Shell>
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </Shell>
    )
  }

  const inside = challenge.phoneLocation?.insideGeofence

  return (
    <Shell>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
        Step 3 · Phone GPS
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">
        Confirm your location
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
        Orange pin = registered project site. Blue pin = where this phone is
        right now (GPS).
      </p>

      {!secureContext || !geoAvailable ? (
        <div className="mt-4 rounded-2xl border border-[#fcd34d] bg-[#fffbeb] p-4 text-sm text-[#92400e]">
          <p className="font-semibold">GPS permission cannot appear yet</p>
          <p className="mt-1 leading-relaxed">
            Phones only show the location popup on an <strong>https://</strong>{' '}
            page. Close this tab, scan the QR again (or open the https LAN link
            under the QR), tap <strong>Advanced → Proceed</strong> if you see a
            certificate warning, then tap <strong>Allow location</strong> below.
          </p>
        </div>
      ) : !phonePos ? (
        <div className="mt-4 rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-4 text-sm text-[#1e3a8a]">
          <p className="font-semibold">Tap the button to show the GPS popup</p>
          <p className="mt-1 leading-relaxed">
            Your phone will ask “Allow location?” — choose <strong>Allow</strong>{' '}
            / <strong>While using the app</strong>. The popup only appears after
            you tap.
          </p>
        </div>
      ) : null}

      {!phonePos ? (
        <button
          type="button"
          onClick={readGps}
          disabled={locating}
          className="mt-4 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-base font-bold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LocateFixed className="h-5 w-5" />
          )}
          {locating ? 'Waiting for GPS…' : 'Allow location'}
        </button>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#e5e7eb]">
        <div className="h-[280px] w-full sm:h-[340px]">
          <MapContainer
            center={[challenge.site.lat, challenge.site.lng]}
            zoom={15}
            scrollWheelZoom
            className="h-full w-full"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[challenge.site.lat, challenge.site.lng]}
              icon={siteIcon}
              title="Project site"
            />
            <Circle
              center={[challenge.site.lat, challenge.site.lng]}
              radius={challenge.geofenceMeters}
              pathOptions={{
                color: '#ff6a1a',
                fillColor: '#ff6a1a',
                fillOpacity: 0.08,
                weight: 1.5,
              }}
            />
            {phonePos ? (
              <>
                <Marker
                  position={[phonePos.lat, phonePos.lng]}
                  icon={phoneIcon}
                  title="Your phone"
                />
                <Circle
                  center={[phonePos.lat, phonePos.lng]}
                  radius={Math.max(phonePos.accuracy, 8)}
                  pathOptions={{
                    color: '#2563eb',
                    fillColor: '#2563eb',
                    fillOpacity: 0.12,
                    weight: 1,
                  }}
                />
              </>
            ) : null}
            <FitBounds site={challenge.site} phone={phonePos} />
          </MapContainer>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-2xl border border-[#e5e7eb] bg-[#f8f9fb] p-4 text-sm">
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span>
            <span className="font-semibold text-ink">Site · </span>
            {challenge.site.name}
            <span className="mt-0.5 block font-mono text-xs text-[#6b7280]">
              {formatCoords(challenge.site.lat, challenge.site.lng)}
            </span>
          </span>
        </p>
        <p className="flex items-start gap-2">
          <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-[#2563eb]" />
          <span>
            <span className="font-semibold text-ink">Phone GPS · </span>
            {phonePos ? (
              <>
                accuracy ±{Math.round(phonePos.accuracy)} m
                <span className="mt-0.5 block font-mono text-xs text-[#6b7280]">
                  {formatCoords(phonePos.lat, phonePos.lng)}
                </span>
              </>
            ) : (
              'Not read yet — tap Allow location'
            )}
          </span>
        </p>
        {distanceLabel ? (
          <p
            className={`font-semibold ${inside ? 'text-[#166534]' : 'text-[#b91c1c]'}`}
          >
            {distanceLabel}
            {inside ? ' · inside geofence' : ' · outside geofence'}
          </p>
        ) : null}
      </div>

      {inside === false ? (
        <div className="mt-4 rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm text-[#991b1b]">
          <p className="font-semibold">You are nowhere near the project area</p>
          <p className="mt-1 leading-relaxed">
            A verification code will only appear when your phone GPS is inside
            the orange circle ({challenge.geofenceMeters} m). Move closer, then
            refresh GPS and try again.
          </p>
        </div>
      ) : null}

      {locateError ? (
        <p className="mt-3 text-sm font-medium text-[#b45309]">{locateError}</p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {phonePos ? (
          <button
            type="button"
            onClick={readGps}
            disabled={locating}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#d8dce3] px-4 text-sm font-semibold text-ink transition hover:border-navy disabled:opacity-60"
          >
            {locating && !code ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4 text-accent" />
            )}
            Refresh GPS
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => void submitLocation()}
          disabled={!phonePos || locating || Boolean(code)}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-navy px-4 text-sm font-semibold text-white transition hover:bg-[#24314d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {locating && phonePos && !code ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {code ? 'Code ready' : 'Use this GPS fix'}
        </button>
      </div>

      {code ? (
        <div className="mt-6 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#166534]">
            Step 4 · Enter on desktop
          </p>
          <p className="mt-3 font-mono text-4xl font-bold tracking-[0.35em] text-ink">
            {code}
          </p>
          <p className="mt-3 text-sm text-[#166534]">
            Type this code in GearSight on the computer to finish login.
          </p>
        </div>
      ) : null}
    </Shell>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f4f6] px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <GearSightLogo
          variant="onLight"
          className="mb-6 [&>span]:text-2xl [&>svg]:h-9"
        />
        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">{children}</div>
      </div>
    </div>
  )
}
