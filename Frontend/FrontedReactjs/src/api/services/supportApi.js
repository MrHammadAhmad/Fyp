import api from '../axios'

export const supportApi = {
  getMyTickets: async (status = null) => {
    const params = {}
    if (status && status !== 'all') params.status = status
    const response = await api.get('/api/support/tickets/my', { params })
    return response.data
  },

  createTicket: async (ticketData) => {
    const response = await api.post('/api/support/tickets', ticketData)
    return response.data
  }
}
