import { mockDelay } from '../axios'

// Mock dashboard analytics data
const generateRevenue = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months.map((month, i) => ({
    month,
    revenue: Math.floor(3000 + Math.random() * 8000),
    bookings: Math.floor(40 + Math.random() * 120),
    clients: Math.floor(20 + Math.random() * 60),
  }))
}

export const dashboardApi = {
  getBusinessOverview: async () => {
    await mockDelay(600)
    return {
      revenue: { value: 28450, change: 12.5, trend: 'up' },
      bookings: { value: 342, change: 8.2, trend: 'up' },
      customers: { value: 1284, change: 5.1, trend: 'up' },
      conversionRate: { value: 68.4, change: -2.3, trend: 'down' },
      newClients: { value: 47, change: 18.0, trend: 'up' },
      avgBookingValue: { value: 83.2, change: 4.1, trend: 'up' },
    }
  },

  getRevenueChart: async (period = 'monthly') => {
    await mockDelay(500)
    return generateRevenue()
  },

  getTopServices: async () => {
    await mockDelay(400)
    return [
      { name: 'Balayage & Highlights', bookings: 89, revenue: 19580, percentage: 38 },
      { name: 'Haircut & Style', bookings: 124, revenue: 10540, percentage: 52 },
      { name: 'Keratin Treatment', bookings: 34, revenue: 10880, percentage: 14 },
      { name: 'Color Correction', bookings: 21, revenue: 6300, percentage: 9 },
      { name: 'Blowout', bookings: 74, revenue: 4440, percentage: 31 },
    ]
  },

  getStaffPerformance: async () => {
    await mockDelay(400)
    return [
      { name: 'Emma Rivera', bookings: 142, revenue: 15240, rating: 5.0, utilization: 94 },
      { name: 'Jordan Kim', bookings: 98, revenue: 8820, rating: 4.8, utilization: 78 },
      { name: 'Sofia Chen', bookings: 67, revenue: 4690, rating: 4.7, utilization: 62 },
    ]
  },

  getRecentBookings: async () => {
    await mockDelay(400)
    return [
      { id: 'bk1', customer: 'Alex J.', service: 'Balayage', staff: 'Emma', time: '2:30 PM', status: 'confirmed', amount: 220 },
      { id: 'bk2', customer: 'Maria S.', service: 'Haircut', staff: 'Jordan', time: '3:00 PM', status: 'confirmed', amount: 85 },
      { id: 'bk3', customer: 'Tom K.', service: 'Keratin', staff: 'Emma', time: '4:00 PM', status: 'pending', amount: 320 },
      { id: 'bk4', customer: 'Lisa M.', service: 'Blowout', staff: 'Sofia', time: '5:30 PM', status: 'confirmed', amount: 65 },
      { id: 'bk5', customer: 'James R.', service: 'Color', staff: 'Jordan', time: '10:00 AM', status: 'completed', amount: 150 },
    ]
  },

  getAdminOverview: async () => {
    await mockDelay(700)
    return {
      totalBusinesses: { value: 1284, change: 8.5, trend: 'up' },
      totalUsers: { value: 48720, change: 12.3, trend: 'up' },
      totalBookings: { value: 284500, change: 15.2, trend: 'up' },
      platformRevenue: { value: 142500, change: 22.1, trend: 'up' },
      activeSubscriptions: { value: 892, change: 6.4, trend: 'up' },
      avgNPS: { value: 74, change: 3.2, trend: 'up' },
    }
  },
}
