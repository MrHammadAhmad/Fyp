import React from 'react'
import { cn } from '../../utils/helpers'
import { motion } from 'framer-motion'

const sizeClasses = {
  xs: 'h-6 text-xs px-2.5 rounded-lg',
  sm: 'h-8 text-sm px-4 rounded-xl',
  md: 'h-10 text-sm px-5 rounded-xl',
  lg: 'h-12 text-base px-7 rounded-2xl',
  xl: 'h-14 text-lg px-8 rounded-2xl',
}

const variantClasses = {
  primary: 'bg-[#405742] text-white shadow-lg shadow-[#405742]/25 hover:bg-[#334d3b]',
  secondary: 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 hover:bg-surface-200 dark:hover:bg-surface-700',
  outline: 'border-2 border-[#405742] text-[#405742] dark:text-[#5a7a62] hover:bg-[#405742]/10 dark:hover:bg-[#405742]/15',
  ghost: 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
  success: 'bg-accent-500 text-white hover:bg-accent-600 shadow-sm',
  green: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-lg shadow-green-600/30 hover:shadow-green-700/40 border-0',
  white: 'bg-white text-surface-900 hover:bg-surface-50 shadow-card',
  brand405: 'bg-[#405742] text-white hover:bg-[#334d3b] shadow-sm',
}

const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  animate = true,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const isDisabled = disabled || loading

  const baseClasses = cn(
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
    sizeClasses[size],
    variantClasses[variant],
    fullWidth && 'w-full',
    className
  )

  const content = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </>
  )

  if (animate && !isDisabled) {
    return (
      <motion.button
        ref={ref}
        type={type}
        className={baseClasses}
        disabled={isDisabled}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        {...props}
      >
        {content}
      </motion.button>
    )
  }

  return (
    <button
      ref={ref}
      type={type}
      className={baseClasses}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  )
})

Button.displayName = 'Button'
export default Button
