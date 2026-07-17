import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Star, MapPin, Calendar, Clock, User, Scissors,
  CreditCard, Wallet as WalletIcon, DollarSign,
  Loader2, AlertCircle, MessageSquare
} from 'lucide-react'
import { businessApi } from '../../api/services/businessApi'
import { bookingApi } from '../../api/services/bookingApi'
import { paymentApi } from '../../api/services/paymentApi'
import DatePicker from '../../components/booking/DatePicker'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import toast from 'react-hot-toast'
import { formatPrice, formatDate, formatTime } from '../../utils/helpers'

export default function BookAppointment() {
  const navigate = useNavigate()

  // State
  const [salons, setSalons] = useState([])
  const [selectedSalonId, setSelectedSalonId] = useState('')
  const [selectedSalon, setSelectedSalon] = useState(null)
  
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [selectedService, setSelectedService] = useState(null)
  
  const [selectedStaffId, setSelectedStaffId] = useState('any')
  const [selectedStaff, setSelectedStaff] = useState({ id: 'any', name: 'Any Available' })
  
  const [selectedDate, setSelectedDate] = useState(null)
  const [timeSlots, setTimeSlots] = useState([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [walletBalance, setWalletBalance] = useState(null)

  // Loading states
  const [loadingSalons, setLoadingSalons] = useState(true)
  const [loadingSalonDetails, setLoadingSalonDetails] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load salons and wallet on mount
  useEffect(() => {
    async function initData() {
      try {
        setLoadingSalons(true)
        const [salonsRes, walletRes] = await Promise.all([
          businessApi.getAll().catch(() => ({ data: [] })),
          paymentApi.getWalletBalance().catch(() => ({ balance: 0 }))
        ])
        setSalons(salonsRes.data || [])
        setWalletBalance(walletRes.balance ?? 0)
      } catch (err) {
        console.error('Failed to initialize booking data:', err)
        toast.error('Failed to load initial booking details.')
      } finally {
        setLoadingSalons(false)
      }
    }
    initData()
  }, [])

  // Load salon details when selection changes
  useEffect(() => {
    if (!selectedSalonId) {
      setSelectedSalon(null)
      setSelectedServiceId('')
      setSelectedService(null)
      setSelectedStaffId('any')
      setSelectedStaff({ id: 'any', name: 'Any Available' })
      setSelectedTimeSlot('')
      setTimeSlots([])
      return
    }

    async function loadSalonDetails() {
      try {
        setLoadingSalonDetails(true)
        const details = await businessApi.getById(selectedSalonId)
        setSelectedSalon(details)
        
        // Reset dependent selections
        setSelectedServiceId('')
        setSelectedService(null)
        setSelectedStaffId('any')
        setSelectedStaff({ id: 'any', name: 'Any Available' })
        setSelectedTimeSlot('')
        setTimeSlots([])
      } catch (err) {
        console.error('Failed to fetch salon details:', err)
        toast.error('Failed to load salon details.')
      } finally {
        setLoadingSalonDetails(false)
      }
    }
    loadSalonDetails()
  }, [selectedSalonId])

  // Load available time slots when date or salon changes
  useEffect(() => {
    if (!selectedSalon || !selectedDate) {
      setTimeSlots([])
      setSelectedTimeSlot('')
      return
    }

    async function loadTimeSlots() {
      try {
        setLoadingSlots(true)
        const formattedDate = selectedDate.toISOString().split('T')[0]
        const slots = await bookingApi.getAvailableSlots(selectedSalon.id, formattedDate)
        setTimeSlots(slots || [])
        setSelectedTimeSlot('') // reset selection on date change
      } catch (err) {
        console.error('Failed to fetch time slots:', err)
        toast.error('Failed to load available time slots.')
      } finally {
        setLoadingSlots(false)
      }
    }
    loadTimeSlots()
  }, [selectedSalon, selectedDate])

  // Handles service dropdown changes
  const handleServiceChange = (e) => {
    const serviceId = e.target.value
    setSelectedServiceId(serviceId)
    if (!serviceId) {
      setSelectedService(null)
      return
    }
    const service = selectedSalon?.services?.find(s => s.id === serviceId)
    setSelectedService(service || null)
  }

  // Handles staff card selection
  const handleStaffSelect = (member) => {
    setSelectedStaffId(member.id)
    setSelectedStaff(member)
  }

  // Handles submit confirmation
  const handleConfirmBooking = async () => {
    if (!selectedSalon) {
      toast.error('Please select a salon.')
      return
    }
    if (!selectedService) {
      toast.error('Please select a service.')
      return
    }
    if (!selectedDate) {
      toast.error('Please select a date.')
      return
    }
    if (!selectedTimeSlot) {
      toast.error('Please select an appointment time slot.')
      return
    }

    // Verify wallet balance if chosen
    if (paymentMethod === 'wallet' && walletBalance !== null) {
      const price = selectedService.price || 0
      if (walletBalance < price) {
        toast.error('Insufficient wallet balance. Please top up or choose a different payment method.')
        return
      }
    }

    try {
      setIsSubmitting(true)
      
      const formattedDate = selectedDate.toISOString().split('T')[0]
      const formattedTime = selectedTimeSlot.length === 5 ? `${selectedTimeSlot}:00` : selectedTimeSlot
      
      const payload = {
        salon_id: selectedSalon.id,
        service_id: selectedService.id,
        date: formattedDate,
        time: formattedTime,
        booking_type: 'online',
        staff_id: selectedStaffId !== 'any' ? selectedStaffId : null,
        notes: notes || null,
        payment_method: paymentMethod
      }
      
      await bookingApi.create(payload)

      // Deduct balance mock if wallet selected (since DB does not deduct on backend)
      if (paymentMethod === 'wallet') {
        toast.success(`Booking confirmed successfully! Paid ${formatPrice(selectedService.price)} from your wallet.`)
      } else if (paymentMethod === 'cash') {
        toast.success(`Booking confirmed successfully! Please pay ${formatPrice(selectedService.price)} in cash at the salon.`)
      } else {
        toast.success('Booking confirmed successfully!')
      }

      navigate('/dashboard/bookings')
    } catch (error) {
      console.error('Booking confirmation failed:', error)
      toast.error(error.response?.data?.detail || 'Failed to confirm booking.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingSalons) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#405742] w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Book an Appointment</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">Select your salon, choose services, and pick a slot to confirm your booking.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Container (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Salon Selector Dropdown */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 space-y-4">
            <h2 className="text-base font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#405742]" /> 1. Select Salon
            </h2>
            
            <div className="relative">
              <select
                value={selectedSalonId}
                onChange={(e) => setSelectedSalonId(e.target.value)}
                className="w-full h-12 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl px-4 text-sm outline-none transition-all duration-200 cursor-pointer appearance-none text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-[#405742]"
              >
                <option value="">-- Choose a Salon --</option>
                {salons.map((salon) => (
                  <option key={salon.id} value={salon.id}>
                    {salon.name} ({salon.address || 'No address'})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Salon Details Card */}
            {loadingSalonDetails && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="animate-spin text-[#405742] w-6 h-6" />
              </div>
            )}

            {!loadingSalonDetails && selectedSalon && (
              <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-150 dark:border-surface-800">
                <img
                  src={selectedSalon.coverImage}
                  alt={selectedSalon.name}
                  className="w-full sm:w-32 h-24 object-cover rounded-lg flex-shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-surface-900 dark:text-white">{selectedSalon.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{(selectedSalon.rating || 0).toFixed(1)}</span>
                    <span className="text-surface-400 font-normal">({selectedSalon.reviewCount || 0} reviews)</span>
                  </div>
                  <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1.5 pt-1">
                    <MapPin className="w-4 h-4 text-surface-400" />
                    {selectedSalon.address || 'No address listed'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Service & Specialist Section */}
          {selectedSalon && (
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 space-y-6">
              
              {/* Service Selection */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-surface-900 dark:text-white flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-[#405742]" /> 2. Choose Service
                </h2>
                <select
                  value={selectedServiceId}
                  onChange={handleServiceChange}
                  className="w-full h-12 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl px-4 text-sm outline-none transition-all duration-200 cursor-pointer appearance-none text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-[#405742]"
                >
                  <option value="">-- Select a Service --</option>
                  {(selectedSalon.services || []).map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {formatPrice(service.price)} ({service.duration} mins)
                    </option>
                  ))}
                </select>
              </div>

              {/* Professional Selection */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-surface-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-[#405742]" /> 3. Select Professional
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Any Available option */}
                  <div
                    onClick={() => handleStaffSelect({ id: 'any', name: 'Any Available' })}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedStaffId === 'any'
                        ? 'border-[#405742] bg-[#405742]/5 dark:bg-[#405742]/10 ring-1 ring-[#405742]'
                        : 'border-surface-200 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-surface-900'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#405742] to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                      ✨
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-surface-900 dark:text-white text-xs">Any Available</h4>
                      <p className="text-[10px] text-surface-500 dark:text-surface-400">Best available specialist</p>
                    </div>
                  </div>

                  {/* Staff List */}
                  {(selectedSalon.staff || []).map((member) => {
                    const rating = member.rating || 4.9
                    const isSelected = selectedStaffId === member.id
                    return (
                      <div
                        key={member.id}
                        onClick={() => handleStaffSelect(member)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#405742] bg-[#405742]/5 dark:bg-[#405742]/10 ring-1 ring-[#405742]'
                            : 'border-surface-200 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-surface-900'
                        }`}
                      >
                        <Avatar src={member.avatar} alt={member.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-surface-900 dark:text-white text-xs truncate">{member.name}</h4>
                          <p className="text-[10px] text-surface-500 dark:text-surface-400 truncate">{member.role || 'Stylist'}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 text-amber-500 fill-current" />
                            <span className="text-[10px] font-bold text-surface-700 dark:text-surface-300">{rating}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Date & Time Picker Section */}
          {selectedSalon && (
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 space-y-6">
              {/* Date Selection */}
              <div>
                <h2 className="text-base font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#405742]" /> 4. Select Date
                </h2>
                <DatePicker
                  selectedDate={selectedDate}
                  onSelect={setSelectedDate}
                />
              </div>

              {/* Time Slot Selection */}
              {selectedDate && (
                <div className="space-y-4 pt-4 border-t border-surface-150 dark:border-surface-800">
                  <h2 className="text-base font-bold text-surface-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#405742]" /> 5. Select Time
                  </h2>
                  
                  {loadingSlots ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="animate-spin text-[#405742] w-6 h-6" />
                    </div>
                  ) : timeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          onClick={() => setSelectedTimeSlot(slot.time)}
                          className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all text-center border cursor-pointer select-none ${
                            selectedTimeSlot === slot.time
                              ? 'bg-[#405742] text-white border-[#405742] shadow-md shadow-[#405742]/15'
                              : slot.available
                              ? 'border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-[#405742] text-surface-700 dark:text-surface-300'
                              : 'opacity-30 cursor-not-allowed border-transparent bg-surface-100 dark:bg-surface-800/40 text-surface-400 line-through'
                          }`}
                        >
                          {formatTime(slot.time)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-surface-500 text-center py-2">No available time slots on this date.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notes & Payment Section */}
          {selectedSalon && (
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 space-y-6">
              
              {/* Special Notes (Optional) */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-surface-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#405742]" /> 6. Special Notes (Optional)
                </h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us any special requests, allergies, or requirements..."
                  rows={3}
                  className="w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-3.5 text-sm outline-none transition-all duration-200 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-[#405742] resize-none"
                />
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3 pt-4 border-t border-surface-150 dark:border-surface-800">
                <h2 className="text-base font-bold text-surface-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#405742]" /> 7. Select Payment Method
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Wallet Option */}
                  <div
                    onClick={() => setPaymentMethod('wallet')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'wallet'
                        ? 'border-[#405742] bg-[#405742]/5 dark:bg-[#405742]/10 ring-1 ring-[#405742]'
                        : 'border-surface-200 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-surface-900'
                    }`}
                  >
                    <WalletIcon className="w-5 h-5 text-[#405742] flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-surface-900 dark:text-white text-xs">Wallet</h4>
                      <p className="text-[10px] text-surface-500 dark:text-surface-400 truncate">
                        Bal: {walletBalance !== null ? formatPrice(walletBalance) : '$0.00'}
                      </p>
                    </div>
                  </div>

                  {/* Cash Option */}
                  <div
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-[#405742] bg-[#405742]/5 dark:bg-[#405742]/10 ring-1 ring-[#405742]'
                        : 'border-surface-200 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-surface-900'
                    }`}
                  >
                    <DollarSign className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-surface-900 dark:text-white text-xs">Cash (Hand-to-Hand)</h4>
                      <p className="text-[10px] text-surface-500 dark:text-surface-400">Pay at Salon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Booking Summary Sidebar (1 col) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-lg text-surface-900 dark:text-white border-b border-surface-150 dark:border-surface-800 pb-4 mb-4">
              Booking Summary
            </h3>

            <div className="space-y-4">
              {/* Salon info */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wide">Salon</span>
                <p className="text-sm font-semibold text-surface-900 dark:text-white">
                  {selectedSalon ? selectedSalon.name : <span className="text-surface-400 italic">Select a salon</span>}
                </p>
              </div>

              {/* Service info */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wide">Service</span>
                <p className="text-sm font-semibold text-surface-900 dark:text-white">
                  {selectedService ? (
                    `${selectedService.name} (${selectedService.duration} mins)`
                  ) : (
                    <span className="text-surface-400 italic">Select a service</span>
                  )}
                </p>
              </div>

              {/* Barber / Professional info */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wide">Professional</span>
                <p className="text-sm font-semibold text-surface-900 dark:text-white">
                  {selectedStaff ? selectedStaff.name : 'Any Available'}
                </p>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wide">Date</span>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">
                    {selectedDate ? formatDate(selectedDate) : <span className="text-surface-400 italic">Select date</span>}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wide">Time</span>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">
                    {selectedTimeSlot ? formatTime(selectedTimeSlot) : <span className="text-surface-400 italic">Select time</span>}
                  </p>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="pt-4 border-t border-surface-150 dark:border-surface-800 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Service Price</span>
                  <span className="font-semibold text-surface-900 dark:text-white">
                    {selectedService ? formatPrice(selectedService.price) : '$0.00'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-dashed border-surface-150 dark:border-surface-800">
                  <span className="text-surface-900 dark:text-white">Total</span>
                  <span className="text-brand-600 dark:text-brand-400">
                    {selectedService ? formatPrice(selectedService.price) : '$0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet warning */}
            {selectedService && paymentMethod === 'wallet' && walletBalance !== null && walletBalance < selectedService.price && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">Insufficient wallet balance</p>
                  <p className="opacity-80">You need {formatPrice(selectedService.price - walletBalance)} more. Please top up or select another payment method.</p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-6 space-y-2.5">
              <Button
                variant="primary"
                fullWidth
                loading={isSubmitting}
                disabled={
                  !selectedSalon ||
                  !selectedService ||
                  !selectedDate ||
                  !selectedTimeSlot ||
                  (paymentMethod === 'wallet' && walletBalance !== null && walletBalance < selectedService.price)
                }
                onClick={handleConfirmBooking}
              >
                Confirm Booking
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate('/dashboard')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
