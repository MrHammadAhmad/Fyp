import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light' | 'dark' | 'system'
      
      setTheme: (theme) => {
        set({ theme })
        const root = document.documentElement
        if (theme === 'dark') {
          root.classList.add('dark')
        } else if (theme === 'light') {
          root.classList.remove('dark')
        } else {
          // system
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (prefersDark) root.classList.add('dark')
          else root.classList.remove('dark')
        }
      },
      
      toggleTheme: () => {
        const root = document.documentElement
        const isDark = root.classList.contains('dark')
        if (isDark) {
          root.classList.remove('dark')
          set({ theme: 'light' })
        } else {
          root.classList.add('dark')
          set({ theme: 'dark' })
        }
      },
      
      initTheme: () => {
        // Called on app init to apply persisted theme
      },
    }),
    {
      name: 'glambook-theme',
    }
  )
)
