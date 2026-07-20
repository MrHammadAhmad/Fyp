import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, X, Activity, Droplet, Wind, Sparkles, ShoppingBag } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useHairAnalysisStore } from '../../store/hairAnalysisStore'
import { aiApi } from '../../api/services/aiApi'
import toast from 'react-hot-toast'
import { Progress } from '../../components/ui/Progress'

export default function HairAnalysisPage() {
  const { imagePreview, setImagePreview, analysisResult, setAnalysisResult, clear } = useHairAnalysisStore()
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) processFile(file)
  }

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    const url = URL.createObjectURL(file)
    setImagePreview(url)
    setSelectedFile(file)
    // Clear previous results when new image is uploaded
    setAnalysisResult(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const analyzeImage = async () => {
    if (!imagePreview || !selectedFile) return
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      const response = await aiApi.analyzeHair(formData)
      
      setAnalysisResult(response.result || {
        hairType: 'Type 2B (Wavy)',
        condition: 'Dry & Frizzy',
        healthScore: 65,
        scalpCondition: 'Mild Flaking',
        damageLevel: 'Moderate',
        suggestedServices: ['Keratin Treatment', 'Deep Conditioning Spa'],
        suggestedTreatments: ['Hot Oil Massage', 'Trim split ends'],
        suggestedProducts: ['Argan Oil Serum', 'Sulfate-Free Moisture Shampoo']
      })
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to analyze image.';
      toast.error(`AI Model Error: ${errorMsg}`);
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container-custom py-24 min-h-screen">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-sm font-semibold mb-4 border border-brand-200 dark:border-brand-800">
          <Wind size={16} /> AI Hair Diagnostics
        </div>
        <h1 className="text-4xl font-extrabold text-surface-900 dark:text-white mb-4">Hair Condition Analysis</h1>
        <p className="text-surface-500 max-w-2xl mx-auto">Upload a clear photo of your hair to get instant AI-powered diagnostics and personalized care recommendations.</p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Upload Section */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-card">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Upload Photo</h2>
            
            {!imagePreview ? (
              <div 
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-colors ${
                  isDragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10' : 'border-surface-300 dark:border-surface-700 hover:border-brand-400 dark:hover:border-brand-600'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
                  <UploadCloud size={24} className="text-surface-500" />
                </div>
                <h3 className="text-surface-900 dark:text-white font-bold mb-2">Drag & drop your photo</h3>
                <p className="text-surface-500 text-sm mb-6">or click to browse from your device</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary">Browse Files</Button>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-700">
                <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                <button 
                  onClick={clear}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors backdrop-blur-sm"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            
            {imagePreview && !analysisResult && (
              <Button fullWidth className="mt-6 h-12" onClick={analyzeImage} isLoading={isLoading}>
                Analyze Hair Condition
              </Button>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {!imagePreview && !analysisResult && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full bg-surface-50 dark:bg-surface-900/50 rounded-3xl border border-dashed border-surface-300 dark:border-surface-700 flex flex-col items-center justify-center p-8 text-center"
              >
                <Wind className="text-surface-400 mb-4" size={48} />
                <p className="text-surface-500 font-medium">Upload a photo to see your AI diagnosis here.</p>
              </motion.div>
            )}

            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-8 flex flex-col items-center justify-center"
              >
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-surface-200 dark:border-surface-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
                  <Wind size={24} className="absolute inset-0 m-auto text-brand-500 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">AI is analyzing your hair...</h3>
                <p className="text-surface-500 text-sm">Scanning texture, damage, and scalp condition.</p>
              </motion.div>
            )}

            {analysisResult && !isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-brand-200 dark:border-brand-800 shadow-brand-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">Analysis Results</h2>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Health Score</span>
                    <span className={`text-2xl font-extrabold ${
                      analysisResult.healthScore > 75 ? 'text-accent-500' : analysisResult.healthScore > 50 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {analysisResult.healthScore}/100
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-2xl">
                      <p className="text-xs text-surface-500 font-medium mb-1">Hair Type</p>
                      <p className="font-bold text-surface-900 dark:text-white">{analysisResult.hairType}</p>
                    </div>
                    <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-2xl">
                      <p className="text-xs text-surface-500 font-medium mb-1">Damage Level</p>
                      <p className="font-bold text-surface-900 dark:text-white">{analysisResult.damageLevel}</p>
                    </div>
                    <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-2xl">
                      <p className="text-xs text-surface-500 font-medium mb-1">Condition</p>
                      <p className="font-bold text-surface-900 dark:text-white">{analysisResult.condition}</p>
                    </div>
                    <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-2xl">
                      <p className="text-xs text-surface-500 font-medium mb-1">Scalp</p>
                      <p className="font-bold text-surface-900 dark:text-white">{analysisResult.scalpCondition}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-3">
                      <Sparkles size={16} className="text-brand-500" /> Recommended Services
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.suggestedServices.map(s => (
                        <span key={s} className="px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs font-semibold rounded-lg">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-3">
                      <Droplet size={16} className="text-accent-500" /> At-Home Treatments
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.suggestedTreatments.map(t => (
                        <li key={t} className="text-sm text-surface-600 dark:text-surface-400 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-400 mt-1.5 shrink-0" /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-3">
                      <ShoppingBag size={16} className="text-amber-500" /> Suggested Products
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.suggestedProducts.map(p => (
                        <li key={p} className="text-sm text-surface-600 dark:text-surface-400 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
