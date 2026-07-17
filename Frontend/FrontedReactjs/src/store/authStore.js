import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null, // 'customer' | 'business_owner' | 'admin'

      login: (userData, token) => set({
        user: userData,
        token,
        isAuthenticated: true,
        role: userData.role,
      }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        role: null,
      }),

      updateUser: (updates) => set((state) => ({
        user: { ...state.user, ...updates },
      })),

      hasRole: (requiredRole) => {
        const { role } = get()
        if (Array.isArray(requiredRole)) return requiredRole.includes(role)
        return role === requiredRole
      },
    }),
    {
      name: 'glambook-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    }
  )
)
