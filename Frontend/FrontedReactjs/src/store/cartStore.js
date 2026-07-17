import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      favorites: [], // Array of business IDs
      recentlyViewed: [], // Array of business objects (last 10)
      
      addFavorite: (businessId) => set((state) => ({
        favorites: state.favorites.includes(businessId)
          ? state.favorites
          : [...state.favorites, businessId],
      })),
      
      removeFavorite: (businessId) => set((state) => ({
        favorites: state.favorites.filter(id => id !== businessId),
      })),
      
      toggleFavorite: (businessId) => {
        const { favorites } = get()
        if (favorites.includes(businessId)) {
          set((state) => ({ favorites: state.favorites.filter(id => id !== businessId) }))
        } else {
          set((state) => ({ favorites: [...state.favorites, businessId] }))
        }
      },
      
      isFavorite: (businessId) => get().favorites.includes(businessId),
      
      addRecentlyViewed: (business) => set((state) => {
        const filtered = state.recentlyViewed.filter(b => b.id !== business.id)
        return { recentlyViewed: [business, ...filtered].slice(0, 10) }
      }),
    }),
    {
      name: 'glambook-favorites',
      partialize: (state) => ({
        favorites: state.favorites,
        recentlyViewed: state.recentlyViewed,
      }),
    }
  )
)
