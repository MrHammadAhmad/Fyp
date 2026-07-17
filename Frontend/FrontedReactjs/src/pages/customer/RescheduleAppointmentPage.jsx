import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'
import { bookingApi } from '../../api/services/bookingApi'
import { formatDate, formatTime } from '../../utils/helpers'

export default function RescheduleAppointmentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [appointment, setAppointment] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [timeSlots, setTimeSlots] = useState([])
  const [isChecking, setIsChecking] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)

  // 1. Fetch current appointment details
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        setIsLoading(true)
        const data = await bookingApi.getById(id)
        if (data) {
          setAppointment(data)
        } else {
          toast.error("Appointment not found")
          navigate('/dashboard/bookings')
        }
      } catch (error) {
        console.error(error)
        toast.error("Failed to load appointment details")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAppointmentDetails()
  }, [id])

  // 2. Fetch available slots whenever date changes
  useEffect(() => {
    if (!date || !appointment) return
    
    const fetchSlots = async () => {
      try {
        setIsChecking(true)
        setTime('') // Reset time when date changes
        const slots = await bookingApi.getAvailableSlots(appointment.salon_id, date)
        setTimeSlots(slots)
      } catch (error) {
        console.error(error)
        toast.error("Failed to fetch available times.")
      } finally {
        setIsChecking(false)
      }
    }
    fetchSlots()
  }, [date, appointment])

  const handleReschedule = async () => {
    if (!date || !time) {
      toast.error('Please select both date and time.')
      return
    }

    setIsRescheduling(true)
    try {
      // Append seconds if needed for the backend format "HH:MM:00"
      const formattedTime = time.length === 5 ? `${time}:00` : time
      await bookingApi.reschedule(id, { date, time: formattedTime })
      toast.success('Appointment rescheduled successfully!')
      navigate('/dashboard/bookings')
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.detail || 'Failed to reschedule appointment.')
    } finally {
      setIsRescheduling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-[#405742] w-10 h-10" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-surface-900 rounded-full shadow-sm hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
          <ArrowLeft size={20} className="text-surface-600 dark:text-surface-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            Reschedule Appointment
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Choose a new date and time for booking
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800 space-y-8">
        
        {/* Current Details */}
        {appointment && (
          <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-700">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3 uppercase tracking-wider">Current Appointment</h3>
            <p className="text-xs text-brand-600 dark:text-brand-400 font-bold mb-2">{appointment.serviceName} at {appointment.businessName}</p>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                  <CalendarIcon size={18} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">Date</p>
                  <p className="font-medium text-surface-900 dark:text-white">{formatDate(appointment.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                  <Clock size={18} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">Time</p>
                  <p className="font-medium text-surface-900 dark:text-white">{formatTime(appointment.time)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Select Date */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs">1</span>
              Select New Date
            </h3>
            <input 
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
            />
          </div>

          {/* Select Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs">2</span>
              Select New Time
            </h3>
            
            {date ? (
              isChecking ? (
                <div className="flex items-center justify-center gap-3 text-surface-500 py-12">
                  <Loader2 className="animate-spin text-[#405742] w-5 h-5" />
                  Checking slots...
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {timeSlots.map(slot => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setTime(slot.time)}
                      className={`py-2 px-1 text-sm rounded-lg border transition-all ${
                        time === slot.time
                          ? 'border-[#405742] bg-[#405742]/10 text-[#405742] font-semibold'
                          : !slot.available
                          ? 'border-surface-100 bg-surface-50 text-surface-300 dark:bg-surface-800 dark:text-surface-600 cursor-not-allowed'
                          : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:border-brand-300'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <CalendarIcon size={24} className="text-surface-400 mb-2" />
                <p className="text-sm text-surface-500 dark:text-surface-400">Please select a date first</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Status */}
        {!isChecking && time && (
          <div className="flex gap-3 text-[#405742] dark:text-[#5a7a62] bg-[#405742]/10 p-4 rounded-xl border border-[#405742]/20">
            <CheckCircle className="shrink-0" />
            <p className="text-sm font-medium">Selected time slot is available!</p>
          </div>
        )}

        <div className="pt-6 border-t border-surface-100 dark:border-surface-800 flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleReschedule} 
            disabled={!date || !time || isRescheduling || isChecking}
            className="bg-[#405742] hover:bg-[#334d3b]"
          >
            {isRescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
          </Button>
        </div>
      </div>
    </div>
  )
}
