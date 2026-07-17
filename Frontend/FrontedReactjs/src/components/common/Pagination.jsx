import React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '../../utils/helpers'

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className
}) {
  if (totalPages <= 1) return null

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const delta = 1 // Number of pages to show before and after current
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    range.forEach(i => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  return (
    <div className={cn('flex items-center justify-center gap-1 sm:gap-2', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <div key={`dot-${index}`} className="px-2 text-surface-400">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          )
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'w-9 h-9 rounded-lg font-medium text-sm transition-colors border',
              currentPage === page
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 hover:border-surface-300'
            )}
          >
            {page}
          </button>
        )
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
