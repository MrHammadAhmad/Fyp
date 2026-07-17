import { create } from 'zustand'

export const useSkinAnalysisStore = create((set) => ({
  imagePreview: null,
  analysisResult: null,
  setImagePreview: (url) => set({ imagePreview: url }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  clear: () => set({ imagePreview: null, analysisResult: null }),
}))
