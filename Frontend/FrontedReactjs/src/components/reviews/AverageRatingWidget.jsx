import React from 'react'
import { Star } from 'lucide-react'

export default function AverageRatingWidget({ rating = 4.8, totalReviews = 124, breakdown = { 5: 85, 4: 20, 3: 10, 2: 5, 1: 4 } }) {
  // Generate breakdown percentages
  const percentages = {}
  Object.keys(breakdown).forEach(key => {
    percentages[key] = totalReviews > 0 ? Math.round((breakdown[key] / totalReviews) * 100) : 0
  })

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800">
      <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Customer Reviews</h3>
      
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Average Score */}
        <div className="flex flex-col items-center justify-center text-center w-full md:w-1/3 space-y-2">
          <div className="text-5xl font-extrabold text-surface-900 dark:text-white">
            {rating.toFixed(1)}
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={20} 
                className={star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-surface-200 text-surface-200 dark:fill-surface-700 dark:text-surface-700"} 
              />
            ))}
          </div>
          <p className="text-sm text-surface-500 dark:text-surface-400">Based on {totalReviews} reviews</p>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 w-full space-y-3">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12 text-sm font-medium text-surface-700 dark:text-surface-300">
                {star} <Star size={14} className="fill-surface-400 text-surface-400" />
              </div>
              <div className="flex-1 h-2.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 rounded-full" 
                  style={{ width: `${percentages[star] || 0}%` }}
                ></div>
              </div>
              <div className="w-10 text-right text-xs text-surface-500 dark:text-surface-400">
                {percentages[star] || 0}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
