import React, { useEffect, useRef, useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Sun, Moon, Menu, Plus, ChevronDown, LogOut, LayoutDashboard, Settings } from 'lucide-react'
import BusinessSidebar from './BusinessSidebar'
import { useThemeStore } from '../../store/themeStore'
import { useNotificationStore } from '../../store/notificationStore'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../utils/helpers'
import Button from '../ui/Button'
import NewBookingModal from '../business/NewBookingModal'
import { businessApi } from '../../api/services/businessApi'

export default function BusinessLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [allowWalkin, setAllowWalkin] = useState(true)
  const sidebarRef = useRef(null)

  useEffect(() => {
    // Fetch salon to get walk-in settings
    businessApi.getMySalon().then(salon => {
      if (salon && salon.allow_walkin_bookings !== undefined) {
        setAllowWalkin(salon.allow_walkin_bookings)
      }
    }).catch(console.error)

    // Add global event listener to open new booking modal from child pages
    const handleOpenBooking = () => {
      // Check current allowWalkin state (this closure might have stale state, 
      // but it's okay for now, ideally we should check latest state)
      setBookingModalOpen(true)
    }
    window.addEventListener('open-new-booking', handleOpenBooking)

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setMobileSidebarOpen(false)
      }
    }

    if (mobileSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      window.removeEventListener('open-new-booking', handleOpenBooking)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileSidebarOpen])

  return (
    <div className="flex min-h-[calc(100vh-64px)] mt-16 bg-surface-50 dark:bg-surface-950">
      <div className="hidden lg:block flex-shrink-0">
        <BusinessSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-45">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-16 h-[calc(100vh-64px)]" ref={sidebarRef}>
            <BusinessSidebar collapsed={false} setCollapsed={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <Menu size={20} />
            </button>

          </div>
          <div className="flex items-center gap-2">
            {allowWalkin && (
              <Button
                size="sm"
                variant="brand405"
                leftIcon={<Plus size={12} />}
                className="hidden sm:inline-flex py-1 text-xs"
                onClick={() => setBookingModalOpen(true)}
              >
                New Booking
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 bg-surface-50 dark:bg-surface-950">
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

      {/* New Booking Modal */}
      {allowWalkin && (
        <NewBookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
        />
      )}
    </div>
  )
}
