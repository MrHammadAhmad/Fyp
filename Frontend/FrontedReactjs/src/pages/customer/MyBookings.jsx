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
    </div>
  )
}
