import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Tabs from '../../components/ui/Tabs'
import AppointmentCard from '../../components/cards/AppointmentCard'
import { bookingApi } from '../../api/services/bookingApi'
import { Loader2 } from 'lucide-react'
import ConfirmModal from '../../components/ui/ConfirmModal'
import toast from 'react-hot-toast'

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancelConfirm, setCancelConfirm] = useState({ isOpen: false, bookingId: null })
  const [reviewModal, setReviewModal] = useState({ isOpen: false, booking: null })
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const navigate = useNavigate()
  
  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past History' },
    { id: 'cancelled', label: 'Cancelled' }
  ]

  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      const data = await bookingApi.getMyBookings()
      setBookings(data)
    } catch (error) {
      console.error("Failed to fetch bookings", error)
      toast.error("Failed to load appointments.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleCancel = (booking) => {
    setCancelConfirm({ isOpen: true, bookingId: booking.id })
  }

  const confirmCancel = async () => {
    if (!cancelConfirm.bookingId) return
    try {
      await bookingApi.cancel(cancelConfirm.bookingId)
      toast.success("Appointment cancelled successfully!")
      fetchBookings() // Reload
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.detail || "Failed to cancel appointment.")
    }
  }

  const handleReschedule = (booking) => {
    navigate(`/dashboard/bookings/${booking.id}/reschedule`)
  }

  const handleOpenReview = (booking) => {
    setReviewModal({ isOpen: true, booking })
    setReviewForm({ rating: 5, comment: '' })
  }

  const submitReview = async () => {
    if (!reviewModal.booking) return
    setIsSubmittingReview(true)
    try {
      const payload = {
        salon_id: reviewModal.booking.salonId || reviewModal.booking.salon_id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        customer_name: "Customer" // Could be fetched from auth context
      }
      // api from axios
      const { default: api } = await import('../../api/axios')
      await api.post('/api/reviews/', payload)
      toast.success("Review submitted successfully!")
      setReviewModal({ isOpen: false, booking: null })
    } catch (error) {
      console.error(error)
      toast.error("Failed to submit review.")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const filteredBookings = useMemo(() => {
    const now = new Date();
    
    const isPast = (b) => {
      if (['completed', 'no-show'].includes(b.status)) return true;
      try {
        if (!b.date) return false;
        const [year, month, day] = b.date.split('-').map(Number);
        let hours = 0, minutes = 0;
        if (b.time && b.time.includes(':')) {
           const parts = b.time.split(':').map(Number);
           hours = parts[0] || 0;
           minutes = parts[1] || 0;
        }
        const appointmentDate = new Date(year, month - 1, day, hours, minutes);
        // Add 1 hour buffer
        const bufferDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000);
        return bufferDate < now;
      } catch (e) {
        return false;
      }
    };

    switch(activeTab) {
      case 'upcoming': 
        return bookings.filter(b => b.status !== 'cancelled' && !isPast(b))
      case 'past': 
        return bookings.filter(b => b.status !== 'cancelled' && isPast(b))
      case 'cancelled': 
        return bookings.filter(b => b.status === 'cancelled')
      default: return []
    }
  }, [bookings, activeTab])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#405742] w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">My Bookings</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">View and manage all your appointments.</p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" className="w-full sm:w-auto inline-flex bg-surface-100 dark:bg-surface-800 p-1 rounded-xl" />

      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <AppointmentCard 
              key={booking.id} 
              appointment={booking} 
              onCancel={activeTab === 'upcoming' ? () => handleCancel(booking) : undefined}
              onReschedule={activeTab === 'upcoming' ? () => handleReschedule(booking) : undefined}
              onReview={activeTab === 'past' ? () => handleOpenReview(booking) : undefined}
            />
          ))
        ) : (
          <div className="py-12 text-center border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-2xl">
            <p className="text-surface-500 dark:text-surface-400">No {activeTab} bookings found.</p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={cancelConfirm.isOpen}
        onClose={() => setCancelConfirm({ isOpen: false, bookingId: null })}
        onConfirm={confirmCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
        confirmText="Cancel Appointment"
        isDestructive
      />

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-900 rounded-2xl w-full max-w-md p-6 border border-surface-200 dark:border-surface-800 shadow-xl">
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Leave a Review</h2>
            <p className="text-sm text-surface-500 mb-6">How was your experience at {reviewModal.booking?.businessName}?</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className={`p-1 transition-colors ${
                        star <= reviewForm.rating ? 'text-amber-400' : 'text-surface-300 dark:text-surface-700'
                      }`}
                    >
                      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none h-32"
                  placeholder="Share your experience..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setReviewModal({ isOpen: false, booking: null })}
                className="flex-1 py-2.5 font-semibold text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-xl transition-colors"
                disabled={isSubmittingReview}
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="flex-1 py-2.5 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors flex items-center justify-center gap-2"
                disabled={isSubmittingReview}
              >
                {isSubmittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
