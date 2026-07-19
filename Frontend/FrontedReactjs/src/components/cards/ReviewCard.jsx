import React from 'react'
import { motion } from 'framer-motion'
import { Star, ThumbsUp, MessageCircle } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { cn, formatDate, getStarArray } from '../../utils/helpers'

export default function ReviewCard({ review, className }) {
  const { userName, userAvatar, rating, title, comment, serviceName, date, helpful, ownerReply, ai_rating } = review

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-5 hover:shadow-md transition-all',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar src={userAvatar} alt={userName} size="md" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-surface-900 dark:text-white text-sm">{userName}</h4>
            <span className="text-xs text-surface-400 dark:text-surface-500">{formatDate(date)}</span>
          </div>
          <div className="flex items-center gap-0.5 mt-1">
            {getStarArray(rating).map((type, i) => (
              <Star
                key={i}
                className={cn(
                  'w-3.5 h-3.5',
                  type === 'full' ? 'text-amber-500 fill-current' :
                  type === 'half' ? 'text-amber-500 fill-current opacity-50' :
                  'text-surface-300 dark:text-surface-600'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Review Content */}
      {title && (
        <h5 className="font-semibold text-surface-900 dark:text-white text-sm mb-1">{title}</h5>
      )}
      <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed mb-2">{comment}</p>

      {/* AI Rating Badge */}
      {ai_rating !== undefined && ai_rating !== null && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium border border-purple-100 dark:border-purple-800">
            ✨ AI Sentiment: {Math.round(ai_rating * 10)}% - {ai_rating >= 9 ? 'Excellent' : ai_rating >= 7 ? 'Very Good' : ai_rating >= 5 ? 'Average' : ai_rating >= 3 ? 'Poor' : 'Very Poor'}
          </span>
        </div>
      )}

      {/* Service Tag */}
      {serviceName && (
        <span className="inline-block text-[11px] px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 font-medium mb-3">
          {serviceName}
        </span>
      )}

      {/* Helpful count */}
      {helpful > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-surface-400 dark:text-surface-500 mb-3">
          <ThumbsUp className="w-3 h-3" />
          {helpful} people found this helpful
        </div>
      )}

      {/* Owner Reply */}
      {ownerReply && (
        <div className="mt-3 pt-3 border-t border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400">Owner Reply</span>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">{ownerReply}</p>
        </div>
      )}
    </motion.div>
  )
}
