import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Star, DollarSign, Zap } from 'lucide-react'
import { cn } from '../../utils/helpers'
import { formatPrice, formatDuration } from '../../utils/helpers'

export default function ServiceCard({
  service,
  variant = 'default', // 'default' | 'compact' | 'selectable'
  selected = false,
  onSelect,
  businessSlug,
  showBookButton = true,
  className
}) {
  const {
    id, name, description, duration, price, image, popular, categoryId
  } = service

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => onSelect?.(service)}
        className={cn(
          'flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer',
          selected
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 shadow-md ring-1 ring-brand-500'
            : 'border-surface-200 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-surface-900',
          className
        )}
      >
        <img
          src={image}
          alt={name}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-surface-900 dark:text-white text-sm truncate">{name}</h4>
            {popular && (
              <span className="flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 font-bold flex-shrink-0">
                <Zap className="w-3 h-3" /> Popular
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-surface-500 dark:text-surface-400">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(duration)}</span>
            <span className="font-bold text-surface-900 dark:text-white">{formatPrice(price)}</span>
          </div>
        </div>
        {variant === 'selectable' || onSelect ? (
          <div className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
            selected
              ? 'border-brand-500 bg-brand-500'
              : 'border-surface-300 dark:border-surface-600'
          )}>
            {selected && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
        ) : null}
      </motion.div>
    )
  }

  // Default / full card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'group bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {popular && (
          <div className="absolute top-3 left-3 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500 text-white font-bold shadow-md">
            <Zap className="w-3 h-3" /> Popular
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md px-3 py-1 rounded-full">
          <span className="font-bold text-sm text-surface-900 dark:text-white">{formatPrice(price)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-surface-900 dark:text-white text-base mb-1.5">{name}</h3>
        <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-2 mb-3">{description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-surface-500 dark:text-surface-400">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDuration(duration)}</span>
          </div>
          
          {showBookButton && businessSlug && (
            <Link
              to={`/business/${businessSlug}/service/${id}`}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors"
            >
              Book Now →
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}
