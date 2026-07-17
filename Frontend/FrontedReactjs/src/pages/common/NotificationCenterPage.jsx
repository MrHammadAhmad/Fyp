import React, { useState } from 'react'
import { Bell, Check, Trash2, CalendarCheck, CreditCard, Clock, MessageSquare } from 'lucide-react'
import Button from '../../components/ui/Button'

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Booking Confirmed', message: 'Your appointment at Elegant Style Salon is confirmed for Oct 15, 10:00 AM.', type: 'booking', isRead: false, time: '10 mins ago' },
  { id: 2, title: 'Payment Successful', message: 'Payment of $85.00 for Hair Coloring was successful.', type: 'payment', isRead: false, time: '2 hours ago' },
  { id: 3, title: 'Appointment Reminder', message: 'Reminder: You have an upcoming appointment in 24 hours.', type: 'reminder', isRead: true, time: '1 day ago' },
  { id: 4, title: 'New Message', message: 'Salon Owner replied to your review.', type: 'message', isRead: true, time: '2 days ago' },
]

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const toggleReadStatus = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n))
  }

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const getIcon = (type) => {
    switch(type) {
      case 'booking': return <CalendarCheck className="text-blue-500" size={20} />
      case 'payment': return <CreditCard className="text-green-500" size={20} />
      case 'reminder': return <Clock className="text-amber-500" size={20} />
      case 'message': return <MessageSquare className="text-purple-500" size={20} />
      default: return <Bell className="text-brand-500" size={20} />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <Bell className="text-brand-500" />
            Notification Center
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Stay updated with your bookings, payments, and messages.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead} leftIcon={<Check size={18} />}>
            Mark All Read
          </Button>
          <Button variant="outline" onClick={clearAll} leftIcon={<Trash2 size={18} />} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            Clear All
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-surface-500">
            <Bell size={48} className="mx-auto mb-4 text-surface-300 dark:text-surface-600" />
            <p className="text-lg font-medium text-surface-900 dark:text-white mb-1">No notifications</p>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <ul className="divide-y divide-surface-100 dark:divide-surface-800">
            {notifications.map(notification => (
              <li 
                key={notification.id} 
                className={`p-4 sm:p-6 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50 flex gap-4 ${!notification.isRead ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${!notification.isRead ? 'bg-white dark:bg-surface-800 shadow-sm' : 'bg-surface-100 dark:bg-surface-800'}`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`text-base font-semibold truncate ${!notification.isRead ? 'text-surface-900 dark:text-white' : 'text-surface-700 dark:text-surface-300'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-surface-500 shrink-0 mt-1">{notification.time}</span>
                  </div>
                  <p className={`text-sm mb-3 ${!notification.isRead ? 'text-surface-700 dark:text-surface-300' : 'text-surface-500'}`}>
                    {notification.message}
                  </p>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => toggleReadStatus(notification.id)}
                      className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      {notification.isRead ? 'Mark as unread' : 'Mark as read'}
                    </button>
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="text-xs font-medium text-surface-500 hover:text-red-600 dark:hover:text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-brand-500 rounded-full shrink-0 mt-2"></div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
