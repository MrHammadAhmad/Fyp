import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import categoriesData from '../data/categories.json'

export const useCategoryStore = create(
  persist(
    (set) => ({
      categories: categoriesData,
      
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, category]
      })),
      
      updateCategory: (id, updatedData) => set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, ...updatedData } : c)
      })),
      
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id)
      })),
      
      resetCategories: () => set({ categories: categoriesData })
    }),
    {
      name: 'beauty-categories-storage',
    }
  )
)
