'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon in Leaflet + Next.js
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src || markerIcon,
  iconRetinaUrl: markerIcon2x.src || markerIcon2x,
  shadowUrl: markerShadow.src || markerShadow,
})

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  return position === null ? null : (
    <Marker position={position} />
  )
}

export default function MapPicker({ onLocationSelect, initialPos = { lat: 10.8505, lng: 76.2711 } }) {
  const [position, setPosition] = useState(null)

  useEffect(() => {
    if (position) {
      onLocationSelect(position.lat, position.lng)
    }
  }, [position, onLocationSelect])

  return (
    <div style={{ height: '250px', width: '100%', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-color)', marginTop: '10px' }}>
      <MapContainer 
        center={[initialPos.lat, initialPos.lng]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', textAlign: 'center' }}>
        Click on the map to set your delivery location
      </p>
    </div>
  )
}
