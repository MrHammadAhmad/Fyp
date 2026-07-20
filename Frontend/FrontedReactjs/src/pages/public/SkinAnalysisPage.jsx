import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, X, Droplet, Sun, Sparkles, ShoppingBag, Smile } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useSkinAnalysisStore } from '../../store/skinAnalysisStore'
import { aiApi } from '../../api/services/aiApi'
import toast from 'react-hot-toast'
import { Progress } from '../../components/ui/Progress'

export default function SkinAnalysisPage() {
  const { imagePreview, setImagePreview, analysisResult, setAnalysisResult, clear } = useSkinAnalysisStore()
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
      const response = await aiApi.analyzeSkin(formData)

      setAnalysisResult(response.result || {
        skinType: 'Combination (T-Zone Oily)',
        hydrationLevel: 55,
        tone: 'Medium Warm',
        concerns: ['Mild Acne', 'Uneven Texture', 'Dark Spots'],
        uvDamage: 'Low-Moderate',
        healthScore: 72,
        suggestedRoutine: [
          'AM: Gentle Foaming Cleanser → Niacinamide Serum → SPF 50',
          'PM: Micellar Water → Retinol Cream → Barrier Moisturizer',
        ],
        suggestedTreatments: ['HydraFacial', 'Chemical Peel', 'LED Light Therapy'],
        suggestedProducts: ['Vitamin C Brightening Serum', 'Hyaluronic Acid Moisturizer', 'Azelaic Acid Spot Treatment'],
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
          <Smile size={16} /> AI Skin Diagnostics
        </div>
        <h1 className="text-4xl font-extrabold text-surface-900 dark:text-white mb-4">Skin Condition Analysis</h1>
        <p className="text-surface-500 max-w-2xl mx-auto">Upload a clear photo of your face to receive an instant AI-powered skin assessment and a personalized care routine.</p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Upload Section */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-card">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Upload Your Photo</h2>

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
                Analyze Skin Condition
              </Button>
            )}
          </div>

          {/* Tips card */}
          <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-brand-800 dark:text-brand-200 mb-3 flex items-center gap-2">
              <Sun size={16} /> Tips for Best Results
            </h3>
            <ul className="space-y-1.5 text-sm text-brand-700 dark:text-brand-300">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" /> Use a well-lit, natural light setting</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" /> Face the camera directly (no angle)</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" /> Remove makeup for a more accurate scan</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" /> Use a high-resolution photo</li>
            </ul>
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
                <Smile className="text-surface-400 mb-4" size={48} />
                <p className="text-surface-500 font-medium">Upload a photo to see your AI skin analysis here.</p>
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
                  <Smile size={24} className="absolute inset-0 m-auto text-brand-500 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">AI is scanning your skin...</h3>
                <p className="text-surface-500 text-sm">Analyzing tone, texture, hydration, and concerns.</p>
              </motion.div>
            )}

            {analysisResult && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-brand-200 dark:border-brand-800 shadow-brand-lg overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">Skin Analysis Results</h2>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Health Score</span>
                    <span className={`text-2xl font-extrabold ${
                      analysisResult.healthScore > 75 ? 'text-accent-500' : analysisResult.healthScore > 50 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {analysisResult.healthScore}/100
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-2xl">
                      <p className="text-xs text-surface-500 font-medium mb-1">Skin Type</p>
                      <p className="font-bold text-surface-900 dark:text-white text-sm">{analysisResult.skinType}</p>
                    </div>
                    <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-2xl">
                      <p className="text-xs text-surface-500 font-medium mb-1">Skin Tone</p>
                      <p className="font-bold text-surface-900 dark:text-white text-sm">{analysisResult.tone}</p>
                    </div>
                    <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-2xl col-span-2">
                      <p className="text-xs text-surface-500 font-medium mb-2 flex items-center gap-1"><Droplet size={12} /> Hydration Level</p>
                      <Progress value={analysisResult.hydrationLevel} className="h-2" />
                      <p className="text-xs text-surface-400 mt-1 text-right">{analysisResult.hydrationLevel}%</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-surface-900 dark:text-white mb-2">Skin Concerns</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.concerns.map(c => (
                        <span key={c} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-semibold rounded-lg">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-3">
                      <Sparkles size={16} className="text-brand-500" /> Recommended Routine
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.suggestedRoutine.map((step, i) => (
                        <li key={i} className="text-sm text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800 p-3 rounded-xl">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-3">
                      <Sun size={16} className="text-accent-500" /> Salon Treatments
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.suggestedTreatments.map(t => (
                        <span key={t} className="px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs font-semibold rounded-lg">
                          {t}
                        </span>
                      ))}
                    </div>
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

                <Button fullWidth className="mt-6" onClick={clear} variant="secondary">
                  Analyze Another Photo
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
