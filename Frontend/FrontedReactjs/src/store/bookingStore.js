import { create } from 'zustand'

export const useBookingStore = create((set, get) => ({
  // Booking flow state
  currentStep: 1,
  totalSteps: 7,
  
  selectedBusiness: null,
  selectedService: null,
  selectedStaff: null,
  selectedDate: null,
  selectedTimeSlot: null,
  customerInfo: null,
  paymentInfo: null,
  
  // Booking confirmation
  confirmedBooking: null,
  
  // Actions
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, state.totalSteps) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  
  setSelectedBusiness: (business) => set({ selectedBusiness: business }),
  setSelectedService: (service) => set({ selectedService: service }),
  setSelectedStaff: (staff) => set({ selectedStaff: staff }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  setCustomerInfo: (info) => set({ customerInfo: info }),
  setPaymentInfo: (info) => set({ paymentInfo: info }),
  setConfirmedBooking: (booking) => set({ confirmedBooking: booking }),
  
  resetBooking: () => set({
    currentStep: 1,
    selectedService: null,
    selectedStaff: null,
    selectedDate: null,
    selectedTimeSlot: null,
    customerInfo: null,
    paymentInfo: null,
    confirmedBooking: null,
  }),
  
  getBookingData: () => {
    const state = get()
    return {
      businessId: state.selectedBusiness?.id,
      serviceId: state.selectedService?.id,
      staffId: state.selectedStaff?.id,
      date: state.selectedDate,
      timeSlot: state.selectedTimeSlot,
      customerInfo: state.customerInfo,
    }
  },
}))
