import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, MapPin, DollarSign, Star, Scissors, CheckCircle2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useRecommendationStore } from '../../store/recommendationStore'
import { aiApi } from '../../api/services/aiApi'
import toast from 'react-hot-toast'
import { Progress } from '../../components/ui/Progress'

export default function SalonRecommendationsPage() {
  const navigate = useNavigate()
  const { salonCriteria, setSalonCriteria } = useRecommendationStore()
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Mocking the payload
      const payload = { ...salonCriteria }
      const response = await aiApi.getSalonRecommendations(payload)
      
      setResults(response.recommendations || [])
    } catch (error) {
      toast.error('Failed to get recommendations. Please try again.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container-custom py-24 min-h-screen">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-sm font-semibold mb-4 border border-brand-200 dark:border-brand-800">
          <Sparkles size={16} /> AI Salon Matchmaker
        </div>
        <h1 className="text-4xl font-extrabold text-surface-900 dark:text-white mb-4">Find Your Perfect Salon</h1>
        <p className="text-surface-500 max-w-2xl mx-auto">Let our AI analyze your preferences, budget, and past bookings to recommend the best salons tailored specifically for you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-card">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Your Preferences</h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Area in Lahore</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                  <select 
                    className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-brand-500 appearance-none"
                    value={salonCriteria.location}
                    onChange={(e) => setSalonCriteria({ location: e.target.value })}
                  >
                    <option value="">Any Area in Lahore</option>
                    <option value="Gulberg">Gulberg</option>
                    <option value="DHA">DHA</option>
                    <option value="Johar Town">Johar Town</option>
                    <option value="Model Town">Model Town</option>
                    <option value="Bahria Town">Bahria Town</option>
                    <option value="Wapda Town">Wapda Town</option>
                    <option value="Cavalry Ground">Cavalry Ground</option>
                    <option value="Cantt">Cantt</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Budget Preference</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 font-bold text-sm">Rs</span>
                  <select 
                    className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-brand-500 appearance-none"
                    value={salonCriteria.budget}
                    onChange={(e) => setSalonCriteria({ budget: e.target.value })}
                  >
                    <option value="">Any Budget</option>
                    <option value="low">Budget Friendly (Rs)</option>
                    <option value="medium">Standard (Rs Rs)</option>
                    <option value="high">Premium (Rs Rs Rs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Minimum Rating</label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                  <select 
                    className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-brand-500 appearance-none"
                    value={salonCriteria.rating || ''}
                    onChange={(e) => setSalonCriteria({ rating: e.target.value })}
                  >
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5 & Above</option>
                    <option value="4.0">4.0 & Above</option>
                    <option value="3.5">3.5 & Above</option>
                  </select>
                </div>
              </div>

              <Button type="submit" fullWidth className="mt-6 h-12 text-base" loading={isLoading} variant="brand405">
                Generate Recommendations
              </Button>
            </form>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-8">
          {!results && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-surface-50 dark:bg-surface-900/50 rounded-3xl border border-dashed border-surface-300 dark:border-surface-700">
              <Sparkles className="text-surface-400 mb-4" size={48} />
              <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Ready to find your match?</h3>
              <p className="text-surface-500">Fill in your preferences and let our AI do the magic.</p>
            </div>
          )}

          {isLoading && (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-surface-200 dark:bg-surface-800 rounded-2xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-surface-200 dark:bg-surface-800 rounded w-1/2"></div>
                      <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded w-1/4"></div>
                      <div className="h-16 bg-surface-200 dark:bg-surface-800 rounded w-full mt-4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results && results.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-surface-50 dark:bg-surface-900/50 rounded-3xl border border-dashed border-surface-300 dark:border-surface-700">
              <Sparkles className="text-surface-400 mb-4" size={48} />
              <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">No salons found</h3>
              <p className="text-surface-500">We couldn't find any salons matching your criteria. Try adjusting your preferences.</p>
            </div>
          )}

          {results && results.length > 0 && !isLoading && (
            <div className="space-y-6">
              {results.map((salon, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={salon.id}
                  className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-brand-100 dark:border-brand-900/30 shadow-card hover:shadow-brand-lg transition-all relative overflow-hidden"
                >
                  {/* Match Badge */}
                  <div className="absolute top-0 right-0 bg-gradient-brand text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl">
                    {salon.matchPercentage}% Match
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-32 h-32 bg-brand-50 dark:bg-surface-800 rounded-2xl flex items-center justify-center shrink-0">
                      <Scissors size={40} className="text-brand-300 dark:text-brand-700" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {salon.tags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 rounded-md bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">{salon.name}</h2>
                      <div className="flex items-center gap-4 text-sm text-surface-500 mb-4">
                        <span className="flex items-center gap-1"><Star size={16} className="text-amber-400 fill-current" /> {salon.score}</span>
                        <span className="flex items-center gap-1"><MapPin size={16} /> {salon.location}</span>
                      </div>
                      
                      <div className="bg-surface-50 dark:bg-surface-800/50 p-4 rounded-2xl border border-surface-200 dark:border-surface-700">
                        <h4 className="text-xs font-bold text-surface-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-brand-500" /> Why we recommend this
                        </h4>
                        <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                          {salon.whyRecommended}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs font-medium mb-1.5">
                            <span className="text-surface-500">Recommendation Score</span>
                            <span className="text-brand-600 dark:text-brand-400">{salon.matchPercentage}/100</span>
                          </div>
                          <Progress value={salon.matchPercentage} className="h-1.5" />
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/business/${salon.slug || salon.id}`)}>View Profile</Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
