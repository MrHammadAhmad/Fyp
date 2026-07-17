import api from '../axios'

export const bookingApi = {
  create: async (data) => {
    const response = await api.post('/api/appointments/', data)
    return response.data
  },

  getMyBookings: async () => {
    const response = await api.get('/api/appointments/')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/api/appointments/${id}`)
    return response.data
  },

  cancel: async (id) => {
    const response = await api.put(`/api/appointments/${id}/status`, { status: 'cancelled' })
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/api/appointments/${id}`)
    return response.data
  },

  updateStatus: async (id, data) => {
    const response = await api.put(`/api/appointments/${id}/status`, data)
    return response.data
  },

  reschedule: async (id, data) => {
    const response = await api.put(`/api/appointments/${id}/reschedule`, data)
    return response.data
  },

  getAvailableSlots: async (salonId, date) => {
    const response = await api.get(`/api/salons/${salonId}/slots`, { params: { date } })
    const availableSlots = response.data.available_slots || []
    const allSlots = response.data.all_slots || ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
    
    return allSlots.map(slot => ({
      time: slot,
      available: availableSlots.includes(slot)
    }))
  },
}
