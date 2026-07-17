import React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/helpers'

const Select = React.forwardRef(({
  label,
  error,
  options = [],
  className,
  selectClassName,
  placeholder,
  leftIcon,
  helperText,
  disabled,
  ...props
}, ref) => {
  return (
    <div className={cn('flex flex-col gap-1.5 w-full select-none', className)}>
      {label && (
        <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">
          {label}
        </label>
      )}
      
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-4 text-surface-400 dark:text-surface-500 pointer-events-none">
            {leftIcon}
          </span>
        )}
        
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full h-11 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl px-4 text-sm outline-none transition-all duration-200 cursor-pointer appearance-none text-surface-900 dark:text-white',
            'focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon && 'pl-11',
            'pr-10', // Leave space for chevron
            error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
            selectClassName
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-surface-400">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom Chevron Indicator */}
        <span className="absolute right-4 text-surface-400 dark:text-surface-500 pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </span>
      </div>
      
      {error && (
        <span className="text-xs font-medium text-red-500">
          {error}
        </span>
      )}
      
      {!error && helperText && (
        <span className="text-xs text-surface-400 dark:text-surface-500">
          {helperText}
        </span>
      )}
    </div>
  )
})

Select.displayName = 'Select'
export default Select
