import React, { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard, Users, Building2, BarChart2, CreditCard,
  TicketCheck, Tag, Shield, Sun, Moon, Bell, Menu, X,
  ChevronDown, LogOut,
} from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../utils/helpers'

const adminNav = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Businesses', to: '/admin/businesses', icon: Building2 },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart2 },
  { label: 'Subscriptions', to: '/admin/subscriptions', icon: CreditCard },
  { label: 'Support', to: '/admin/support', icon: TicketCheck },
  { label: 'Categories', to: '/admin/categories', icon: Tag },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuthStore()

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-surface-950 to-surface-900 border-r border-surface-800">
      <div className="p-5 border-b border-surface-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#405742] flex items-center justify-center shadow-lg shadow-[#405742]/25">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Admin</p>
            <p className="text-xs text-surface-400">Beauty AI Platform</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
        {adminNav.map(({ label, to, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-[#405742]/20 text-[#5a7a62] border border-[#405742]/30'
                : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
            )}
          >
            <Icon size={17} className="flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-surface-800 p-4">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'}
            alt={user?.name || 'Admin'}
            className="h-8 w-8 flex-shrink-0 rounded-xl"
          />
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-xs font-semibold text-surface-200">
              {user?.name || 'Admin User'}
            </p>
            <p className="truncate text-[11px] text-surface-500">
              {user?.email || 'admin@beautyai.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-[calc(100vh-64px)] mt-16 bg-surface-100 dark:bg-surface-950">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 flex-shrink-0">
        <div className="w-full h-[calc(100vh-64px)] sticky top-16">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-16 h-[calc(100vh-64px)] w-64">
            <SidebarContent />
          </div>
          <button onClick={() => setSidebarOpen(false)} className="absolute top-20 right-4 p-2 bg-white/10 rounded-xl text-white">
            <X size={20} />
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
              <Menu size={20} />
            </button>
            <div>
              <p className="font-semibold text-surface-900 dark:text-white text-xs hidden sm:block">Platform Administration</p>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 lg:p-6 max-w-[1600px] mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
