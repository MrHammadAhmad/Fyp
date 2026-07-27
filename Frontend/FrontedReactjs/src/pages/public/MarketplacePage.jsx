import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, MapPin, Search } from 'lucide-react'
import BusinessCard from '../../components/cards/BusinessCard'
import SearchBar from '../../components/common/SearchBar'
import { useCategoryStore } from '../../store/categoryStore'
import { businessApi } from '../../api/services/businessApi'
import showToast from '../../components/ui/Toast'

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categories = useCategoryStore((state) => state.categories)
  const queryParam = searchParams.get('q') || ''
  const categoryParam = searchParams.get('category') || ''
  const locationParam = searchParams.get('loc') || ''

  const [searchQuery, setSearchQuery] = useState(queryParam)
  const [locationQuery, setLocationQuery] = useState(locationParam)
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)

  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)

  // Update URL when filters change
  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  // Sync category param selected state
  useEffect(() => {
    setSelectedCategory(categoryParam)
  }, [categoryParam])

  // Fetch businesses from DB
  useEffect(() => {
    async function fetchSalons() {
      try {
        setLoading(true)
        const response = await businessApi.getAll({
          search: queryParam,
          loc: locationParam,
          category: categoryParam
        })
        setBusinesses(response.data || [])
      } catch (error) {
        console.error(error)
        showToast.error('Failed to load salons from database.')
      } finally {
        setLoading(false)
      }
    }
    fetchSalons()
  }, [queryParam, categoryParam, locationParam])


  const filteredBusinesses = businesses

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-20">
      {/* ===== SEARCH HEADER ===== */}
      <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 sticky top-16 z-20">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <SearchBar
              value={searchQuery}
              onChange={(v) => { setSearchQuery(v); updateFilters('q', v) }}
              placeholder="Search services or businesses..."
              className="flex-1"
            />
            
            <div className="flex w-full md:w-auto gap-4">
              <div className="relative flex-1 md:w-64">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => { setLocationQuery(e.target.value); updateFilters('loc', e.target.value) }}
                  placeholder="Location"
                  className="w-full h-11 pl-11 pr-4 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm"
                />
              </div>

            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => updateFilters('category', '')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                !selectedCategory ? 'bg-surface-900 dark:bg-white text-white dark:text-surface-900' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => updateFilters('category', cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id ? 'bg-surface-900 dark:bg-white text-white dark:text-surface-900' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== RESULTS ===== */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'result' : 'results'}
          </h1>
          {(queryParam || locationParam || categoryParam) && (
            <p className="text-surface-500 dark:text-surface-400">
              Showing results for {queryParam && `"${queryParam}"`} {categoryParam && `in ${categories.find(c => c.id === categoryParam)?.name}`} {locationParam && `near "${locationParam}"`}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#405742]" />
          </div>
        ) : filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBusinesses.map(business => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>


        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-surface-400" />
            </div>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">No results found</h3>
            <p className="text-surface-500 dark:text-surface-400 max-w-md mx-auto">
              We couldn't find any businesses matching your current filters. Try adjusting your search or removing some filters.
            </p>
            <button
              onClick={() => {
                setSearchParams(new URLSearchParams())
                setSearchQuery('')
                setLocationQuery('')
                setSelectedCategory('')
              }}
              className="mt-6 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
