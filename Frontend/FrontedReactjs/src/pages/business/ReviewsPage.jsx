import React, { useState, useEffect } from 'react'
import { Star, MessageCircle, Reply, CheckCircle2, Loader2, X } from 'lucide-react'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import { businessApi } from '../../api/services/businessApi'
import showToast from '../../components/ui/Toast'
import * as Dialog from '@radix-ui/react-dialog'
import api from '../../api/axios'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [salonId, setSalonId] = useState(null)
  const [aiAggregateRating, setAiAggregateRating] = useState(null)
  const [filter, setFilter] = useState('all')

  // Reply modal state
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch real reviews from the database
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        // First get the owner's salon
        const perfRes = await api.get('/api/owner/reports/performance')
        const salons = perfRes.data?.salons || []
        
        if (salons.length > 0) {
          const sId = salons[0].id
          setSalonId(sId)
          setAiAggregateRating(salons[0].ai_aggregate_rating)
          // Fetch reviews for this salon
          const revRes = await api.get(`/api/reviews/${sId}`)
          setReviews(revRes.data || [])
        } else {
          setReviews([])
        }
      } catch (err) {
        console.error(err)
        showToast.error('Failed to load reviews')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Computed stats
  const reviewCount = reviews.length
  const averageRating = reviewCount > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount).toFixed(1)
    : '0.0'

  // Filter logic
  const filteredReviews = reviews.filter(r => {
    if (filter === 'unreplied') return !r.owner_reply
    if (filter === 'positive') return r.rating >= 4
    if (filter === 'negative') return r.rating <= 2
    return true
  })

  // Open reply modal
  const openReplyModal = (review) => {
    setReplyingTo(review)
    setReplyText('')
    setIsReplyModalOpen(true)
  }

  // Submit reply — save via API
  const handleSubmitReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return showToast.error('Please enter your reply.')

    setSubmitting(true)
    try {
      await api.put(`/api/reviews/${replyingTo.id}/reply`, { reply: replyText.trim() })
      // Update the review in local state with the reply
      setReviews(prev => prev.map(r =>
        r.id === replyingTo.id ? { ...r, owner_reply: replyText.trim() } : r
      ))
      showToast.success('Reply posted successfully!')
      setIsReplyModalOpen(false)
      setReplyText('')
      setReplyingTo(null)
    } catch (err) {
      console.error(err)
      showToast.error('Failed to post reply')
    } finally {
      setSubmitting(false)
    }
  }

  // Star rating rendering helper
  const renderStars = (rating, size = 'w-4 h-4') => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`${size} ${i < rating ? 'fill-current text-amber-400' : 'text-surface-200 dark:text-surface-700'}`} />
    ))
  }

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length
    const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0
    return { star, count, pct }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Reviews</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Read and respond to client feedback.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl">
          {['all', 'positive', 'negative'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors capitalize ${
                filter === f
                  ? 'bg-white dark:bg-surface-900 shadow-sm text-surface-900 dark:text-white'
                  : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left sidebar — stats */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">Overall Rating</h3>
              <div className="text-5xl font-extrabold text-surface-900 dark:text-white mb-2">{averageRating}</div>
              <div className="flex justify-center text-amber-400 mb-2">
                {renderStars(Math.round(parseFloat(averageRating)), 'w-5 h-5')}
              </div>
              <p className="text-sm text-surface-500 dark:text-surface-400">Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>
            </div>

            {/* AI Text Sentiment Block */}
            {aiAggregateRating !== null && aiAggregateRating !== undefined && (
              <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-surface-900 border border-purple-100 dark:border-purple-800/50 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white flex items-center gap-1.5">
                    <span className="text-lg">✨</span> AI Text Rating
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-surface-800 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
                    {aiAggregateRating}/10
                  </span>
                </div>
                
                <div className="relative z-10 flex flex-col items-center justify-center text-center py-2">
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300 drop-shadow-sm mb-1">
                    {Math.round(aiAggregateRating * 10)}%
                  </div>
                  <div className="text-sm font-bold text-surface-700 dark:text-surface-200 tracking-wide uppercase mb-4">
                    {aiAggregateRating >= 9 ? 'Excellent' : aiAggregateRating >= 7 ? 'Very Good' : aiAggregateRating >= 5 ? 'Average' : aiAggregateRating >= 3 ? 'Poor' : 'Very Poor'}
                  </div>
                  
                  <div className="w-full bg-white dark:bg-surface-800 h-2.5 rounded-full overflow-hidden border border-purple-100/50 dark:border-purple-800/30">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
                      style={{ width: `${Math.round(aiAggregateRating * 10)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Rating Breakdown */}
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-surface-900 dark:text-white mb-4">Rating Breakdown</h4>
              <div className="space-y-2">
                {ratingDistribution.map(rd => (
                  <div key={rd.star} className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-surface-500 w-3">{rd.star}</span>
                    <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <div className="flex-1 h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${rd.pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-surface-500 w-6 text-right">{rd.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side — review list */}
          <div className="md:col-span-3 space-y-4">
            {filteredReviews.length > 0 ? (
              filteredReviews.map(review => (
                <div key={review.id} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar fallback={review.customer_name ? review.customer_name.charAt(0) : 'C'} size="md" />
                      <div>
                        <h4 className="font-bold text-surface-900 dark:text-white">{review.customer_name || 'Customer'}</h4>
                        <p className="text-xs text-surface-500">{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  <p className="text-surface-700 dark:text-surface-300 text-sm leading-relaxed mb-4">
                    {review.comment}
                  </p>

                  {review.ai_rating !== undefined && review.ai_rating !== null && (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium border border-purple-100 dark:border-purple-800">
                        ✨ AI Sentiment: {Math.round(review.ai_rating * 10)}% - {review.ai_rating >= 9 ? 'Excellent' : review.ai_rating >= 7 ? 'Very Good' : review.ai_rating >= 5 ? 'Average' : review.ai_rating >= 3 ? 'Poor' : 'Very Poor'}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-12 text-center">
                <MessageCircle className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">
                  {filter === 'all' ? 'No Reviews Yet' : `No ${filter} Reviews`}
                </h3>
                <p className="text-sm text-surface-500 max-w-sm mx-auto">
                  {filter === 'all'
                    ? 'When customers leave reviews for your salon, they will appear here.'
                    : 'Try changing the filter to see other reviews.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reply to Review Dialog */}
      <Dialog.Root open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-surface-900 rounded-3xl p-6 w-[90vw] max-w-lg shadow-xl z-50 focus:outline-none border border-surface-100 dark:border-surface-800">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-bold text-surface-900 dark:text-white">Reply to Review</Dialog.Title>
              <Dialog.Close className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"><X size={20} /></Dialog.Close>
            </div>

            {replyingTo && (
              <div className="p-4 bg-surface-50 dark:bg-surface-950 rounded-xl mb-6 border border-surface-200 dark:border-surface-800">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar fallback={replyingTo.userName} size="sm" />
                  <span className="font-semibold text-sm text-surface-900 dark:text-white">{replyingTo.userName}</span>
                  <div className="flex ml-auto">{renderStars(replyingTo.rating, 'w-3 h-3')}</div>
                </div>
                <p className="text-sm text-surface-600 dark:text-surface-400 line-clamp-3">{replyingTo.comment}</p>
              </div>
            )}

            <form onSubmit={handleSubmitReply} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Your Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white h-32 resize-none"
                  placeholder="Thank you for your feedback! We appreciate..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-800">
                <Dialog.Close asChild><Button variant="outline" type="button">Cancel</Button></Dialog.Close>
                <Button variant="brand" type="submit" disabled={submitting}>
                  {submitting ? <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Posting...</span> : 'Post Reply'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
