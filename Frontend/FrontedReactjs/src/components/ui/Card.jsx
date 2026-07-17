import React from 'react'
import { cn } from '../../utils/helpers'
import { motion } from 'framer-motion'

export function Card({ children, className, hover = false, glass = false, onClick, ...props }) {
  const classes = cn(
    'bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800',
    hover && 'shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-brand-200 dark:hover:border-brand-800 hover:-translate-y-1 cursor-pointer',
    !hover && 'shadow-card',
    glass && 'backdrop-blur-xl bg-white/90 dark:bg-surface-900/80',
    className
  )

  if (hover) {
    return (
      <motion.div
        className={classes}
        onClick={onClick}
        whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('px-6 py-5 border-b border-surface-100 dark:border-surface-800', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-lg font-semibold text-surface-900 dark:text-surface-100', className)}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className }) {
  return (
    <div className={cn('px-6 py-5', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('px-6 py-4 border-t border-surface-100 dark:border-surface-800', className)}>
      {children}
    </div>
  )
}

export default Card
