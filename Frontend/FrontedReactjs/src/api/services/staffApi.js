import api from '../axios'

export const staffApi = {
  getStaff: async (salonId) => {
    const url = salonId ? `/api/staff/?salon_id=${salonId}` : '/api/staff/'
    const response = await api.get(url)
    return response.data
  },

  createStaff: async (staffData) => {
    const response = await api.post('/api/staff/', staffData)
    return response.data
  },

  updateStaff: async (staffId, staffData) => {
    const response = await api.put(`/api/staff/${staffId}`, staffData)
    return response.data
  },

  deleteStaff: async (staffId) => {
    const response = await api.delete(`/api/staff/${staffId}`)
    return response.data
  }
}
