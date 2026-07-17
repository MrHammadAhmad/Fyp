import React, { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Calendar, Clock, Users, UserCheck, Scissors,
  Package, Gift, CreditCard, BarChart2, Megaphone, Star, Settings,
  ChevronLeft, ChevronRight, Sparkles, ShoppingBag, Database
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../utils/helpers'
import { businessApi } from '../../api/services/businessApi'

const businessNav = [
  { label: 'Dashboard', to: '/business', icon: LayoutDashboard, exact: true },
  { label: 'Data Dashboard', to: '/business/manage-salon', icon: Database },
  { label: 'Calendar', to: '/business/calendar', icon: Calendar },
  { label: 'Appointments', to: '/business/appointments', icon: Clock },
  { label: 'Customers', to: '/business/customers', icon: Users },
  { label: 'Staff', to: '/business/staff', icon: UserCheck },
  { label: 'Services', to: '/business/services', icon: Scissors },
  { label: 'Memberships', to: '/business/memberships', icon: ShoppingBag },
  { label: 'Payments', to: '/business/payments', icon: CreditCard },
  { label: 'Subscriptions', to: '/business/subscriptions', icon: ShoppingBag },
  { label: 'Reports', to: '/business/reports', icon: BarChart2 },
  { label: 'Reviews', to: '/business/reviews', icon: Star },
  { label: 'Support', to: '/business/support', icon: Megaphone },
  { label: 'Settings', to: '/business/settings', icon: Settings },
]

export default function BusinessSidebar({ collapsed, setCollapsed }) {
  const { user } = useAuthStore()
  const [salonName, setSalonName] = useState('My Salon')

  useEffect(() => {
    async function loadSalon() {
      try {
        const response = await businessApi.getMySalon()
        if (response && response.name) {
          setSalonName(response.name)
        } else if (user?.businessName) {
          setSalonName(user.businessName)
        }
      } catch (err) {
        if (user?.businessName) {
          setSalonName(user.businessName)
        }
      }
    }
    if (user) {
      loadSalon()
    }
  }, [user])

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex-shrink-0 h-[calc(100vh-64px)] sticky top-16 bg-surface-950 border-r border-surface-800 flex flex-col overflow-hidden z-30"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-800">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-[#405742] flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="font-bold text-white text-sm">Business Hub</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1.5 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors',
            collapsed && 'mx-auto'
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Business info */}
      {!collapsed && (
        <div className="p-4 border-b border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#405742] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#405742]/25">
              <Scissors size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{salonName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5a7a62]" />
                <span className="text-xs text-surface-400">Active Plan</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-hide">
        {businessNav.map(({ label, to, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-[#405742]/20 text-[#5a7a62] border border-[#405742]/30'
                : 'text-surface-400 hover:bg-surface-800 hover:text-surface-100',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon size={17} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      {!collapsed && (
        <div className="p-3 border-t border-surface-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-8 h-8 rounded-xl flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-surface-200 truncate">{user?.name}</p>
              <p className="text-[11px] text-surface-500 truncate">Owner</p>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  )
}
