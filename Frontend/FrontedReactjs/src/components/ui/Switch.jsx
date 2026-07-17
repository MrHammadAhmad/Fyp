import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/helpers'

export default function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  className
}) {
  const toggleChecked = () => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  return (
    <div
      onClick={toggleChecked}
      className={cn(
        'flex items-center gap-3 select-none cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div
        className={cn(
          'w-11 h-6 rounded-full p-0.5 transition-colors duration-205 flex items-center',
          checked ? 'bg-brand-600' : 'bg-surface-200 dark:bg-surface-800'
        )}
      >
        <motion.div
          layout
          className="w-5 h-5 bg-white rounded-full shadow-md"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          animate={{ x: checked ? 20 : 0 }}
        />
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-semibold text-surface-900 dark:text-white">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-surface-500 dark:text-surface-400">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
