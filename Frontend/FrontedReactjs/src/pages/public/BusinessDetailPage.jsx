import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, MapPin, Clock, Phone, Globe, Heart, Share, ChevronRight, CheckCircle, Sparkles, Crown } from 'lucide-react'
import { motion } from 'framer-motion'
import Tabs from '../../components/ui/Tabs'
import ServiceCard from '../../components/cards/ServiceCard'
import StaffCard from '../../components/cards/StaffCard'
import ReviewCard from '../../components/cards/ReviewCard'
import AverageRatingWidget from '../../components/reviews/AverageRatingWidget'
import AiTextRatingWidget from '../../components/reviews/AiTextRatingWidget'
import { useAuthStore } from '../../store/authStore'
import { businessApi } from '../../api/services/businessApi'
import { membershipApi } from '../../api/services/membershipApi'
import { reviewApi } from '../../api/services/reviewApi'
import showToast from '../../components/ui/Toast'

export default function BusinessDetailPage() {
  const { slug } = useParams()
  const [activeTab, setActiveTab] = useState('services')
  
  const { isAuthenticated, role } = useAuthStore()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const [business, setBusiness] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(null)
  
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    async function loadBusinessData() {
      try {
        setLoading(true)
        // Fetch salon by slug/id
        const data = await businessApi.getById(slug)
        setBusiness(data)
        try {
          const memData = await membershipApi.getAll(data.id)
          setMemberships(memData || [])
        } catch (e) {
          console.error("Failed to load memberships", e)
        }
      } catch (err) {
        console.error(err)
        showToast.error('Failed to load business details.')
      } finally {
        setLoading(false)
      }
    }
    if (slug) {
      loadBusinessData()
    }
  }, [slug])

  const handleBookService = (service) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    if (role !== 'customer') {
      showToast.error('Only customers can book services. Please login as a customer.')
      return
    }
    navigate(`/book/${business.id}?service=${service.id}`)
  }

  const handleBookNow = (e) => {
    if (!isAuthenticated) {
      e.preventDefault()
      setShowLoginModal(true)
      return
    }
    if (role !== 'customer') {
      e.preventDefault()
      showToast.error('Only customers can book services. Please login as a customer.')
    }
  }

  const services = business?.services || []
  const staff = business?.staff || []
  const reviews = business?.reviews || []

  // Group services by category
  const groupedServices = useMemo(() => {
    return services.reduce((acc, service) => {
      // In the database model, service category might be named 'Haircut', etc.
      // So we can fallback gracefully
      const cat = service.category || service.categoryId || 'General'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(service)
      return acc
    }, {})
  }, [services])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#405742]" />
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Business Not Found</h2>
          <Link to="/explore" className="text-brand-600 hover:underline">Return to Explore</Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'services', label: 'Services' },
    { id: 'memberships', label: 'Memberships' },
    { id: 'staff', label: 'Staff' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'about', label: 'About' }
  ]

  // Helper to format opening hours
  const formatOpeningHours = (hoursStr) => {
    if (!hoursStr) return '9:00 AM - 9:00 PM'
    try {
      let hours = hoursStr
      if (typeof hoursStr === 'string') {
        hours = JSON.parse(hoursStr)
      }
      if (Array.isArray(hours)) {
        // Just grab the first day's hours or find today's
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
        const todayHours = hours.find(h => h.day === today) || hours[0]
        if (todayHours.closed) return 'Closed Today'
        return `${todayHours.open} - ${todayHours.close}`
      }
      return hoursStr
    } catch (e) {
      return hoursStr
    }
  }

  const renderOpeningHoursList = (hoursStr) => {
    if (!hoursStr) {
      return (
        <div className="flex justify-between font-bold text-surface-900 dark:text-white">
          <span>Daily Schedule</span>
          <span>9:00 AM - 9:00 PM</span>
        </div>
      )
    }
    
    try {
      let hours = hoursStr
      if (typeof hoursStr === 'string') {
        hours = JSON.parse(hoursStr)
      }
      
      if (Array.isArray(hours)) {
        return (
          <div className="space-y-2">
            {hours.map((h, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-surface-600 dark:text-surface-400 font-medium">{h.day}</span>
                <span className="font-bold text-surface-900 dark:text-white">
                  {h.closed ? 'Closed' : `${h.open} - ${h.close}`}
                </span>
              </div>
            ))}
          </div>
        )
      }
      
      return (
        <div className="flex justify-between font-bold text-surface-900 dark:text-white">
          <span>Daily Schedule</span>
          <span className="text-right">{hoursStr}</span>
        </div>
      )
    } catch (e) {
      return (
        <div className="flex justify-between font-bold text-surface-900 dark:text-white">
          <span>Daily Schedule</span>
          <span className="text-right">{hoursStr}</span>
        </div>
      )
    }
  }

  const handleSubscribe = async (membershipId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    if (role !== 'customer') {
      showToast.error('Only customers can subscribe to memberships. Please login as a customer.')
      return
    }
    setSubscribing(membershipId)
    try {
      await membershipApi.subscribe(membershipId)
      showToast.success('Successfully subscribed to membership!')
    } catch (err) {
      console.error(err)
      showToast.error(err.response?.data?.detail || 'Failed to subscribe. Please ensure you have sufficient wallet balance.')
    } finally {
      setSubscribing(null)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      setShowReviewModal(false)
      setShowLoginModal(true)
      return
    }
    if (role !== 'customer') {
      showToast.error('Only customers can write reviews.')
      return
    }
    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      showToast.error('Please provide a valid rating between 1 and 5.')
      return
    }
    
    setSubmittingReview(true)
    try {
      const { user } = useAuthStore.getState()
      await reviewApi.create({
        salon_id: business.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        customer_name: user?.full_name || user?.name || 'Customer'
      })
      showToast.success('Review submitted successfully!')
      setShowReviewModal(false)
      setReviewForm({ rating: 5, comment: '' })
      // Reload business data to show new review
      const data = await businessApi.getById(slug)
      setBusiness(data)
    } catch (err) {
      console.error(err)
      showToast.error(err.response?.data?.detail || 'Failed to submit review.')
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-16">
      {/* ===== HERO GALLERY ===== */}
      <div className="h-[40vh] md:h-[50vh] flex gap-2 p-2">
        <div className="w-full md:w-2/3 h-full rounded-2xl overflow-hidden relative">
          <img src={business.coverImage || business.cover_image || business.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'} alt={business.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2">{business.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm font-medium">
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {business.rating} ({business.reviewCount})</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {business.city || 'No Area'}, Lahore</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Open: {formatOpeningHours(business.opening_hours)}</span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex w-1/3 flex-col gap-2">
          {(business.images || []).slice(0, 2).map((img, i) => (
            <div key={i} className="flex-1 rounded-2xl overflow-hidden">
              <img src={img} alt="Gallery" className="w-full h-full object-cover" />
            </div>
          ))}
          {(!business.images || business.images.length === 0) && (
            <div className="flex-1 rounded-2xl overflow-hidden bg-surface-200 dark:bg-surface-800 flex items-center justify-center">
              <span className="text-sm text-surface-500">No additional images</span>
            </div>
          )}
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Area */}
          <div className="lg:w-2/3">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline" className="mb-8" />

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-10">
                {Object.entries(groupedServices).length > 0 ? (
                  Object.entries(groupedServices).map(([categoryId, catServices]) => (
                    <div key={categoryId} className="scroll-mt-24" id={categoryId}>
                      <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-6 capitalize">{categoryId.replace('cat-', '')}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {catServices.map(service => (
                          <ServiceCard 
                            key={service.id} 
                            service={service} 
                            businessSlug={business.id} 
                            showBookButton={business.enable_online_booking !== false}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-surface-500 dark:text-surface-400">
                    No services configured for this salon.
                  </div>
                )}
              </div>
            )}

            {/* Memberships Tab */}
            {activeTab === 'memberships' && (
              <div className="space-y-6">
                {memberships.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {memberships.filter(m => m.is_active).map(plan => (
                      <div key={plan.id} className="bg-white dark:bg-surface-900 rounded-2xl border border-brand-200 dark:border-brand-900/30 overflow-hidden shadow-sm flex flex-col">
                        <div className="p-6 border-b border-surface-100 dark:border-surface-800 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-surface-900 relative">
                          <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
                            <Crown className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-1">{plan.name}</h3>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-surface-900 dark:text-white">Rs. {plan.price}</span>
                            <span className="text-sm text-surface-500">/{plan.duration || 'Month'}</span>
                          </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                          <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Included Perks:</h4>
                          <ul className="space-y-2 mb-6 flex-1">
                            {plan.perks && plan.perks.split(',').map((perk, i) => (
                              <li key={i} className="text-sm text-surface-600 dark:text-surface-400 flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                                <span>{perk.trim()}</span>
                              </li>
                            ))}
                          </ul>
                          <button
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={subscribing === plan.id}
                            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {subscribing === plan.id ? 'Processing...' : 'Subscribe Now'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-surface-500 dark:text-surface-400">
                    No active memberships available.
                  </div>
                )}
              </div>
            )}

            {/* Staff Tab */}
            {activeTab === 'staff' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {staff.length > 0 ? (
                  staff.map(member => (
                    <StaffCard key={member.id} staff={member} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 text-surface-500 dark:text-surface-400">
                    No staff members listed.
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (() => {
              const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
              reviews.forEach(r => {
                if (r.rating >= 1 && r.rating <= 5) {
                  breakdown[Math.floor(r.rating)] += 1
                }
              })
              
              return (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-surface-900 dark:text-white">Customer Reviews</h3>
                    <button 
                      onClick={() => setShowReviewModal(true)}
                      className="px-4 py-2 bg-[#405742] hover:bg-[#334d3b] text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
                    >
                      Write a Review
                    </button>
                  </div>
                  
                  {reviews.length > 0 && (
                    <AverageRatingWidget 
                      rating={business.rating} 
                      totalReviews={business.reviewCount} 
                      breakdown={breakdown} 
                    />
                  )}
                  {reviews.length > 0 && (
                    <AiTextRatingWidget aiRating={business.ai_aggregate_rating || business.aiAggregateRating} />
                  )}

                  {reviews.length > 0 ? (
                    reviews.map(review => (
                      <ReviewCard key={review.id} review={review} />
                    ))
                  ) : (
                    <div className="text-center py-12 text-surface-500 dark:text-surface-400">
                      No reviews yet. Be the first to review!
                    </div>
                  )}
                </div>
              )
            })()}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 space-y-6">
                <div>
                  <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">About {business.name}</h3>
                  <p className="text-surface-600 dark:text-surface-400 leading-relaxed">{business.description || 'No description provided.'}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-surface-900 dark:text-white mb-3">Location Details</h4>
                    <ul className="space-y-2 text-sm text-surface-600 dark:text-surface-400">
                      <li><strong>City:</strong> Lahore</li>
                      <li><strong>Area:</strong> {business.city || '-'}</li>
                      <li><strong>Town:</strong> {business.town || '-'}</li>
                      <li><strong>Street:</strong> {business.street_address || '-'}</li>
                      <li><strong>Shop No:</strong> {business.shop_no || '-'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 space-y-6">
              
              {/* Info Card */}
              <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm">
                {business.enable_online_booking !== false ? (
                  <Link 
                    to={`/book/${business.id}`} 
                    onClick={handleBookNow}
                    className="w-full block text-center bg-[#405742] hover:bg-[#334d3b] text-white font-bold py-3.5 rounded-xl transition-all shadow-brand hover:shadow-brand-lg mb-6"
                  >
                    Book Now
                  </Link>
                ) : (
                  <div className="w-full text-center bg-surface-100 dark:bg-surface-800 text-surface-500 font-bold py-3.5 rounded-xl mb-6 cursor-not-allowed">
                    Online Booking Disabled
                  </div>
                )}

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

                {/* Review Modal */}
                {showReviewModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 max-w-md w-full border border-surface-200 dark:border-surface-800 shadow-2xl">
                      <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Write a Review</h3>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Rating (1-5)</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                className="p-1 focus:outline-none"
                              >
                                <Star 
                                  className={`w-8 h-8 ${star <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-300 dark:text-surface-700'}`} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">Comment (Optional)</label>
                          <textarea 
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                            className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3 text-surface-900 dark:text-white focus:ring-2 focus:ring-[#405742] outline-none transition-all resize-none h-28"
                            placeholder="Share your experience..."
                          ></textarea>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <button
                            type="button"
                            onClick={() => setShowReviewModal(false)}
                            className="flex-1 py-3 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 font-semibold hover:bg-surface-50 dark:hover:bg-surface-800 transition-all text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submittingReview}
                            className="flex-1 py-3 rounded-xl bg-[#405742] hover:bg-[#334d3b] text-white font-semibold transition-all text-sm flex items-center justify-center disabled:opacity-50"
                          >
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-surface-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white">
                        {business.street_address || business.address || 'Address not listed'}
                      </p>
                      <p className="text-sm text-surface-500">
                        {business.city ? `${business.city}, ` : ''}Lahore, Pakistan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-surface-400 shrink-0" />
                    <p className="font-medium text-surface-900 dark:text-white">{business.contact_info || 'Not Listed'}</p>
                  </div>
                </div>

                <hr className="my-6 border-surface-100 dark:border-surface-800" />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-surface-900 dark:text-white">Opening Hours</span>
                    <span className="text-sm text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">Open</span>
                  </div>
                  <div className="mt-4">
                    {renderOpeningHoursList(business.opening_hours)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
