import React, { useState, useEffect } from 'react'
import { Bell, Calendar, Tag, Star, Loader2 } from 'lucide-react'
import { formatDateRelative } from '../../utils/helpers'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/api/notifications/')
      // Map database notifications schema fields to frontend fields
      // Database: id, title, message, is_read, type, created_at
      // Frontend expects: id, type, title, message, read, time
      const mapped = response.data.map(n => ({
        id: n.id,
        type: n.type || 'general',
        title: n.title,
        message: n.message,
        read: n.is_read,
        time: n.created_at
      }))
      setNotifications(mapped)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load notifications.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (error) {
      console.error(error)
    }
  }

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read)
    if (unread.length === 0) return

    try {
      await Promise.all(unread.map(n => api.put(`/api/notifications/${n.id}/read`)))
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success("All marked as read!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to mark all as read.")
    }
  }

  const getIcon = (type) => {
    switch(type) {
      case 'booking': return <Calendar className="w-5 h-5 text-blue-500" />
      case 'promo': return <Tag className="w-5 h-5 text-emerald-500" />
      case 'review': return <Star className="w-5 h-5 text-amber-500" />
      default: return <Bell className="w-5 h-5 text-brand-500" />
    }
  }

  const getIconBg = (type) => {
    switch(type) {
      case 'booking': return 'bg-blue-50 dark:bg-blue-900/30'
      case 'promo': return 'bg-emerald-50 dark:bg-emerald-900/30'
      case 'review': return 'bg-amber-50 dark:bg-amber-900/30'
      default: return 'bg-brand-50 dark:bg-brand-900/30'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#405742] w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Notifications</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Stay updated on your appointments and offers.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-semibold text-[#405742] hover:text-[#334d3b] dark:text-brand-400"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                onClick={() => !notif.read && markAsRead(notif.id)}
                className={`p-4 sm:p-6 flex gap-4 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer ${!notif.read ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getIconBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`text-sm font-semibold text-surface-900 dark:text-white ${!notif.read ? 'font-bold' : ''}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-surface-400 whitespace-nowrap">
                      {formatDateRelative(notif.time)}
                    </span>
                  </div>
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    {notif.message}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-surface-400" />
            </div>
            <p className="text-surface-500 dark:text-surface-400">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  )
}
