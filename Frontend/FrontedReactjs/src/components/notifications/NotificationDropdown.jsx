import React from 'react'
import { Link } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Bell, CalendarCheck, CreditCard, Clock } from 'lucide-react'

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Booking Confirmed', message: 'Your appointment is confirmed for Oct 15.', type: 'booking', isRead: false },
  { id: 2, title: 'Payment Successful', message: 'Payment of $85.00 was successful.', type: 'payment', isRead: false },
]

export default function NotificationDropdown() {
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length

  const getIcon = (type) => {
    switch(type) {
      case 'booking': return <CalendarCheck className="text-blue-500" size={16} />
      case 'payment': return <CreditCard className="text-green-500" size={16} />
      default: return <Clock className="text-amber-500" size={16} />
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="relative p-2 text-surface-600 hover:bg-surface-100 rounded-full dark:text-surface-300 dark:hover:bg-surface-800 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-surface-900"></span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="w-80 bg-white dark:bg-surface-900 rounded-2xl shadow-xl border border-surface-200 dark:border-surface-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-5"
          align="end"
          sideOffset={8}
        >
          <div className="p-4 border-b border-surface-100 dark:border-surface-800 flex justify-between items-center bg-surface-50 dark:bg-surface-800/50">
            <h3 className="font-semibold text-surface-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {MOCK_NOTIFICATIONS.length === 0 ? (
              <div className="p-6 text-center text-surface-500 text-sm">
                No new notifications
              </div>
            ) : (
              MOCK_NOTIFICATIONS.map(notification => (
                <DropdownMenu.Item key={notification.id} className="p-3 border-b border-surface-50 dark:border-surface-800/50 hover:bg-surface-50 dark:hover:bg-surface-800 outline-none cursor-pointer flex gap-3 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-surface-900 dark:text-white truncate">{notification.title}</h4>
                    <p className="text-xs text-surface-500 line-clamp-2 mt-0.5">{notification.message}</p>
                  </div>
                </DropdownMenu.Item>
              ))
            )}
          </div>

          <div className="p-2 border-t border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
            <Link 
              to="/notification-center" 
              className="block w-full text-center py-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
            >
              View All Notifications
            </Link>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
