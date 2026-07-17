import api from '../axios'

export const favoritesApi = {
  getFavorites: async () => {
    const response = await api.get('/api/favorites/')
    return response.data
  },

  addFavorite: async (salonId) => {
    const response = await api.post(`/api/favorites/${salonId}`)
    return response.data
  },

  removeFavorite: async (salonId) => {
    const response = await api.delete(`/api/favorites/${salonId}`)
    return response.data
  }
}
