import React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../utils/helpers'

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className,
  size = 'md', // 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: 'h-9 text-sm pl-9 pr-8',
    md: 'h-11 text-sm pl-11 pr-10',
    lg: 'h-14 text-base pl-12 pr-12',
  }

  const iconSizes = {
    sm: 'w-4 h-4 left-3',
    md: 'w-5 h-5 left-4',
    lg: 'w-6 h-6 left-4',
  }

  return (
    <div className={cn('relative w-full group', className)}>
      <Search className={cn('absolute top-1/2 -translate-y-1/2 text-surface-400 transition-colors group-focus-within:text-brand-500', iconSizes[size])} />
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl outline-none transition-all duration-200 text-surface-900 dark:text-white placeholder:text-surface-400',
          'focus:bg-white dark:focus:bg-surface-950 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 shadow-sm',
          sizes[size]
        )}
      />
      
      {value && (
        <button
          onClick={() => {
            onChange?.('')
            onClear?.()
          }}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 right-3 p-1 rounded-full text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors',
            size === 'sm' ? 'right-2' : 'right-3'
          )}
        >
          <X className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        </button>
      )}
    </div>
  )
}
