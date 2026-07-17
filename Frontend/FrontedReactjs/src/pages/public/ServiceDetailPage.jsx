import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, MapPin, ChevronRight, User, Sparkles } from 'lucide-react'
import { formatPrice, formatDuration } from '../../utils/helpers'
import Avatar from '../../components/ui/Avatar'
import { useAuthStore } from '../../store/authStore'
import { businessApi } from '../../api/services/businessApi'
import showToast from '../../components/ui/Toast'

export default function ServiceDetailPage() {
  const { slug, serviceId } = useParams()
  const { isAuthenticated, role } = useAuthStore()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await businessApi.getById(slug)
        setBusiness(data)
      } catch (err) {
        console.error(err)
        showToast.error('Failed to load service details.')
      } finally {
        setLoading(false)
      }
    }
    if (slug) {
      loadData()
    }
  }, [slug])

  const handleBookNow = (e) => {
    if (!isAuthenticated || role !== 'customer') {
      e.preventDefault()
      setShowLoginModal(true)
    }
  }

  const service = useMemo(() => {
    if (!business?.services) return null
    return business.services.find(s => s.id === serviceId)
  }, [business, serviceId])

  const availableStaff = business?.staff || []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#405742]" />
      </div>
    )
  }

  if (!business || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Service Not Found</h2>
          <Link to={`/business/${slug}`} className="text-brand-600 hover:underline">Return to Business</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-20 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-surface-500 mb-8">
          <Link to="/explore" className="hover:text-brand-600">Explore</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/business/${business.id}`} className="hover:text-brand-600">{business.name}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-surface-900 dark:text-white font-medium truncate">{service.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Info */}
          <div className="md:w-2/3 space-y-8">
            <div className="aspect-video rounded-2xl overflow-hidden mb-6 relative bg-surface-100 dark:bg-surface-850 flex items-center justify-center">
              {service.image || service.image_url ? (
                <img src={service.image || service.image_url} alt={service.name} className="w-full h-full object-cover" />
              ) : (
                <Sparkles className="w-12 h-12 text-[#405742]/40" />
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">{service.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-surface-600 dark:text-surface-400 mb-6">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatDuration(service.duration)}</span>
                <span className="flex items-center gap-1.5 text-surface-900 dark:text-white font-bold">{formatPrice(service.price)}</span>
              </div>
              <p className="text-surface-600 dark:text-surface-400 leading-relaxed text-lg">
                {service.description || 'No description available for this service.'}
              </p>
            </div>

            <hr className="border-surface-200 dark:border-surface-800" />

            <div>
              <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Available Specialists</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableStaff.length > 0 ? (
                  availableStaff.map(staff => (
                    <div key={staff.id} className="flex items-center gap-3 p-4 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800">
                      <Avatar src={staff.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`} alt={staff.name} size="md" />
                      <div>
                        <h4 className="font-bold text-surface-900 dark:text-white text-sm">{staff.name}</h4>
                        <p className="text-xs text-surface-500">{staff.role || 'Barber/Stylist'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-6 text-sm text-surface-500 dark:text-surface-400">
                    No specialists listed for this salon.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="md:w-1/3">
            <div className="sticky top-24 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-surface-100 dark:border-surface-800">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                  <img src={business.coverImage || business.cover_image || business.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200'} className="w-full h-full object-cover" alt={business.name} />
                </div>
                <div>
                  <h3 className="font-bold text-surface-900 dark:text-white leading-tight">{business.name}</h3>
                  <p className="text-xs text-surface-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {business.city || 'No City'}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-surface-600 dark:text-surface-400">Duration</span>
                  <span className="font-bold text-surface-900 dark:text-white">{formatDuration(service.duration)}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="text-surface-900 dark:text-white font-bold">Total Price</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">{formatPrice(service.price)}</span>
                </div>
              </div>

              <Link
                to={`/book/${business.id}`}
                onClick={handleBookNow}
                className="w-full block text-center bg-[#405742] hover:bg-[#334d3b] text-white font-bold py-3.5 rounded-xl transition-all shadow-brand hover:shadow-brand-lg"
              >
                Continue to Booking
              </Link>

              {/* Login Requirement Modal */}
              {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white dark:bg-surface-900 rounded-[2rem] p-6 max-w-sm w-full border border-surface-200 dark:border-surface-800 shadow-2xl text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-[#405742]/10 text-[#405742] dark:text-[#5a7a62] flex items-center justify-center mx-auto">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-surface-900 dark:text-white">Authentication Required</h3>
                      <p className="text-sm text-surface-500 mt-2">Login to proceed your booking</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowLoginModal(false)}
                        className="flex-1 py-3 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 font-semibold hover:bg-surface-50 dark:hover:bg-surface-800 transition-all text-xs"
                      >
                        Cancel
                      </button>
                      <Link
                        to="/auth/login"
                        className="flex-1 py-3 rounded-xl bg-[#405742] hover:bg-[#334d3b] text-white font-semibold transition-all text-xs flex items-center justify-center"
                      >
                        Login Now
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
