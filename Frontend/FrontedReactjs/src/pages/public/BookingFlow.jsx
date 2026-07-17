import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useBooking } from '../../hooks/useBooking'
import StepIndicator from '../../components/booking/StepIndicator'
import ServiceSelector from '../../components/booking/ServiceSelector'
import StaffSelector from '../../components/booking/StaffSelector'
import DatePicker from '../../components/booking/DatePicker'
import TimeSlotPicker from '../../components/booking/TimeSlotPicker'
import BookingConfirmation from '../../components/booking/BookingConfirmation'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import showToast from '../../components/ui/Toast'
import { businessApi } from '../../api/services/businessApi'
import { bookingApi } from '../../api/services/bookingApi'

export default function BookingFlow() {
  const { businessSlug } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  
  const { 
    currentStep, setCurrentStep, totalSteps, canProceed, stepLabels,
    selectedBusiness, setSelectedBusiness,
    selectedService, setSelectedService,
    selectedStaff, setSelectedStaff,
    selectedDate, setSelectedDate,
    selectedTimeSlot, setSelectedTimeSlot,
    customerInfo, setCustomerInfo,
    resetBooking
  } = useBooking()

  // Initialize business data
  useEffect(() => {
    async function fetchBusiness() {
      try {
        setLoading(true)
        const business = await businessApi.getById(businessSlug)
        if (business) {
          setSelectedBusiness(business)
        } else {
          showToast.error('Business not found.')
          navigate('/explore')
        }
      } catch (err) {
        console.error(err)
        showToast.error('Failed to load business details.')
        navigate('/explore')
      } finally {
        setLoading(false)
      }
    }
    if (businessSlug) {
      fetchBusiness()
    }
  }, [businessSlug])

  const businessServices = selectedBusiness?.services || []
  const serviceStaff = selectedBusiness?.staff || []

  // Customer form state
  const [formData, setFormData] = useState({
    firstName: customerInfo?.firstName || '',
    lastName: customerInfo?.lastName || '',
    email: customerInfo?.email || '',
    phone: customerInfo?.phone || '',
    notes: customerInfo?.notes || ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = () => {
    if (currentStep === 6) {
      // Validate customer info before moving to confirmation
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        showToast.error('Please fill in all required fields')
        return
      }
      setCustomerInfo(formData)
    }
    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep === 1) {
      navigate(`/business/${businessSlug}`)
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true)
      
      const formattedDate = typeof selectedDate === 'string' 
        ? selectedDate 
        : selectedDate instanceof Date 
        ? selectedDate.toISOString().split('T')[0] 
        : new Date(selectedDate).toISOString().split('T')[0]
        
      const formattedTime = selectedTimeSlot.length === 5 ? `${selectedTimeSlot}:00` : selectedTimeSlot
      
      const payload = {
        salon_id: selectedBusiness.id,
        service_id: selectedService.id,
        date: formattedDate,
        time: formattedTime,
        booking_type: 'online'
      }
      
      await bookingApi.create(payload)
      
      setIsSubmitting(false)
      showToast.success('Booking confirmed successfully!')
      resetBooking()
      navigate('/dashboard/bookings')
    } catch (error) {
      console.error(error)
      showToast.error(error.response?.data?.detail || 'Failed to confirm booking.')
      setIsSubmitting(false)
    }
  }

  // Determine what to render based on step
  // 1: Business info (skip, auto-handled by URL)
  // 2: Service
  // 3: Staff
  // 4: Date
  // 5: Time
  // 6: Customer Info
  // 7: Confirmation

  const openingHours = useMemo(() => {
    if (!selectedBusiness?.opening_hours) return []
    let hours = selectedBusiness.opening_hours
    try {
      if (typeof hours === 'string') {
        hours = JSON.parse(hours)
      }
    } catch (e) {
      return []
    }
    return Array.isArray(hours) ? hours : []
  }, [selectedBusiness])

  const selectedDaySchedule = useMemo(() => {
    if (!selectedDate || openingHours.length === 0) return { startTime: '09:00', endTime: '18:00', closed: false }
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' })
    const schedule = openingHours.find(h => h.day === dayName)
    if (!schedule) return { startTime: '09:00', endTime: '18:00', closed: false }
    return {
      startTime: schedule.open || '09:00',
      endTime: schedule.close || '18:00',
      closed: schedule.closed === true || schedule.closed === 'true'
    }
  }, [selectedDate, openingHours])


  useEffect(() => {
    if (currentStep === 1) {
      setCurrentStep(2) // Skip step 1 as it's implied by the route
    }
  }, [currentStep, setCurrentStep])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-surface-50 dark:bg-surface-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#405742]" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] mt-16 bg-surface-50 dark:bg-surface-950 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <button onClick={handleBack} className="flex items-center gap-2 text-sm font-semibold text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">
            Booking with {selectedBusiness?.name}
          </h1>

          <div className="bg-white dark:bg-surface-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-surface-200 dark:border-surface-800">
            <StepIndicator steps={stepLabels.slice(1)} currentStep={currentStep - 1} />
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 p-6 sm:p-8 min-h-[400px]">
          
          {currentStep === 2 && (
            <ServiceSelector 
              services={businessServices}
              selectedService={selectedService}
              onSelect={(s) => { setSelectedService(s); setSelectedStaff(null); handleNext() }}
            />
          )}

          {currentStep === 3 && (
            <StaffSelector 
              staff={serviceStaff}
              selectedStaff={selectedStaff}
              onSelect={(s) => { setSelectedStaff(s); handleNext() }}
            />
          )}

          {currentStep === 4 && (
            <DatePicker 
              selectedDate={selectedDate}
              openingHours={openingHours}
              onSelect={(d) => { setSelectedDate(d); handleNext() }}
            />
          )}

          {currentStep === 5 && (
            <TimeSlotPicker 
              selectedTime={selectedTimeSlot}
              startTime={selectedDaySchedule.startTime}
              endTime={selectedDaySchedule.endTime}
              onSelect={(t) => { setSelectedTimeSlot(t); handleNext() }}
            />
          )}

          {currentStep === 6 && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-1">Your Details</h2>
                <p className="text-sm text-surface-500 dark:text-surface-400">Please provide your contact information</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                <Input label="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
              </div>
              <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              <Input label="Phone Number" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Order Notes (Optional)</label>
                <textarea 
                  className="w-full min-h-[100px] p-3 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any special requests or notes for the specialist?"
                />
              </div>

              <Button fullWidth size="lg" onClick={handleNext}>Continue to Confirmation</Button>
            </div>
          )}

          {currentStep === 7 && (
            <BookingConfirmation 
              bookingData={{ date: selectedDate, timeSlot: selectedTimeSlot }}
              business={selectedBusiness}
              service={selectedService}
              staff={selectedStaff}
              onConfirm={handleConfirm}
              onEdit={setCurrentStep}
              isSubmitting={isSubmitting}
            />
          )}

        </div>
      </div>
    </div>
  )
}
