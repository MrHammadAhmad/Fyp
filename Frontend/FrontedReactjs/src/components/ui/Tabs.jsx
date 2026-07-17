import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/helpers'

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills', // 'pills' | 'underline' | 'buttons'
  className,
  tabClassName
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1 select-none',
        variant === 'pills' && 'p-1 bg-surface-100 dark:bg-surface-800 rounded-xl',
        variant === 'underline' && 'border-b border-surface-200 dark:border-surface-800 w-full gap-6',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange?.(tab.id)}
            className={cn(
              'relative px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer focus-visible:outline-none',
              // Underline variant
              variant === 'underline' && [
                'rounded-none px-1 pb-3 pt-2 text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white',
                isActive && 'text-brand-600 dark:text-brand-400'
              ],
              // Pills variant
              variant === 'pills' && [
                'text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white',
                isActive && 'text-white'
              ],
              // Buttons variant
              variant === 'buttons' && [
                'border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-750 text-surface-700 dark:text-surface-200',
                isActive && 'bg-brand-600 border-brand-600 text-white dark:bg-brand-600 dark:border-brand-600 hover:bg-brand-700 dark:hover:bg-brand-700'
              ],
              tabClassName
            )}
          >
            {/* Sliding background for Pills */}
            {variant === 'pills' && isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-brand-600 dark:bg-brand-600 rounded-lg -z-0"
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              />
            )}

            {/* Sliding underline */}
            {variant === 'underline' && isActive && (
              <motion.div
                layoutId="activeUnderlineIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400"
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              />
            )}

            {/* Content label with icon if present */}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
