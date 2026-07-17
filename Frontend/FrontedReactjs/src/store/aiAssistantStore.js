import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAIAssistantStore = create(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'ai-assistant-storage',
    }
  )
)
