import React from 'react'

export default function AiTextRatingWidget({ aiRating }) {
  if (aiRating === null || aiRating === undefined) return null

  const getAiText = (rating) => {
    if (rating >= 9) return 'Excellent'
    if (rating >= 7) return 'Very Good'
    if (rating >= 5) return 'Average'
    if (rating >= 3) return 'Poor'
    return 'Very Poor'
  }

  const percentage = Math.round(aiRating * 10)

  return (
    <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-surface-900 border border-purple-100 dark:border-purple-800/50 rounded-2xl p-6 relative overflow-hidden shadow-sm mt-6">
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center justify-center md:justify-start gap-1.5 mb-2">
            <span className="text-xl">✨</span> AI Text Rating
          </h3>
          <p className="text-sm text-surface-600 dark:text-surface-400 max-w-sm mx-auto md:mx-0">
            Based on the sentiment analysis of all written customer reviews, our AI has assigned the following rating.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col items-center md:items-end justify-center">
          <div className="flex items-center gap-4 mb-2">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300 drop-shadow-sm">
              {percentage}%
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold text-surface-700 dark:text-surface-200 tracking-wide uppercase">
                {getAiText(aiRating)}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-surface-800 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800 mt-1">
                Score: {aiRating}/10
              </span>
            </div>
          </div>

          <div className="w-full md:w-64 bg-white dark:bg-surface-800 h-2.5 rounded-full overflow-hidden border border-purple-100/50 dark:border-purple-800/30">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
