import React, { useEffect, useRef, useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  Wallet,
} from 'lucide-react'
import CustomerSidebar from './CustomerSidebar'
import { useThemeStore } from '../../store/themeStore'
import { useNotificationStore } from '../../store/notificationStore'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../utils/helpers'

const profileMenuItems = [
  { label: 'Dashboard', to: '/dashboard', icon: BookOpen },
  { label: 'My Bookings', to: '/dashboard/bookings', icon: Calendar },
  { label: 'Favorites', to: '/dashboard/favorites', icon: Heart },
  { label: 'Wallet', to: '/dashboard/wallet', icon: Wallet },
  { label: 'Settings', to: '/dashboard/settings', icon: Settings },
]

export default function CustomerLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { user } = useAuthStore()

  return (
    <div className="flex min-h-[calc(100vh-64px)] mt-16 bg-surface-50 dark:bg-surface-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <CustomerSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-16 h-[calc(100vh-64px)]">
            <CustomerSidebar collapsed={false} setCollapsed={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar for sub-actions / mobile toggle */}
        <header className="h-14 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 py-6 w-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
