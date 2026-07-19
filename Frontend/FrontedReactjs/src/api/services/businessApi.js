import api, { mockDelay } from '../axios'
import businessesData from '../../data/businesses.json'
import servicesData from '../../data/services.json'
import staffData from '../../data/staff.json'
import reviewsData from '../../data/reviews.json'
import { useCategoryStore } from '../../store/categoryStore'

export const businessApi = {
  getAll: async (params = {}) => {
    const res = await api.get('/api/salons/', {
      params: {
        location: params.loc || params.location,
        q: params.search || params.q,
        category: params.category
      }
    })
    return {
      data: res.data,
      total: res.data.length,
      page: 1,
      totalPages: 1
    }
  },

  getById: async (id) => {
    const res = await api.get(`/api/salons/${id}`)
    const salon = res.data
    
    let services = []
    try {
      const servicesRes = await api.get(`/api/services/${salon.id}`)
      services = servicesRes.data || []
    } catch (e) {
      services = []
    }

    // Inject mock services for categories that are missing to satisfy the prototype
    const globalCategories = useCategoryStore.getState().categories;
    const existingCategoryIds = new Set(services.map(s => s.category || s.categoryId));
    const existingServiceNames = new Set(services.map(s => s.name.toLowerCase()));
    
    const mockServices = globalCategories
      .filter(cat => !existingCategoryIds.has(cat.id) && !existingServiceNames.has(cat.name.toLowerCase()))
      .map((cat, idx) => ({
        id: `mock-s-${cat.id}`,
        businessId: salon.id,
        categoryId: cat.id,
        name: cat.name,
        description: `Professional ${cat.name} treatment`,
        price: 30 + (idx * 5),
        duration: 30
      }));
    services = [...services, ...mockServices];

    // Fetch live staff
    let staff = []
    try {
      const staffRes = await api.get(`/api/staff/?salon_id=${salon.id}`)
      staff = staffRes.data || []
    } catch (e) {
      staff = []
    }
    
    // Fetch live reviews
    let reviews = []
    try {
      const reviewsRes = await api.get(`/api/reviews/${salon.id}`)
      reviews = reviewsRes.data || []
    } catch (e) {
      reviews = []
    }
    
    return {
      ...salon,
      coverImage: salon.cover_image || salon.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
      rating: salon.average_rating || 0.0,
      reviewCount: reviews.length,
      services,
      staff,
      reviews
    }
  },

  getFeatured: async () => {
    const res = await api.get('/api/salons/')
    return res.data.slice(0, 4)
  },

  getServices: async (businessId) => {
    const res = await api.get(`/api/services/${businessId}`)
    return res.data
  },

  getStaff: async (businessId) => {
    const res = await api.get(`/api/staff/?salon_id=${businessId}`)
    return res.data
  },

  getReviews: async (businessId) => {
    try {
      const res = await api.get(`/api/reviews/${businessId}`)
      return res.data
    } catch (e) {
      return []
    }
  },

  // --- REAL ENDPOINTS ---
  getMySalon: async () => {
    const res = await api.get('/api/salons/owner/my')
    return res.data[0] || null
  },

  updateSalon: async (salonId, data) => {
    const res = await api.put(`/api/salons/${salonId}`, data)
    return res.data
  },

  getPerformanceReport: async () => {
    const res = await api.get('/api/owner/reports/performance')
    return res.data
  },

  createSalon: async (data) => {
    const res = await api.post('/api/salons/', data)
    return res.data
  },

  getRealServices: async (salonId) => {
    const res = await api.get(`/api/services/${salonId}`)
    return res.data
  },

  createService: async (salonId, data) => {
    const res = await api.post(`/api/services/${salonId}`, data)
    return res.data
  },

  updateService: async (serviceId, data) => {
    const res = await api.put(`/api/services/${serviceId}`, data)
    return res.data
  },

  deleteService: async (serviceId) => {
    const res = await api.delete(`/api/services/${serviceId}`)
    return res.data
  }
}
