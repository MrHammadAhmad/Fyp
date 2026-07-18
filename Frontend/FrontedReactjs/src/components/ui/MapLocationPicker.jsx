import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPin, X, Loader2, Navigation2 } from 'lucide-react'
import Button from './Button'
import toast from 'react-hot-toast'

// Fix Leaflet's default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

// Custom Icon for draggable marker
const pinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Helper to update map center when position changes
function MapController({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom())
    }
  }, [position, map])
  return null
}

export default function MapLocationPicker({ 
  isOpen, 
  onClose, 
  onConfirm, 
  initialPosition = null 
}) {
  const defaultPos = { lat: 31.5204, lng: 74.3587 } // Lahore Default
  const [position, setPosition] = useState(initialPosition || defaultPos)
  const [addressStr, setAddressStr] = useState('')
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [locating, setLocating] = useState(false)

  // Fetch address from coordinates
  const fetchAddress = async (lat, lng) => {
    setLoadingAddress(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await res.json()
      if (data && data.display_name) {
        setAddressStr(data.display_name)
      } else {
        setAddressStr('Unknown location')
      }
    } catch (err) {
      console.error(err)
      setAddressStr('Could not fetch address')
    } finally {
      setLoadingAddress(false)
    }
  }

  // Initialize
  useEffect(() => {
    if (isOpen) {
      if (initialPosition && initialPosition.lat && initialPosition.lng) {
        setPosition(initialPosition)
        fetchAddress(initialPosition.lat, initialPosition.lng)
      } else {
        setPosition(defaultPos)
        setAddressStr('Lahore, Pakistan')
      }
    }
  }, [isOpen])

  const handleDragEnd = (e) => {
    const marker = e.target
    const pos = marker.getLatLng()
    setPosition({ lat: pos.lat, lng: pos.lng })
    fetchAddress(pos.lat, pos.lng)
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(newPos)
        fetchAddress(newPos.lat, newPos.lng)
        setLocating(false)
        toast.success('Location found!')
      },
      () => {
        setLocating(false)
        toast.error('Unable to retrieve your location')
      }
    )
  }

  const handleConfirm = () => {
    onConfirm({
      latitude: position.lat,
      longitude: position.lng,
      address: addressStr
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col h-[80vh] max-h-[800px] border border-surface-200 dark:border-surface-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-100 dark:border-surface-800">
          <div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-500" />
              Pinpoint Your Salon
            </h2>
            <p className="text-sm text-surface-500 mt-1">Drag the red pin to your exact location</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 rounded-xl transition-colors text-surface-500 dark:text-surface-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-surface-100 dark:bg-surface-800">
          <MapContainer 
            center={[position.lat, position.lng]} 
            zoom={14} 
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController position={position} />
            <Marker 
              position={position} 
              icon={pinIcon}
              draggable={true}
              eventHandlers={{ dragend: handleDragEnd }}
            />
          </MapContainer>

          {/* Current Location Button Overlay */}
          <button 
            onClick={handleGetLocation}
            disabled={locating}
            className="absolute top-4 right-4 z-[400] flex items-center gap-2 bg-white dark:bg-surface-900 text-surface-900 dark:text-white px-4 py-2.5 rounded-xl shadow-lg border border-surface-200 dark:border-surface-800 font-semibold text-sm hover:scale-105 active:scale-95 transition-all"
          >
            {locating ? <Loader2 className="w-4 h-4 animate-spin text-brand-500" /> : <Navigation2 className="w-4 h-4 text-brand-500" />}
            {locating ? 'Locating...' : 'Use My Location'}
          </button>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex-1 min-w-0 w-full">
              <label className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1 block">Selected Address</label>
              <div className="text-sm font-medium text-surface-900 dark:text-white truncate flex items-center gap-2 bg-white dark:bg-surface-800 p-3 rounded-xl border border-surface-200 dark:border-surface-700">
                {loadingAddress ? <Loader2 className="w-4 h-4 animate-spin text-brand-500" /> : <MapPin className="w-4 h-4 text-surface-400 shrink-0" />}
                <span className="truncate">{addressStr || 'Drag pin to fetch address'}</span>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto shrink-0 mt-2 md:mt-0">
              <Button variant="outline" onClick={onClose} className="flex-1 md:flex-none">Cancel</Button>
              <Button onClick={handleConfirm} className="flex-1 md:flex-none bg-brand-500 hover:bg-brand-600 text-white shadow-brand">
                Confirm Location
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
