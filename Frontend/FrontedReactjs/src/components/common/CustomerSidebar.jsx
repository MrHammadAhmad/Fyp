import React, { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Calendar, Clock, Heart, Wallet, Bell,
  Settings, ChevronLeft, ChevronRight, Sparkles, User, Star, Gift,
  Bot, Scissors, Microscope, FlaskConical, Building2, Crown, Headphones
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../utils/helpers'

const customerNav = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'My Bookings', to: '/dashboard/bookings', icon: Clock },
  { label: 'Favorites', to: '/dashboard/favorites', icon: Heart },
  { label: 'Wallet', to: '/dashboard/wallet', icon: Wallet },
  { label: 'Memberships', to: '/dashboard/memberships', icon: Crown },
  { label: 'Notifications', to: '/dashboard/notifications', icon: Bell },
  { label: 'Support', to: '/dashboard/support', icon: Headphones },
  { label: 'Settings', to: '/dashboard/settings', icon: Settings },
]

const aiNav = [
  { label: 'AI Assistant', to: '/ai-assistant', icon: Bot },
  { label: 'Salon Recs', to: '/recommendations/salons', icon: Building2 },
  { label: 'Service Recs', to: '/recommendations/services', icon: Scissors },
  { label: 'Hair Analysis', to: '/analysis/hair', icon: Microscope },
  { label: 'Skin Analysis', to: '/analysis/skin', icon: FlaskConical },
]

export default function CustomerSidebar({ collapsed, setCollapsed }) {
  const { user } = useAuthStore()

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex-shrink-0 h-[calc(100vh-64px)] sticky top-16 bg-white dark:bg-surface-950 border-r border-surface-200 dark:border-surface-800 flex flex-col overflow-hidden z-30"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-800">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="font-bold text-surface-900 dark:text-white">Beauty Personalized AI</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors',
            collapsed && 'mx-auto'
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="p-4 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-10 h-10 rounded-xl flex-shrink-0 ring-2 ring-brand-200 dark:ring-brand-800"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">{user?.name}</p>
              <p className="text-xs text-surface-400 dark:text-surface-500 truncate">{user?.email}</p>
            </div>
          </div>
          {/* Loyalty Points */}
          <div className="mt-3 p-2.5 bg-brand-50 dark:bg-brand-950 rounded-xl flex items-center gap-2">
            <Star size={14} className="text-brand-500 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-brand-700 dark:text-brand-300">1,250 pts</span>
              <span className="text-xs text-brand-500 dark:text-brand-400 ml-1">Loyalty</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {customerNav.map(({ label, to, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}

        {/* AI Tools Divider */}
        {!collapsed && (
          <div className="pt-3 pb-1">
            <p className="text-xs font-bold text-surface-400 dark:text-surface-600 uppercase tracking-widest px-3 flex items-center gap-1.5">
              <Sparkles size={10} /> AI Tools
            </p>
          </div>
        )}
        {collapsed && <div className="my-2 border-t border-surface-200 dark:border-surface-800" />}

        {aiNav.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom CTA */}
      {!collapsed && (
        <div className="p-3 border-t border-surface-200 dark:border-surface-800">
          <Link
            to="/customer/book-appointment"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#405742] text-white text-sm font-semibold hover:bg-[#334d3b] transition-all"
          >
            <Calendar size={16} />
            Book an Appointment
          </Link>
        </div>
      )}
    </motion.aside>
  )
}
