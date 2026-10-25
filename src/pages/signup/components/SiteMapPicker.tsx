import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import { Check, Loader2, LocateFixed, MapPin, Search, X } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

export type LatLng = { lat: number; lng: number }

export type PlaceSuggestion = {
  id: string
  label: string
  lat: number
  lng: number
}

const DEFAULT_CENTER: LatLng = { lat: 7.0635, lng: 125.5802 }

const pinIcon = L.divIcon({
  className: 'gearsight-pin',
  html: `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17 43s13-14.2 13-23.2A13 13 0 1 0 4 19.8C4 28.8 17 43 17 43z" fill="#ff6a1a"/>
    <circle cx="17" cy="18.5" r="5.2" fill="#fff"/>
  </svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 43],
})

function formatCoords({ lat, lng }: LatLng) {
  const latHem = lat >= 0 ? 'N' : 'S'
  const lngHem = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(5)}° ${latHem}, ${Math.abs(lng).toFixed(5)}° ${lngHem}`
}

function formatAddress(data: {
  display_name?: string
  address?: Record<string, string>
}): string {
  if (data.address) {
    const a = data.address
    const parts = [
      a.building || a.amenity || a.shop,
      a.road || a.pedestrian || a.path,
      a.suburb || a.neighbourhood || a.village,
      a.city || a.town || a.municipality || a.county,
      a.state,
    ].filter(Boolean)
    if (parts.length >= 2) return parts.join(', ')
  }
  return data.display_name ?? ''
}

async function reverseGeocode({ lat, lng }: LatLng): Promise<string> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lng))
  url.searchParams.set('zoom', '18')
  url.searchParams.set('addressdetails', '1')

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Geocode failed')

  const data = (await res.json()) as {
    display_name?: string
    address?: Record<string, string>
  }

  const formatted = formatAddress(data)
  return formatted || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('q', query)
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '6')

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Search failed')

  const rows = (await res.json()) as Array<{
    place_id: number
    lat: string
    lon: string
    display_name: string
    address?: Record<string, string>
  }>

  return rows.map((row) => ({
    id: String(row.place_id),
    label: formatAddress(row) || row.display_name,
    lat: Number(row.lat),
    lng: Number(row.lon),
  }))
}

function MapClickHandler({
  onPick,
}: {
  onPick: (pos: LatLng) => void
}) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function Recenter({
  position,
  zoom,
}: {
  position: LatLng
  zoom?: number
}) {
  const map = useMap()
  useEffect(() => {
    map.setView(
      [position.lat, position.lng],
      zoom ?? map.getZoom(),
      { animate: true },
    )
  }, [map, position.lat, position.lng, zoom])
  return null
}

function InvalidateSize() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    const refresh = () => map.invalidateSize()
    refresh()
    const frame = requestAnimationFrame(refresh)
    const later = window.setTimeout(refresh, 250)
    const observer = new ResizeObserver(refresh)
    observer.observe(container)
    if (container.parentElement) observer.observe(container.parentElement)
    window.addEventListener('resize', refresh)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(later)
      observer.disconnect()
      window.removeEventListener('resize', refresh)
    }
  }, [map])
  return null
}

interface SiteMapPickerProps {
  position: LatLng
  address: string
  onPositionChange: (pos: LatLng) => void
  onAddressChange: (address: string) => void
  className?: string
}

