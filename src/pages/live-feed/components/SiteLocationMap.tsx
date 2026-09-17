import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type SiteLocationMapProps = {
  lat: number
  lng: number
  label?: string
  className?: string
}

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#ff6a1a;border:3px solid #fff;
    box-shadow:0 1px 6px rgba(0,0,0,.35);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function MapResizer() {
  const map = useMap()

  useEffect(() => {
    const frame = requestAnimationFrame(() => map.invalidateSize())
    const onResize = () => map.invalidateSize()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
    }
  }, [map])

  return null
}

export function SiteLocationMap({
  lat,
  lng,
  label,
  className = '',
}: SiteLocationMapProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-200 ${className}`}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={false}
        dragging
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={pinIcon} title={label} />
        <MapResizer />
      </MapContainer>
    </div>
  )
}
