import api from '../axios'

export const payoutApi = {
  // ── Payout Account ──────────────────────────────
  getAccount: async (salonId) => {
    const res = await api.get('/api/payout/account', { params: { salon_id: salonId } })
    return res.data // null if not set
  },

  saveAccount: async (data) => {
    // POST creates/replaces the account
    const res = await api.post('/api/payout/account', data)
    return res.data
  },

  updateAccount: async (accountId, data) => {
    const res = await api.put(`/api/payout/account/${accountId}`, data)
    return res.data
  },

  // ── Manual Charges ───────────────────────────────
  getCharges: async (salonId) => {
    const res = await api.get('/api/payout/charges', { params: { salon_id: salonId } })
    return res.data
  },

  createCharge: async (data) => {
    const res = await api.post('/api/payout/charges', data)
    return res.data
  },

  deleteCharge: async (chargeId) => {
    const res = await api.delete(`/api/payout/charges/${chargeId}`)
    return res.data
  },

  // ── Withdrawals ──────────────────────────────────
  getWithdrawals: async (salonId) => {
    const res = await api.get('/api/payout/withdrawals', { params: { salon_id: salonId } })
    return res.data
  },

  createWithdrawal: async (data) => {
    const res = await api.post('/api/payout/withdrawals', data)
    return res.data
  }
}
