import { mockDelay } from '../axios'
import businessesData from '../../data/businesses.json'
import servicesData from '../../data/services.json'

// ================================================
// Auth API Service (mock implementation)
// ================================================

import api from '../axios'

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials)
    const token = response.data.access_token
    
    // Temporarily set token in headers so we can fetch the profile immediately
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    
    const profileResponse = await api.get('/api/auth/profile')
    const userProfile = profileResponse.data
    
    // Map backend 'owner' role to frontend 'business_owner'
    if (userProfile && userProfile.role === 'owner') {
      userProfile.role = 'business_owner'
    }
    
    return {
      user: userProfile,
      token,
    }
  },
  
  register: async (data) => {
    const response = await api.post('/api/auth/signup', data)
    return response.data
  },
  
  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email })
    return response.data
  },
  
  resetPassword: async (data) => {
    const response = await api.post('/api/auth/reset-password', { new_password: data.password })
    return response.data
  },
  
  getProfile: async () => {
    const response = await api.get('/api/auth/profile')
    const userProfile = response.data
    
    // Map backend 'owner' role to frontend 'business_owner'
    if (userProfile && userProfile.role === 'owner') {
      userProfile.role = 'business_owner'
    }
    
    return userProfile
  },
  
  updateProfile: async (data) => {
    const response = await api.put('/api/auth/profile', data)
    return response.data.profile
  },
}
