import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Menu, X, Bell, Heart, Calendar, User, LogOut,
  Sun, Moon, ChevronDown, Sparkles, Settings, BookOpen
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useNotificationStore } from '../../store/notificationStore'
import Button from '../ui/Button'
import { cn } from '../../utils/helpers'

const navLinks = [
  { label: 'Explore', to: '/explore' },
  { label: 'Homepage', to: '/' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { isAuthenticated, user, logout, role } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()
  const profileRef = useRef()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/')
  }

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin'
    if (role === 'business_owner') return '/business'
    return '/dashboard'
  }

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 border-b border-surface-200 transition-all duration-300 dark:border-surface-800',
      scrolled
        ? 'bg-white/95 shadow-sm backdrop-blur-xl dark:bg-surface-950/95'
        : 'bg-transparent'
    )}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-brand">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl text-surface-900 dark:text-white tracking-tight">
              Beauty Personalized <span className="gradient-text">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800'
                )}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Sun size={18} />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon size={18} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {isAuthenticated ? (
              <>
                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2 rounded-2xl border border-surface-200 dark:border-surface-700 hover:border-brand-300 dark:hover:border-brand-700 transition-all bg-white dark:bg-surface-900"
                  >
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                      alt={user?.name}
                      className="w-7 h-7 rounded-full"
                    />
                    <span className="hidden sm:block text-sm font-medium text-surface-800 dark:text-surface-200 max-w-[120px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className={cn('text-surface-400 transition-transform', profileOpen && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-elevated overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-surface-100 dark:border-surface-800">
                          <p className="font-semibold text-sm text-surface-900 dark:text-surface-100">{user?.name}</p>
                          <p className="text-xs text-surface-400 dark:text-surface-500 truncate">{user?.email}</p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          <Link
                            to={getDashboardLink()}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
                          >
                            <BookOpen size={16} />
                            Dashboard
                          </Link>
                          {role !== 'admin' && (
                            <>
                              <Link
                                to={role === 'customer' ? '/dashboard/bookings' : '/business/appointments'}
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
                              >
                                <Calendar size={16} />
                                {role === 'customer' ? 'My Bookings' : 'Appointments'}
                              </Link>
                              <Link
                                to={role === 'customer' ? '/dashboard/settings' : '/business/settings'}
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
                              >
                                <Settings size={16} />
                                Settings
                              </Link>
                            </>
                          )}
                        </div>
                        <div className="p-1.5 border-t border-surface-100 dark:border-surface-800">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')}>
                  Sign In
                </Button>
                <Button size="sm" variant="primary" onClick={() => navigate('/auth/register')} className="rounded-xl px-5 font-bold">
                    Get Started
                  </Button>
              </div>
              )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white dark:bg-surface-950 border-t border-surface-200 dark:border-surface-800 overflow-hidden"
          >
            <div className="container-custom py-4 space-y-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors font-medium"
                >
                  {link.label}
                </NavLink>
              ))}
              {!isAuthenticated && (
                <div className="pt-3 flex flex-col gap-2">
                  <Button fullWidth variant="secondary" onClick={() => { navigate('/auth/login'); setMobileOpen(false) }}>
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => { navigate('/auth/register'); setMobileOpen(false) }}
                    className="rounded-xl px-5 font-extrabold"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
