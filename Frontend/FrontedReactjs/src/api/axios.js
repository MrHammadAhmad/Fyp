import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.beautyai.com/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Token expired — auto logout
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      useAuthStore.getState().logout()
      window.location.href = '/auth/login'
    }

    // Network error
    if (!error.response) {
      console.error('Network error:', error.message)
    }

    return Promise.reject(error)
  }
)

// ==========================================
// Mock delay helper (simulates real API)
// ==========================================
export const mockDelay = (ms = 600) => new Promise(res => setTimeout(res, ms))

export default api
