import { useBookingStore } from '../store/bookingStore'

export function useBooking() {
  const store = useBookingStore()

  const canProceed = () => {
    const { currentStep, selectedService, selectedStaff, selectedDate, selectedTimeSlot } = store
    switch (currentStep) {
      case 1: return true // Business info (always visible)
      case 2: return !!selectedService
      case 3: return !!selectedStaff
      case 4: return !!selectedDate
      case 5: return !!selectedTimeSlot
      case 6: return true // Customer info (validated by form)
      case 7: return true // Confirmation
      default: return false
    }
  }

  const stepLabels = [
    'Business',
    'Service',
    'Staff',
    'Date',
    'Time',
    'Details',
    'Confirm'
  ]

  return {
    ...store,
    canProceed: canProceed(),
    stepLabels,
  }
}
