import api from '../axios'

export const aiApi = {
  chatWithAI: async (payload) => {
    const response = await api.post('/api/ai/chat', payload)
    return response.data
  },

  getSalonRecommendations: async (payload) => {
    const response = await api.post('/api/ai/recommend-salon', payload)
    return response.data
  },

  getServiceSuggestions: async (payload) => {
    const response = await api.post('/api/ai/recommend-service', payload)
    return response.data
  },

  getReviewAnalysis: async (businessId) => {
    const response = await api.get(`/api/ai/review-analysis/${businessId}`)
    return response.data
  },

  analyzeHair: async (formData) => {
    const response = await api.post('/api/ai/hair-analysis', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  analyzeSkin: async (formData) => {
    const response = await api.post('/api/ai/skin-analysis', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  getOwnerInsights: async () => {
    const response = await api.get('/api/owner/ai-insights')
    return response.data
  }
}
