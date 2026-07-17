import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn, formatNumber } from '../../utils/helpers'

export default function StatWidget({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = 'brand', // 'brand' | 'accent' | 'amber' | 'red' | 'blue'
  className
}) {
  const isPositive = change >= 0
  
  const colorMap = {
    brand: {
      bg: 'bg-brand-50 dark:bg-brand-950/30',
      icon: 'text-brand-600 dark:text-brand-400',
      ring: 'ring-brand-100 dark:ring-brand-900/30',
    },
    accent: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      icon: 'text-emerald-600 dark:text-emerald-400',
      ring: 'ring-emerald-100 dark:ring-emerald-900/30',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      icon: 'text-amber-600 dark:text-amber-400',
      ring: 'ring-amber-100 dark:ring-amber-900/30',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      icon: 'text-red-600 dark:text-red-400',
      ring: 'ring-red-100 dark:ring-red-900/30',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      icon: 'text-blue-600 dark:text-blue-400',
      ring: 'ring-blue-100 dark:ring-blue-900/30',
    },
  }

  const colors = colorMap[color] || colorMap.brand

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-5 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center ring-4', colors.bg, colors.ring)}>
          {Icon && <Icon className={cn('w-5 h-5', colors.icon)} />}
        </div>

        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full',
            isPositive
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
              : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <p className="text-xs text-surface-500 dark:text-surface-400 font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-extrabold text-surface-900 dark:text-white tracking-tight">
        {typeof value === 'number' ? formatNumber(value) : value}
      </h3>
      
      {changeLabel && (
        <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-1">{changeLabel}</p>
      )}
    </motion.div>
  )
}
