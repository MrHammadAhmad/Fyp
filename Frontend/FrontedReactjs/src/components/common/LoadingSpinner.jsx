import React from 'react'
import { cn } from '../../utils/helpers'
import { motion } from 'framer-motion'

export default function LoadingSpinner({ size = 'md', className, label }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  }
  
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn(
        'rounded-full border-surface-200 dark:border-surface-700 border-t-brand-500 animate-spin',
        sizes[size]
      )} />
      {label && <p className="text-sm text-surface-500 dark:text-surface-400 animate-pulse">{label}</p>}
    </div>
  )
}

export function PageLoader({ label = 'Loading...' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-white dark:bg-surface-950"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-brand flex items-center justify-center shadow-brand-lg">
          <span className="text-2xl">✨</span>
        </div>
        <LoadingSpinner size="md" />
        <p className="text-surface-500 dark:text-surface-400 text-sm">{label}</p>
      </div>
    </motion.div>
  )
}
