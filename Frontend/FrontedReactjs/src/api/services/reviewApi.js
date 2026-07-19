import api from '../axios'

export const reviewApi = {
  getAll: async (salonId) => {
    const response = await api.get(`/api/reviews/${salonId}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/api/reviews/', data)
    return response.data
  },

  reply: async (reviewId, reply) => {
    const response = await api.put(`/api/reviews/${reviewId}/reply`, { reply })
    return response.data
  },

  evaluateService: async (data) => {
    const response = await api.post('/api/reviews/service', data)
    return response.data
  }
}
