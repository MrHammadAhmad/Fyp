import React, { useState, useEffect } from 'react'
import BusinessCard from '../../components/cards/BusinessCard'
import { favoritesApi } from '../../api/services/favoritesApi'
import { useCartStore } from '../../store/cartStore'
import { Loader2 } from 'lucide-react'

export default function Favorites() {
  const [favoriteBusinesses, setFavoriteBusinesses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { addFavorite } = useCartStore()

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true)
        const data = await favoritesApi.getFavorites()
        setFavoriteBusinesses(data)
        data.forEach(b => addFavorite(b.id))
      } catch (error) {
        console.error("Failed to fetch favorites", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFavorites()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#405742] w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">My Favorites</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">Your saved businesses and quick access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {favoriteBusinesses.length > 0 ? (
          favoriteBusinesses.map(business => (
            <BusinessCard key={business.id} business={business} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-2xl">
            <p className="text-surface-500 dark:text-surface-400">You haven't saved any favorites yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
