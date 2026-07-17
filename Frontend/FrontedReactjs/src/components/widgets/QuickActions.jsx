import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/helpers'

export default function QuickActions({ actions = [], className }) {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-3', className)}>
      {actions.map((action, i) => {
        const Icon = action.icon
        return (
          <motion.button
            key={i}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={action.onClick}
            className={cn(
              'flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 hover:shadow-lg hover:shadow-brand-500/10 transition-all cursor-pointer group',
              action.className
            )}
          >
            <div className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center transition-colors',
              action.bgColor || 'bg-brand-50 dark:bg-brand-950/30',
            )}>
              {Icon && <Icon className={cn('w-5 h-5', action.iconColor || 'text-brand-600 dark:text-brand-400')} />}
            </div>
            <span className="text-xs font-semibold text-surface-700 dark:text-surface-300 text-center group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {action.label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
