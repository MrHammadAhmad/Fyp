import { mockDelay } from '../axios'
import reviewsData from '../../data/reviews.json'

export const reviewApi = {
  getAll: async (businessId) => {
    await mockDelay(400)
    return reviewsData.filter(r => r.businessId === businessId)
  },

  create: async (data) => {
    await mockDelay(800)
    return {
      id: `r_${Date.now()}`,
      ...data,
      date: new Date().toISOString(),
      helpful: 0,
    }
  },

  reply: async (reviewId, reply) => {
    await mockDelay(600)
    return { reviewId, ownerReply: reply }
  },

  markHelpful: async (reviewId) => {
    await mockDelay(300)
    return { reviewId, helpful: true }
  },

  getMyReviews: async () => {
    await mockDelay(500)
    return reviewsData.filter(r => r.userId === 'u1')
  },
}
