import React from 'react'
import { cn } from '../../utils/helpers'

export default function Skeleton({ className, width, height, rounded = 'rounded-lg' }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-surface-200 dark:bg-surface-700',
        rounded,
        className
      )}
      style={{ width, height }}
    />
  )
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn('card p-5 space-y-4', className)}>
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  )
}

export function SkeletonAvatar({ size = 'md' }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14', xl: 'w-20 h-20' }
  return <Skeleton className={cn('rounded-full', sizes[size])} />
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}><Skeleton className="h-4 w-24" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j}><Skeleton className="h-4" style={{ width: `${60 + Math.random() * 40}%` }} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
