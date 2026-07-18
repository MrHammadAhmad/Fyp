import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, DollarSign, Activity, ChevronRight } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useRecommendationStore } from '../../store/recommendationStore'
import { aiApi } from '../../api/services/aiApi'
import toast from 'react-hot-toast'

const CONCERN_OPTIONS = [
  "Dry Hair", "Frizz", "Split Ends", "Oily Scalp", "Hair Loss",
  "Acne", "Dry Skin", "Aging", "Dark Spots", "Redness"
]

export default function ServiceSuggestionsPage() {
  const navigate = useNavigate()
  const { serviceCriteria, setServiceCriteria } = useRecommendationStore()
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)
  
  const [selectedConcerns, setSelectedConcerns] = useState([])

  const renderFormattedText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return null;
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={i} className="mb-2">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-bold text-surface-900 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </div>
      );
    });
  }

  const toggleConcern = (concern) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter(c => c !== concern))
    } else {
      setSelectedConcerns([...selectedConcerns, concern])
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const payload = { ...serviceCriteria, concerns: selectedConcerns }
      const response = await aiApi.getServiceSuggestions(payload)
      
      setResults(response.suggestions || [
        {
          id: 'bundle_1',
          name: 'Ultimate Rejuvenation Bundle',
          type: 'bundle',
          estimatedCost: '$140 - $200',
          duration: '120 mins',
          explanation: 'Based on your concerns regarding dry skin and frizz, this combination hydrates both your scalp and face deeply.',
          treatments: ['Deep Conditioning Hair Spa', 'Hyaluronic Acid Facial']
        },
        {
          id: 'service_1',
          name: 'Keratin Smoothing Treatment',
          type: 'single',
          estimatedCost: '$150',
          duration: '90 mins',
          explanation: 'Directly addresses frizzy hair providing long-lasting smoothness and protection.',
          treatments: ['Keratin Treatment']
        }
      ])
    } catch (error) {
      toast.error('Failed to get service suggestions.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container-custom py-24 min-h-screen">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#405742]/10 dark:bg-[#405742]/15 text-[#405742] dark:text-[#5a7a62] text-sm font-semibold mb-4 border border-[#405742]/20 dark:border-[#405742]/30">
          <Activity size={16} /> Treatment Matcher
        </div>
        <h1 className="text-4xl font-extrabold text-surface-900 dark:text-white mb-4">AI Service Suggestions</h1>
        <p className="text-surface-500 max-w-2xl mx-auto">Tell us what bothers you, and we'll craft the perfect service bundles and treatments to help you achieve your beauty goals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-card">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Your Profile</h2>
            <form onSubmit={handleSearch} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">What are your main concerns?</label>
                <div className="flex flex-wrap gap-2">
                  {CONCERN_OPTIONS.map(concern => (
                    <button
                      type="button"
                      key={concern}
                      onClick={() => toggleConcern(concern)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selectedConcerns.includes(concern)
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-brand-300'
                      }`}
                    >
                      {concern}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Max Budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 font-bold text-sm">Rs</span>
                  <select 
                    className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-brand-500 appearance-none"
                    value={serviceCriteria.budget}
                    onChange={(e) => setServiceCriteria({ budget: e.target.value })}
                  >
                    <option value="">No limit</option>
                    <option value="5000">Under Rs 5,000</option>
                    <option value="10000">Under Rs 10,000</option>
                    <option value="20000">Under Rs 20,000</option>
                  </select>
                </div>
              </div>

              <Button type="submit" fullWidth className="mt-6 h-12 text-base" loading={isLoading} disabled={selectedConcerns.length === 0} variant="brand405">
                Analyze Concerns
              </Button>
            </form>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-8">
          {!results && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-surface-50 dark:bg-surface-900/50 rounded-3xl border border-dashed border-surface-300 dark:border-surface-700">
              <Activity className="text-surface-400 mb-4" size={48} />
              <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Select your concerns</h3>
              <p className="text-surface-500">Pick one or more concerns from the left to get personalized treatment bundles.</p>
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 animate-pulse h-64"></div>
              ))}
            </div>
          )}

          {results && !isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {results.map((suggestion, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  key={suggestion.id}
                  className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-brand-100 dark:border-brand-900/30 shadow-card hover:shadow-brand-lg transition-all flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      suggestion.type === 'bundle' 
                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                        : 'bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400'
                    }`}>
                      {suggestion.type}
                    </span>
                    <span className="font-bold text-surface-900 dark:text-white">{suggestion.estimatedCost}</span>
                  </div>

                  <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">{suggestion.name}</h3>
                  <p className="text-xs text-surface-500 mb-4 flex items-center gap-1.5"><Activity size={14} /> {suggestion.duration}</p>
                  
                  <div className="bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl mb-4 border border-surface-100 dark:border-surface-700/50 flex-1">
                    <div className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                      {renderFormattedText(suggestion.explanation)}
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Includes</p>
                    <ul className="space-y-1.5">
                      {suggestion.treatments.map((t, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300 font-medium">
                          <Sparkles size={14} className="text-brand-500 shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button fullWidth variant="outline" rightIcon={<ChevronRight size={16} />} onClick={() => navigate('/explore?q=' + encodeURIComponent(suggestion.treatments[0] || suggestion.name))}>
                    Find Salons Offering This
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
