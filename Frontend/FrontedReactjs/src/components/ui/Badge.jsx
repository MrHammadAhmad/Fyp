import React from 'react'
import { cn } from '../../utils/helpers'

const variants = {
  default: 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400',
  brand: 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300',
  green: 'bg-accent-100 dark:bg-accent-950 text-accent-700 dark:text-accent-300',
  orange: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300',
  red: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
  blue: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
  yellow: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300',
  pink: 'bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300',
}

export default function Badge({ children, variant = 'default', className, dot = false, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', {
          'bg-surface-500': variant === 'default',
          'bg-brand-500': variant === 'brand',
          'bg-accent-500': variant === 'green',
          'bg-orange-500': variant === 'orange',
          'bg-red-500': variant === 'red',
        })} />
      )}
      {children}
    </span>
  )
}
