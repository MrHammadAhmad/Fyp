import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, MapPin, Clock, Heart, CheckCircle, ChevronRight } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { favoritesApi } from '../../api/services/favoritesApi'
import showToast from '../ui/Toast'
import Badge from '../ui/Badge'
import { cn } from '../../utils/helpers'

export default function BusinessCard({ business, variant = 'grid' }) {
  const { toggleFavorite, isFavorite } = useCartStore()
  const { isAuthenticated, role } = useAuthStore()

  const safeBusiness = {
    ...business,
    id: business.id,
    slug: business.slug || business.id,
    thumbnail: business.cover_image || business.image_url || business.thumbnail || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    rating: business.average_rating !== undefined ? business.average_rating : (business.rating || 0.0),
    reviewCount: business.review_count !== undefined ? business.review_count : (business.reviewCount || 0),
    location: business.location || business.city || 'Pakistan',
    tags: business.tags || ['Salon']
  }

  const fav = isFavorite(safeBusiness.id)

  if (variant === 'list') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="card hover:shadow-card-hover transition-all duration-300 overflow-hidden p-4"
      >
        <Link to={`/business/${safeBusiness.slug}`} className="flex min-w-0 gap-3">
          <div className="flex flex-shrink-0 flex-col items-start gap-2">
            <img
              src={safeBusiness.thumbnail}
              alt={safeBusiness.name}
              className="h-24 w-24 rounded-2xl object-cover"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'
              }}
            />
            {safeBusiness.verified && (
              <div className="rounded-full bg-white p-0.5 shadow-sm dark:bg-surface-800">
                <CheckCircle size={14} className="text-brand-500" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="min-w-0 flex-1 truncate font-semibold text-surface-900 dark:text-surface-100">
                {safeBusiness.name}
              </h3>
              <div className="flex flex-shrink-0 items-center gap-1">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">
                  {safeBusiness.rating}
                </span>
                <span className="text-xs text-surface-400">({safeBusiness.reviewCount})</span>
              </div>
            </div>

            <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
              <MapPin size={12} className="flex-shrink-0 text-surface-400" />
              <span className="truncate text-xs text-surface-500 dark:text-surface-400">
                {safeBusiness.location}
              </span>
              <span className="flex-shrink-0 text-surface-300 dark:text-surface-600">•</span>
              <span className="flex-shrink-0 text-xs text-surface-400">{safeBusiness.distance}</span>
            </div>

            <div className="mt-1.5 flex min-w-0 items-start gap-1">
              <p className="line-clamp-2 min-w-0 flex-1 text-xs text-surface-400 dark:text-surface-500">
                {safeBusiness.description}
              </p>
              <ChevronRight size={16} className="mt-0.5 flex-shrink-0 text-surface-300" />
            </div>

            <div className="mt-2.5 flex min-w-0 items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-[#405742] dark:text-[#5a7a62]">
                <Clock size={12} className="flex-shrink-0" />
                <span className="truncate">{safeBusiness.nextAvailable}</span>
              </div>
              <Badge variant="default" className="flex-shrink-0 px-2 py-0.5 text-[11px]">
                {safeBusiness.priceRange}
              </Badge>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  // Grid variant (default)
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer"
    >
      {/* Image Container */}
      <Link to={`/business/${safeBusiness.slug}`} className="block relative overflow-hidden rounded-2xl">
        <img
          src={safeBusiness.thumbnail}
          alt={safeBusiness.name}
          className="w-full h-64 sm:h-72 object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'
          }}
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {safeBusiness.featured && (
            <span className="px-2.5 py-1 bg-white/95 text-surface-900 text-xs font-semibold rounded-full shadow-sm">
              Featured
            </span>
          )}
          {safeBusiness.verified && !safeBusiness.featured && (
            <span className="px-2.5 py-1 bg-white/95 text-surface-900 text-xs font-semibold rounded-full shadow-sm flex items-center gap-1">
              <CheckCircle size={12} className="text-brand-500" /> Verified
            </span>
          )}
          {safeBusiness.isNew && (
            <span className="px-2.5 py-1 bg-white/95 text-surface-900 text-xs font-semibold rounded-full shadow-sm">
              New
            </span>
          )}
        </div>
        
        <button
          onClick={async (e) => { 
            e.preventDefault(); 
            if (isAuthenticated && role === 'customer') {
              try {
                if (fav) {
                  await favoritesApi.removeFavorite(safeBusiness.id);
                  showToast.success('Removed from favorites');
                } else {
                  await favoritesApi.addFavorite(safeBusiness.id);
                  showToast.success('Added to favorites');
                }
              } catch (error) {
                console.error(error);
                showToast.error('Failed to update favorites');
                return; // don't toggle local state if api fails
              }
            } else if (!isAuthenticated) {
              showToast.success(fav ? 'Removed from local favorites' : 'Added to local favorites');
            }
            toggleFavorite(safeBusiness.id);
          }}
          className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full transition-colors"
        >
          <Heart
            size={16}
            className={fav ? 'fill-white text-white' : 'text-white stroke-[2.5]'}
          />
        </button>
      </Link>

      {/* Content */}
      <div className="pt-3 pb-1">
        <Link to={`/business/${safeBusiness.slug}`} className="block">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-surface-900 dark:text-surface-100 truncate text-[15px] leading-tight">
              {safeBusiness.name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span className="text-[13.5px] font-bold text-surface-900 dark:text-surface-100 leading-tight">
                {safeBusiness.rating}
              </span>
            </div>
          </div>

          <div className="text-[13.5px] text-surface-500 dark:text-surface-400 mt-1 truncate">
            {safeBusiness.location}
          </div>

          <div className="text-[13.5px] text-surface-500 dark:text-surface-400 mt-0.5 flex items-center gap-1.5">
            <span className="capitalize">{safeBusiness.tags?.[0] || 'Salon'}</span>
            <span className="text-[10px]">•</span>
            <span>{safeBusiness.reviewCount} reviews</span>
          </div>
        </Link>
      </div>
    </motion.div>
  )
}
