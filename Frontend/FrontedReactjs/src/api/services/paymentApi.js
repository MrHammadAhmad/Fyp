import api from '../axios'

export const paymentApi = {
  getTransactions: async () => {
    const response = await api.get('/api/payment/history')
    return response.data
  },

  processPayment: async (data) => {
    // Top-up wallet
    const response = await api.post('/api/payment/wallet/topup', { amount: parseFloat(data.amount) })
    return {
      success: true,
      transactionId: response.data.transaction.id,
      amount: response.data.transaction.amount,
      method: response.data.transaction.payment_method,
    }
  },

  refund: async (transactionId, amount) => {
    // Refund placeholder or call actual endpoint if backend supports it
    return { success: true, transactionId, refundAmount: amount }
  },

  getSavedPaymentMethods: async () => {
    // Keep cards mock for now as we don't store cards in DB (usually handled by Stripe on demand)
    return [
      { id: 'pm1', type: 'card', brand: 'visa', last4: '4242', expiry: '12/26', isDefault: true },
    ]
  },

  getWalletBalance: async () => {
    const response = await api.get('/api/payment/wallet/balance')
    return {
      balance: response.data.wallet_balance,
      transactions: response.data.transactions,
      loyaltyPoints: response.data.loyalty_points
    }
  },
}
