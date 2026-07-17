import React from 'react'
import { motion } from 'framer-motion'
import { Star, Calendar, Award } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import { cn } from '../../utils/helpers'

export default function StaffCard({
  staff,
  variant = 'default', // 'default' | 'selectable'
  selected = false,
  onSelect,
  className
}) {
  const { id, name, role, avatar, rating, reviewCount, experience, specialties, nextAvailable } = staff

  if (variant === 'selectable') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => onSelect?.(staff)}
        className={cn(
          'flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer',
          selected
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 shadow-md ring-1 ring-brand-500'
            : 'border-surface-200 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-surface-900',
          className
        )}
      >
        <Avatar src={avatar} alt={name} size="lg" />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-surface-900 dark:text-white text-sm truncate">{name}</h4>
          <p className="text-xs text-surface-500 dark:text-surface-400">{role}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-current" /> {rating}
            </span>
            <span className="text-xs text-surface-400">({reviewCount})</span>
          </div>
        </div>
        <div className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
          selected ? 'border-brand-500 bg-brand-500' : 'border-surface-300 dark:border-surface-600'
        )}>
          {selected && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-5 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 text-center',
        className
      )}
    >
      <Avatar src={avatar} alt={name} size="2xl" className="mx-auto mb-4 ring-4 ring-brand-100 dark:ring-brand-900/30" />
      
      <h3 className="font-bold text-surface-900 dark:text-white text-base">{name}</h3>
      <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-2">{role}</p>
      
      <div className="flex items-center justify-center gap-1 mb-3">
        <Star className="w-4 h-4 text-amber-500 fill-current" />
        <span className="font-bold text-surface-900 dark:text-white text-sm">{rating}</span>
        <span className="text-xs text-surface-500 dark:text-surface-400">({reviewCount} reviews)</span>
      </div>

      <div className="flex items-center justify-center gap-2 mb-3 text-xs text-surface-500 dark:text-surface-400">
        <Award className="w-3.5 h-3.5" />
        <span>{experience} experience</span>
      </div>

      {specialties && specialties.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
          {specialties.map((s) => (
            <Badge key={s} variant="secondary" size="sm">{s}</Badge>
          ))}
        </div>
      )}

      {nextAvailable && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-accent-600 dark:text-accent-400 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          Next: {nextAvailable}
        </div>
      )}
    </motion.div>
  )
}
