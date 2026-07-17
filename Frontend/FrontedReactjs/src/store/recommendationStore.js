import { create } from 'zustand'

export const useRecommendationStore = create((set) => ({
  salonCriteria: { location: '', budget: '', preferredServices: [] },
  serviceCriteria: { hairConcerns: [], skinConcerns: [], budget: '' },
  setSalonCriteria: (criteria) => set((state) => ({ salonCriteria: { ...state.salonCriteria, ...criteria } })),
  setServiceCriteria: (criteria) => set((state) => ({ serviceCriteria: { ...state.serviceCriteria, ...criteria } })),
}))
