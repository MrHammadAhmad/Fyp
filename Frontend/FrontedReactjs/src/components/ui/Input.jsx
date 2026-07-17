import React from 'react'
import { cn } from '../../utils/helpers'

const Input = React.forwardRef(({
  className,
  type = 'text',
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  size = 'md',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'h-8 text-sm px-3 rounded-lg',
    md: 'h-10 text-sm px-4 rounded-xl',
    lg: 'h-12 text-base px-5 rounded-2xl',
  }

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full border bg-white dark:bg-surface-900',
            'text-surface-900 dark:text-surface-100',
            'placeholder-surface-400 dark:placeholder-surface-600',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2',
            error
              ? 'border-red-400 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20'
              : 'border-surface-200 dark:border-surface-700 focus:border-brand-500 focus:ring-brand-500/20',
            sizeClasses[size],
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">{error}</p>}
      {hint && !error && <p className="text-xs text-surface-400 dark:text-surface-500">{hint}</p>}
    </div>
  )
})

Input.displayName = 'Input'

export const Textarea = React.forwardRef(({ className, label, error, rows = 4, ...props }, ref) => (
  <div className="w-full space-y-1.5">
    {label && <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">{label}</label>}
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full rounded-xl border px-4 py-3 text-sm resize-none',
        'bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100',
        'placeholder-surface-400 dark:placeholder-surface-600',
        'transition-all duration-200 focus:outline-none focus:ring-2',
        error
          ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
          : 'border-surface-200 dark:border-surface-700 focus:border-brand-500 focus:ring-brand-500/20',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
))
Textarea.displayName = 'Textarea'

export default Input