export function SiteMapPicker({
  position,
  address,
  onPositionChange,
  onAddressChange,
  className = '',
}: SiteMapPickerProps) {
  const [lookingUp, setLookingUp] = useState(false)
  const [query, setQuery] = useState(address)
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const [flyZoom, setFlyZoom] = useState<number | undefined>(undefined)
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState('')
  const requestId = useRef(0)
  const searchId = useRef(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const skipNextSync = useRef(false)

  useEffect(() => {
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }
    setQuery(address)
  }, [address])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const applyPosition = useCallback(
    async (pos: LatLng, knownAddress?: string) => {
      onPositionChange(pos)
      const id = ++requestId.current
      setLookingUp(true)
      try {
        const nextAddress = knownAddress ?? (await reverseGeocode(pos))
        if (id === requestId.current) {
          skipNextSync.current = true
          onAddressChange(nextAddress)
          setQuery(nextAddress)
        }
      } catch {
        if (id === requestId.current) {
          const fallback = `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`
          skipNextSync.current = true
          onAddressChange(fallback)
          setQuery(fallback)
        }
      } finally {
        if (id === requestId.current) setLookingUp(false)
      }
    },
    [onAddressChange, onPositionChange],
  )

  useEffect(() => {
    const q = query.trim()
    if (q.length < 3 || q === address) {
      setSuggestions([])
      setSearching(false)
      return
    }

    const id = ++searchId.current
    setSearching(true)
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const results = await searchPlaces(q)
          if (id === searchId.current) {
            setSuggestions(results)
            setOpen(true)
          }
        } catch {
          if (id === searchId.current) setSuggestions([])
        } finally {
          if (id === searchId.current) setSearching(false)
        }
      })()
    }, 350)

    return () => window.clearTimeout(timer)
  }, [address, query])

  function pickSuggestion(place: PlaceSuggestion) {
    setOpen(false)
    setSuggestions([])
    setLocateError('')
    setFlyZoom(17)
    void applyPosition({ lat: place.lat, lng: place.lng }, place.label)
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocateError('This browser cannot read your location.')
      return
    }
    setLocating(true)
    setLocateError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFlyZoom(16)
        void applyPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setLocating(false)
      },
      () => {
        setLocating(false)
        setLocateError('Location access was blocked. Search or drop a pin instead.')
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <div
      className={`site-map-picker flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm ${className}`}
    >
      {/* Search sits above the map, not over it */}
      <div
        ref={wrapRef}
        className="relative z-[1000] shrink-0 border-b border-[#e5e7eb] bg-white px-3 py-3 sm:px-4"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true)
            }}
            placeholder="Search for a location…"
            className="h-11 w-full rounded-xl border border-[#d8dce3] bg-[#f8f9fb] pl-10 pr-10 text-sm text-ink outline-none placeholder:text-[#9ca3af] focus:border-navy focus:bg-white focus:shadow-[0_0_0_3px_rgba(46,58,89,0.12)] sm:text-base"
            autoComplete="off"
          />
          {(searching || query) && (
            <button
              type="button"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#6b7280] hover:bg-gray-100"
              onClick={() => {
                if (searching) return
                setQuery('')
                setSuggestions([])
                setOpen(false)
              }}
              aria-label={searching ? 'Searching' : 'Clear search'}
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {open && suggestions.length > 0 && (
          <ul className="absolute left-3 right-3 top-[calc(100%-0.35rem)] max-h-56 overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white py-1 shadow-lg sm:left-4 sm:right-4">
            {suggestions.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => pickSuggestion(place)}
                  className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition hover:bg-[#f3f4f6]"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-sm leading-snug text-ink sm:text-base">
                    {place.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pure map area */}
      <div className="relative min-h-0 flex-1 bg-[#dfe3e8]">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={16}
          scrollWheelZoom
          className="absolute inset-0 h-full w-full"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[position.lat, position.lng]}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = e.target as L.Marker
                const { lat, lng } = m.getLatLng()
                setFlyZoom(undefined)
                setLocateError('')
                void applyPosition({ lat, lng })
              },
            }}
          />
          <MapClickHandler
            onPick={(pos) => {
              setFlyZoom(undefined)
              setLocateError('')
              void applyPosition(pos)
            }}
          />
          <Recenter position={position} zoom={flyZoom} />
          <InvalidateSize />
        </MapContainer>

        <p className="pointer-events-none absolute left-14 top-3 z-[500] rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-[#4b5563] shadow-sm sm:text-sm">
          Click the map or drag the pin
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-3 border-t border-[#e5e7eb] bg-white px-3 py-3 sm:flex-row sm:items-center sm:px-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1e8] text-accent">
            {lookingUp ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-accent">
              {lookingUp ? 'Updating address' : 'Site location'}
              {!lookingUp && (
                <Check className="h-3.5 w-3.5 text-[#16a34a]" strokeWidth={3} />
              )}
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-ink sm:text-base">
              {address}
            </p>
            <p className="mt-0.5 font-mono text-xs text-[#6b7280] sm:text-sm">
              {formatCoords(position)}
            </p>
            {locateError && (
              <p className="mt-1 text-xs text-[#b45309] sm:text-sm">{locateError}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[#d8dce3] px-4 text-sm font-semibold text-ink transition hover:border-navy disabled:cursor-wait disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4 text-accent" />
          )}
          Use my location
        </button>
      </div>
    </div>
  )
}

export { DEFAULT_CENTER }
