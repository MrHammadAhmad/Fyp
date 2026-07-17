import api from '../axios'

// Mock Data for Subscriptions
let mockSubscriptions = [
  { id: '1', name: 'Starter', price: 29.99, interval: 'month', businesses: 142, features: ['Basic Booking', 'Up to 2 Staff Members', 'Standard Support'] },
  { id: '2', name: 'Professional', price: 79.99, interval: 'month', businesses: 856, features: ['Advanced Booking', 'Unlimited Staff', 'Priority Support', 'Analytics Dashboard'] },
  { id: '3', name: 'Enterprise', price: 199.99, interval: 'month', businesses: 34, features: ['Custom Integrations', 'Dedicated Account Manager', 'White Labeling', 'API Access'] }
];

export const adminApi = {
  getSystemReport: async () => {
    const response = await api.get('/api/admin/reports/system')
    return response.data
  },

  getSalons: async (isApproved = null) => {
    const params = {}
    if (isApproved !== null) params.is_approved = isApproved
    const response = await api.get('/api/admin/salons', { params })
    return response.data
  },

  approveSalon: async (salonId, isApproved) => {
    const response = await api.put(`/api/admin/salons/${salonId}/approve`, { is_approved: isApproved })
    return response.data
  },

  getUsers: async () => {
    const response = await api.get('/api/admin/users')
    return response.data
  },

  blockUser: async (userId, isBlocked) => {
    const response = await api.put(`/api/admin/users/${userId}/block`, { is_blocked: isBlocked })
    return response.data
  },

  getSupportTickets: async (status = null) => {
    const params = {}
    if (status && status !== 'all') params.status = status
    const response = await api.get('/api/support/tickets', { params })
    return response.data
  },

  updateSupportTicket: async (ticketId, status, reply = null) => {
    const payload = { status }
    if (reply !== null) payload.admin_reply = reply
    const response = await api.put(`/api/support/tickets/${ticketId}`, payload)
    return response.data
  },

  // Mock Subscription API
  getSubscriptions: async () => {
    return new Promise(resolve => setTimeout(() => resolve([...mockSubscriptions]), 300));
  },

  createSubscription: async (planData) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newPlan = { ...planData, id: Math.random().toString(36).substr(2, 9), businesses: 0 };
        mockSubscriptions.push(newPlan);
        resolve(newPlan);
      }, 500);
    });
  },

  updateSubscription: async (planId, planData) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = mockSubscriptions.findIndex(p => p.id === planId);
        if (index !== -1) {
          mockSubscriptions[index] = { ...mockSubscriptions[index], ...planData };
          resolve(mockSubscriptions[index]);
        }
      }, 500);
    });
  },

  deleteSubscription: async (planId) => {
    return new Promise(resolve => {
      setTimeout(() => {
        mockSubscriptions = mockSubscriptions.filter(p => p.id !== planId);
        resolve({ success: true });
      }, 500);
    });
  }
}
