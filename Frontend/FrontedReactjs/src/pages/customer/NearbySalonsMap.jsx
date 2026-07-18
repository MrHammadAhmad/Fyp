import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPin, Navigation2, Loader2, ChevronLeft } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios' 

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

// Custom Icon for user
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Haversine formula to calculate distance between two coordinates in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export default function NearbySalonsMap() {
  const navigate = useNavigate()
  // Default to Lahore, Pakistan
  const defaultLocation = { lat: 31.5204, lng: 74.3587 }
  
  const [userLoc, setUserLoc] = useState(defaultLocation)
  const [salons, setSalons] = useState([])
  const [nearbySalons, setNearbySalons] = useState([])
  const [loading, setLoading] = useState(true)
  const [locating, setLocating] = useState(false)

  const fetchSalons = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/salons/')
      setSalons(res.data || [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load salons.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSalons()
  }, [])

  // Calculate distances whenever user location or salons change
  useEffect(() => {
    if (!salons.length) return
    
    const mapped = salons
      .map(salon => {
        // Skip salons without coordinates, or default them strictly if necessary
        // But since we want to use actual DB coordinates:
        const lat = salon.latitude
        const lng = salon.longitude
        
        if (!lat || !lng) return null

        const dist = calculateDistance(userLoc.lat, userLoc.lng, lat, lng)
        return { ...salon, distance: dist }
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)
      
    setNearbySalons(mapped)
  }, [userLoc, salons])

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLoc({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setLocating(false)
        toast.success('Location found!')
      },
      () => {
        setLocating(false)
        toast.error('Unable to retrieve your location')
      }
    )
  }

  const handleBookNow = (salonId) => {
    navigate(`/dashboard/salons/${salonId}`)
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6 -mx-6 -my-6 p-6 bg-surface-50 dark:bg-surface-950">
      
      {/* Sidebar: Nearby Salons List */}
      <div className="w-full md:w-96 flex flex-col bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-3 mb-1">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1.5 bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 rounded-lg transition-colors text-surface-600 dark:text-surface-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">Nearby Salons</h2>
          </div>
          <p className="text-sm text-surface-500 mb-4">Find the best services near you in Lahore</p>
          
          <Button 
            fullWidth 
            onClick={handleGetLocation} 
            disabled={locating}
            leftIcon={locating ? <Loader2 className="animate-spin w-4 h-4" /> : <Navigation2 className="w-4 h-4" />}
          >
            {locating ? 'Locating...' : 'Use My Live Location'}
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          ) : nearbySalons.length === 0 ? (
            <div className="text-center p-8 text-surface-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p>No nearby salons found.</p>
              <p className="text-xs mt-1">Make sure salons have coordinates.</p>
            </div>
          ) : (
            nearbySalons.map(salon => (
              <div key={salon.id} className="bg-surface-50 dark:bg-surface-800 p-4 rounded-2xl hover:shadow-md transition-shadow border border-surface-100 dark:border-surface-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-surface-900 dark:text-white leading-tight">{salon.name}</h3>
                  <div className="bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                    {salon.distance.toFixed(1)} km
                  </div>
                </div>
                <p className="text-xs text-surface-500 mb-3 truncate">{salon.address || salon.location}</p>
                <Button size="sm" fullWidth variant="outline" onClick={() => handleBookNow(salon.id)}>
                  View Services
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content: Map */}
      <div className="flex-1 bg-surface-200 dark:bg-surface-800 rounded-3xl overflow-hidden relative border border-surface-200 dark:border-surface-800 shadow-sm min-h-[400px]">
        <MapContainer center={[userLoc.lat, userLoc.lng]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
          <ChangeView center={[userLoc.lat, userLoc.lng]} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User Marker */}
          <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center font-bold">You are here</div>
            </Popup>
          </Marker>

          {/* Salon Markers */}
          {nearbySalons.map(salon => (
            <Marker key={salon.id} position={[salon.latitude, salon.longitude]}>
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold mb-1">{salon.name}</h4>
                  <p className="text-xs mb-2">{salon.distance.toFixed(1)} km away</p>
                  <button 
                    onClick={() => handleBookNow(salon.id)}
                    className="bg-[#405742] text-white px-3 py-1.5 rounded-lg text-xs font-semibold w-full"
                  >
                    Book Now
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

    </div>
  )
}
