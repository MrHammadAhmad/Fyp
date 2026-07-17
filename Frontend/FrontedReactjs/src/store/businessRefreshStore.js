import { create } from 'zustand'

/**
 * businessRefreshStore
 *
 * A lightweight global signal store used to synchronize all business-owner
 * dashboard modules (Appointments, Calendar, Customers, Staff, Payments,
 * Reports, Dashboard) after a new booking is created via the NewBookingModal.
 *
 * Usage:
 *   // In the component that triggers a refresh (e.g. NewBookingModal):
 *   const incrementRefresh = useBusinessRefreshStore(s => s.incrementRefresh)
 *   incrementRefresh()
 *
 *   // In any page that should re-fetch data on new bookings:
 *   const refreshKey = useBusinessRefreshStore(s => s.refreshKey)
 *   useEffect(() => { fetchData() }, [refreshKey])
 */
export const useBusinessRefreshStore = create((set) => ({
  refreshKey: 0,
  lastBooking: null,

  // Call this after a booking is successfully created to trigger re-fetches
  incrementRefresh: (bookingData = null) =>
    set((state) => ({
      refreshKey: state.refreshKey + 1,
      lastBooking: bookingData || null,
    })),
}))
