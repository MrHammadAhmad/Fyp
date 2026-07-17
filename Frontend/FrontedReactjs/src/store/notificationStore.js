import { create } from 'zustand'

export const useNotificationStore = create((set, get) => ({
  notifications: [
    {
      id: 1,
      type: 'booking',
      title: 'Booking Confirmed',
      message: 'Your appointment at Aura Hair & Styling is confirmed for tomorrow at 2:00 PM.',
      time: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      avatar: null,
    },
    {
      id: 2,
      type: 'promo',
      title: '20% Off This Weekend!',
      message: 'Glam Styling Studio is offering 20% off all haircut & styling services this weekend.',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      avatar: null,
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Appointment Reminder',
      message: 'Don\'t forget your facial appointment at Lumina Facial Studio in 1 hour.',
      time: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      avatar: null,
    },
  ],
  
  unreadCount: 2,
  
  addNotification: (notification) => set((state) => ({
    notifications: [{ id: Date.now(), ...notification, time: new Date(), read: false }, ...state.notifications],
    unreadCount: state.unreadCount + 1,
  })),
  
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  
  removeNotification: (id) => set((state) => {
    const notification = state.notifications.find(n => n.id === id)
    return {
      notifications: state.notifications.filter(n => n.id !== id),
      unreadCount: notification && !notification.read ? state.unreadCount - 1 : state.unreadCount,
    }
  }),
}))
