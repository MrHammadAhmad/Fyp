import api from '../axios'

export const membershipApi = {
  // Get all plans for a salon
  getAll: async (salonId) => {
    const res = await api.get('/api/memberships/', { params: { salon_id: salonId } })
    return res.data
  },

  // Create a new plan
  create: async (data) => {
    const res = await api.post('/api/memberships/', data)
    return res.data
  },

  // Update an existing plan
  update: async (membershipId, data) => {
    const res = await api.put(`/api/memberships/${membershipId}`, data)
    return res.data
  },

  // Delete a plan
  delete: async (membershipId) => {
    const res = await api.delete(`/api/memberships/${membershipId}`)
    return res.data
  },

  // Customer: Subscribe to a plan
  subscribe: async (membershipId) => {
    const res = await api.post(`/api/memberships/${membershipId}/subscribe`)
    return res.data
  },

  // Customer: Get my memberships
  getMyMemberships: async () => {
    const res = await api.get('/api/memberships/my-memberships')
    return res.data
  },

  // Customer: Cancel an active membership
  cancelMembership: async (userMembershipId) => {
    const res = await api.post(`/api/memberships/my-memberships/${userMembershipId}/cancel`)
    return res.data
  }
}
