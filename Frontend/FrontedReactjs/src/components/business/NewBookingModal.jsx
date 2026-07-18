import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Scissors, Calendar, Clock, CheckCircle2, Loader2, ChevronDown } from 'lucide-react'
import { createPortal } from 'react-dom'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { businessApi } from '../../api/services/businessApi'
import { bookingApi } from '../../api/services/bookingApi'
import showToast from '../ui/Toast'
import { cn } from '../../utils/helpers'
import { useBusinessRefreshStore } from '../../store/businessRefreshStore'
import servicesData from '../../data/services.json'
import staffData from '../../data/staff.json'
import { useCategoryStore } from '../../store/categoryStore'

const STEPS = ['Details', 'Service', 'Schedule', 'Confirm']

export default function NewBookingModal({ isOpen, onClose }) {
  const incrementRefresh = useBusinessRefreshStore((s) => s.incrementRefresh)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Salon data
  const [salon, setSalon] = useState(null)
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])

  // Form state
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [selectedService, setSelectedService] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('pending')

  // Slots state
  const [timeSlots, setTimeSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Errors
  const [errors, setErrors] = useState({})

  const reset = useCallback(() => {
    setStep(0)
    setCustomerName('')
    setCustomerPhone('')
    setSelectedService(null)
    setSelectedStaff(null)
    setSelectedDate('')
    setSelectedTime('')
    setNotes('')
    setPaymentStatus('pending')
    setErrors({})
    setSuccess(false)
    setTimeSlots([])
  }, [])

  // Load salon data on open
  useEffect(() => {
    if (!isOpen) return
    reset()
    async function loadSalon() {
      setLoading(true)
      try {
        const mySalon = await businessApi.getMySalon()
        setSalon(mySalon)
        if (mySalon?.id) {
          const svcRes = await businessApi.getRealServices(mySalon.id).catch(() => [])
          const staffRes = await businessApi.getStaff(mySalon.id).catch(() => [])
          
          let finalServices = (svcRes && svcRes.length > 0) ? svcRes : servicesData.filter((s) => s.businessId === 'b1')
          const finalStaff = (staffRes && staffRes.length > 0) ? staffRes : staffData.filter((s) => s.businessId === 'b1')
          
          const globalCategories = useCategoryStore.getState().categories;
          const existingCategoryIds = new Set(finalServices.map(s => s.category || s.categoryId));
          const existingServiceNames = new Set(finalServices.map(s => s.name.toLowerCase()));
          
          const mockServices = globalCategories
            .filter(cat => !existingCategoryIds.has(cat.id) && !existingServiceNames.has(cat.name.toLowerCase()))
            .map((cat, idx) => ({
              id: `mock-s-${cat.id}`,
              businessId: mySalon.id,
              categoryId: cat.id,
              name: cat.name,
              description: `Professional ${cat.name} treatment`,
              price: 30 + (idx * 5),
              duration: 30
            }));
          finalServices = [...finalServices, ...mockServices];

          setServices(finalServices)
          setStaff(finalStaff)
        }
      } catch (e) {
        showToast.error('Failed to load salon data.')
      } finally {
        setLoading(false)
      }
    }
    loadSalon()
  }, [isOpen, reset])

  // Load available time slots when date changes
  useEffect(() => {
    if (!salon || !selectedDate) {
      setTimeSlots([])
      setSelectedTime('')
      return
    }

    async function loadTimeSlots() {
      try {
        setLoadingSlots(true)
        const slots = await bookingApi.getAvailableSlots(salon.id, selectedDate)
        setTimeSlots(slots || [])
        setSelectedTime('') // reset selection on date change
      } catch (err) {
        console.error('Failed to fetch time slots:', err)
        showToast.error('Failed to load available time slots.')
      } finally {
        setLoadingSlots(false)
      }
    }
    loadTimeSlots()
  }, [salon, selectedDate])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Lock scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const validate = () => {
    const errs = {}
    if (step === 0) {
      if (!customerName.trim()) errs.customerName = 'Customer name is required'
      if (!customerPhone.trim()) errs.customerPhone = 'Phone number is required'
    }
    if (step === 1) {
      if (!selectedService) errs.service = 'Please select a service'
    }
    if (step === 2) {
      if (!selectedDate) errs.date = 'Please pick a date'
      if (!selectedTime) errs.time = 'Please pick a time slot'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (!validate()) return
    setStep((s) => s + 1)
  }

  const handleBack = () => setStep((s) => s - 1)

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = {
        salon_id: salon.id,
        service_id: selectedService.id,
        date: selectedDate,
        time: selectedTime + ':00',
        booking_type: 'walk-in',
        customer_name: customerName.trim() || null,
        customer_phone: customerPhone.trim() || null,
        staff_id: selectedStaff?.id || null,
        notes: notes.trim() || null,
        payment_method: 'cash',
        payment_status: paymentStatus
      }
      const result = await bookingApi.create(payload)
      setSuccess(true)
      showToast.success('Booking created successfully!')
      // Signal all dashboard modules to refresh their data
      incrementRefresh(result?.appointment || payload)
      setTimeout(() => {
        onClose()
        reset()
      }, 1800)
    } catch (e) {
      showToast.error(e?.response?.data?.detail || 'Failed to create booking.')
    } finally {
      setSubmitting(false)
    }
  }

  // Min date = today
  const today = new Date().toISOString().split('T')[0]

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.28, type: 'spring', damping: 26, stiffness: 380 }}
            className="relative w-full max-w-lg bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-surface-200 dark:border-surface-800 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-surface-100 dark:border-surface-800">
              <div>
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">New Booking</h2>
                <p className="text-xs text-surface-400 mt-0.5">Walk-in appointment for your salon</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-surface-400 hover:text-surface-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex items-center gap-0">
                {STEPS.map((label, i) => (
                  <React.Fragment key={label}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                        i < step ? 'bg-[#405742] text-white' :
                        i === step ? 'bg-[#405742] text-white ring-4 ring-[#405742]/20' :
                        'bg-surface-100 dark:bg-surface-800 text-surface-400'
                      )}>
                        {i < step ? <CheckCircle2 size={14} /> : i + 1}
                      </div>
                      <span className={cn(
                        'text-[10px] font-medium whitespace-nowrap',
                        i === step ? 'text-[#405742]' : 'text-surface-400'
                      )}>{label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={cn(
                        'flex-1 h-0.5 mb-4 mx-1 transition-all',
                        i < step ? 'bg-[#405742]' : 'bg-surface-200 dark:bg-surface-700'
                      )} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4 min-h-[240px] overflow-y-auto flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="animate-spin text-[#405742]" size={32} />
                </div>
              ) : success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-48 gap-3"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="text-green-600" size={36} />
                  </div>
                  <p className="text-lg font-bold text-surface-900 dark:text-white">Booking Created!</p>
                  <p className="text-sm text-surface-500">The appointment has been added successfully.</p>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.18 }}
                  >
                    {/* Step 0 – Customer Details */}
                    {step === 0 && (
                      <div className="space-y-4">
                        <Input
                          label="Customer Name"
                          placeholder="e.g. Sarah Ahmed"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          error={errors.customerName}
                          leftIcon={<User size={15} />}
                        />
                        <Input
                          label="Phone Number"
                          type="tel"
                          placeholder="e.g. +92 300 1234567"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          error={errors.customerPhone}
                        />
                        <div className="w-full space-y-1.5">
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Notes (optional)</label>
                          <textarea
                            rows={2}
                            placeholder="Any special requests..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full rounded-xl border px-4 py-2.5 text-sm resize-none bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 placeholder-surface-400 border-surface-200 dark:border-surface-700 focus:outline-none focus:ring-2 focus:ring-[#405742]/30 focus:border-[#405742] transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 1 – Service */}
                    {step === 1 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Select a Service</p>
                        {services.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 gap-2 text-surface-400">
                            <Scissors size={28} />
                            <p className="text-sm">No services found for your salon.</p>
                            <p className="text-xs">Add services in Manage Salon first.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                            {services.map((svc) => (
                              <button
                                key={svc.id}
                                onClick={() => setSelectedService(svc)}
                                className={cn(
                                  'flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all',
                                  selectedService?.id === svc.id
                                    ? 'border-[#405742] bg-[#405742]/8 dark:bg-[#405742]/15'
                                    : 'border-surface-200 dark:border-surface-700 hover:border-[#405742]/50'
                                )}
                              >
                                <div>
                                  <p className="text-sm font-semibold text-surface-900 dark:text-white">{svc.name}</p>
                                  <p className="text-xs text-surface-500 mt-0.5">{svc.duration} min</p>
                                </div>
                                <span className="text-sm font-bold text-[#405742]">
                                  PKR {parseFloat(svc.price || 0).toLocaleString()}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                        {errors.service && <p className="text-xs text-red-500">{errors.service}</p>}

                        {/* Optional staff picker */}
                        {staff.length > 0 && (
                          <div className="pt-2">
                            <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                              Assign Staff <span className="text-surface-400 font-normal">(optional)</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setSelectedStaff(null)}
                                className={cn(
                                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                                  !selectedStaff
                                    ? 'border-[#405742] bg-[#405742] text-white'
                                    : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-[#405742]/50'
                                )}
                              >
                                Any
                              </button>
                              {staff.map((s) => (
                                <button
                                  key={s.id}
                                  onClick={() => setSelectedStaff(s)}
                                  className={cn(
                                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                                    selectedStaff?.id === s.id
                                      ? 'border-[#405742] bg-[#405742] text-white'
                                      : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-[#405742]/50'
                                  )}
                                >
                                  {s.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2 – Schedule */}
                    {step === 2 && (
                      <div className="space-y-4">
                        <Input
                          label="Date"
                          type="date"
                          value={selectedDate}
                          min={today}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          error={errors.date}
                          leftIcon={<Calendar size={15} />}
                        />
                        <div className="w-full space-y-1.5">
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Time Slot</label>
                          {loadingSlots ? (
                            <div className="flex justify-center py-6">
                              <Loader2 className="animate-spin text-[#405742] w-6 h-6" />
                            </div>
                          ) : timeSlots.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto pr-1">
                              {timeSlots.map((slot) => (
                                <button
                                  key={slot.time}
                                  disabled={!slot.available}
                                  onClick={() => setSelectedTime(slot.time)}
                                  className={cn(
                                    'py-2 rounded-xl text-xs font-semibold border-2 transition-all select-none',
                                    selectedTime === slot.time
                                      ? 'border-[#405742] bg-[#405742] text-white'
                                      : slot.available
                                      ? 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-[#405742]/50'
                                      : 'opacity-30 cursor-not-allowed border-transparent bg-surface-100 dark:bg-surface-800/40 text-surface-400 line-through'
                                  )}
                                >
                                  {slot.time}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-surface-500 text-center py-2">No available time slots on this date.</p>
                          )}
                          {errors.time && <p className="text-xs text-red-500">{errors.time}</p>}
                        </div>
                      </div>
                    )}

                    {/* Step 3 – Confirm */}
                    {step === 3 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Review Booking</p>
                        <div className="bg-surface-50 dark:bg-surface-800/50 rounded-2xl p-4 space-y-3 border border-surface-100 dark:border-surface-700">
                          <Row icon={<User size={14} />} label="Customer" value={customerName} />
                          {customerPhone && <Row icon={<User size={14} />} label="Phone" value={customerPhone} />}
                          <Row icon={<Scissors size={14} />} label="Service" value={selectedService?.name} extra={`PKR ${parseFloat(selectedService?.price || 0).toLocaleString()}`} />
                          {selectedStaff && <Row icon={<User size={14} />} label="Staff" value={selectedStaff.name} />}
                          <Row icon={<Calendar size={14} />} label="Date" value={selectedDate} />
                          <Row icon={<Clock size={14} />} label="Time" value={selectedTime} extra={`${selectedService?.duration} min`} />
                          {notes && <Row icon={<Clock size={14} />} label="Notes" value={notes} />}
                        </div>
                        
                        <div className="mt-4 space-y-1.5">
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Payment Status</label>
                          <select
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value)}
                            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 border-surface-200 dark:border-surface-700 focus:ring-2 focus:ring-[#405742]/30 focus:border-[#405742] transition-all"
                          >
                            <option value="pending">Pending (Unpaid)</option>
                            <option value="paid">Paid (Collected Cash)</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 px-1 mt-4">
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <p className="text-xs text-surface-500">Booking type: <span className="font-semibold text-surface-700 dark:text-surface-300">Walk-in</span></p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {!loading && !success && (
              <div className="px-6 py-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={step === 0 ? onClose : handleBack}
                >
                  {step === 0 ? 'Cancel' : '← Back'}
                </Button>
                {step < 3 ? (
                  <Button
                    size="sm"
                    variant="brand405"
                    onClick={handleNext}
                    disabled={step === 1 && services.length === 0}
                  >
                    Next →
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="brand405"
                    onClick={handleSubmit}
                    loading={submitting}
                  >
                    Confirm Booking
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

function Row({ icon, label, value, extra }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-[#405742] flex-shrink-0">{icon}</span>
      <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
        <div>
          <span className="text-xs text-surface-400">{label}</span>
          <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{value}</p>
        </div>
        {extra && <span className="text-xs font-semibold text-[#405742] flex-shrink-0">{extra}</span>}
      </div>
    </div>
  )
}
