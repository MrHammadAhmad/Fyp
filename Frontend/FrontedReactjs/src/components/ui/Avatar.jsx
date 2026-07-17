import React from 'react'
import { cn } from '../../utils/helpers'

export default function Avatar({
  src,
  alt,
  fallback,
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status, // 'online' | 'offline' | 'busy' | 'away'
  className,
  statusClassName,
}) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl',
  }

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-red-500',
    away: 'bg-amber-500',
  }

  // Generate fallback background from avatar text to make them colorful
  const getFallbackColor = (text = '') => {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colors = [
      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
      'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    ]
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center flex-shrink-0 rounded-full font-bold select-none', sizes[size], className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
      ) : null}
      
      {/* Fallback text if no src or image loading fails */}
      {!src && (
        <div className={cn('w-full h-full flex items-center justify-center rounded-full uppercase', getFallbackColor(fallback || alt))}>
          {fallback || (alt ? alt.split(' ').map(n => n[0]).join('').slice(0, 2) : '?')}
        </div>
      )}

      {/* Status dot */}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-surface-950',
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3',
            statusColors[status],
            statusClassName
          )}
        />
      )}
    </div>
  )
}
