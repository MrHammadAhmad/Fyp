import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, DollarSign, Calendar as CalendarIcon, TrendingUp, Plus, 
  Scissors, CreditCard, PieChart, Sparkles, Bot, ArrowRight, TrendingDown, Star, Clock 
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import StatWidget from '../../components/widgets/StatWidget'
import QuickActions from '../../components/widgets/QuickActions'
import RevenueChart from '../../components/charts/RevenueChart'
import BookingChart from '../../components/charts/BookingChart'
import AppointmentCard from '../../components/cards/AppointmentCard'
import { businessApi } from '../../api/services/businessApi'
import { bookingApi } from '../../api/services/bookingApi'
import showToast from '../../components/ui/Toast'
import { formatPrice } from '../../utils/helpers'
import Button from '../../components/ui/Button'
import { useBusinessRefreshStore } from '../../store/businessRefreshStore'

const aiInsights = [
  {
    icon: TrendingUp,
    iconColor: 'text-brand-500',
    bgColor: 'bg-brand-50 dark:bg-brand-900/20',
    title: 'Peak Booking Hours',
    value: '11am – 2pm',
    desc: 'Add more slots to maximize revenue.',
  },
]

export default function BusinessDashboard() {
  const { user } = useAuth()
  const [report, setReport] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // Subscribe to global refresh signal — re-fetches whenever a new booking is created
  const refreshKey = useBusinessRefreshStore((s) => s.refreshKey)

  async function loadDashboardData() {
    try {
      setLoading(true)
      const reportData = await businessApi.getPerformanceReport()
      setReport(reportData)

      const salonBookings = await bookingApi.getMyBookings()
      setBookings(salonBookings || [])
    } catch (error) {
      console.error(error)
      showToast.error('Failed to load business dashboard stats.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [refreshKey]) // Re-fetches whenever a new booking is confirmed

  const upcomingBookings = useMemo(() => 
    bookings
      .filter(b => b.status === 'upcoming' || b.status === 'confirmed' || b.status === 'pending')
      .slice(0, 3)
  , [bookings])

  const topServices = useMemo(() => {
    if (!report?.popular_services) return []
    return Object.entries(report.popular_services).map(([name, count]) => ({
      name,
      sales: count,
      revenue: formatPrice(count * 45) // Assume an average price of $45 per booking for display
    }))
  }, [report])

  const { last7DaysRevenue, last7DaysBookings } = useMemo(() => {
    const revenueMap = {}
    const bookingsMap = {}
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const name = d.toLocaleDateString('en-US', { weekday: 'short' })
      revenueMap[dateStr] = { name, dateStr, revenue: 0 }
      bookingsMap[dateStr] = { name, dateStr, bookings: 0 }
    }

    bookings.forEach(b => {
      if (b.status === 'cancelled') return
      
      let dateStr = ''
      if (b.date) {
        dateStr = b.date.split('T')[0]
      } else if (b.created_at) {
        dateStr = b.created_at.split('T')[0]
      }
      
      if (revenueMap[dateStr]) {
        revenueMap[dateStr].revenue += (b.price || 0)
        bookingsMap[dateStr].bookings += 1
      }
    })

    return {
      last7DaysRevenue: Object.values(revenueMap),
      last7DaysBookings: Object.values(bookingsMap)
    }
  }, [bookings])

  const quickActions = [
    { label: 'Manage Salon Details', icon: Scissors, to: '/business/manage-salon', bgColor: 'bg-brand-50 dark:bg-brand-900/30', iconColor: 'text-brand-600 dark:text-brand-400' },
    { label: 'View Calendar', icon: CalendarIcon, to: '/business/calendar', bgColor: 'bg-emerald-50 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'View Bookings', icon: Clock, to: '/business/appointments', bgColor: 'bg-amber-50 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    )
  }

  const totalEarnings = report?.total_earnings || 0.0
  const appointmentsCount = report?.appointments_count || 0
  const customerCount = report?.customer_count || 0
  const profileViews = customerCount * 4 + 18

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">
            Dashboard Overview
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Welcome back, {user?.name || 'Partner'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            Refresh Dashboard
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions.map(act => (
          <Link 
            key={act.label} 
            to={act.to}
            className={`${act.bgColor} p-4 rounded-2xl border border-surface-200/50 dark:border-surface-800/50 flex items-center gap-4 hover:shadow-md transition-all`}
          >
            <div className={`w-10 h-10 rounded-xl bg-white dark:bg-surface-800 flex items-center justify-center shrink-0 shadow-sm ${act.iconColor}`}>
              <act.icon className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-surface-900 dark:text-white">{act.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget title="Total Revenue" value={formatPrice(totalEarnings)} change={0} changeLabel="live" icon={DollarSign} color="brand" />
        <StatWidget title="Appointments" value={appointmentsCount} change={0} changeLabel="live" icon={CalendarIcon} color="accent" />
        <StatWidget title="Total Customers" value={customerCount} change={0} changeLabel="live" icon={Users} color="amber" />
        <StatWidget title="Profile Views" value={profileViews} change={0} changeLabel="live" icon={TrendingUp} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Area */}
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart data={last7DaysRevenue} title="Revenue Trend (Last 7 Days)" />
          <BookingChart data={last7DaysBookings} title="Bookings by Day" />
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          {/* Upcoming Schedule */}
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-surface-900 dark:text-white">Active Schedule</h2>
              <Link to="/business/calendar" className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                View calendar
              </Link>
            </div>
            
            <div className="space-y-3">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map(booking => (
                  <AppointmentCard key={booking.id} appointment={booking} variant="compact" />
                ))
              ) : (
                <div className="text-center py-6 text-sm text-surface-500 dark:text-surface-400">
                  No active bookings scheduled.
                </div>
              )}
            </div>
          </div>

          {/* Top Services */}
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-surface-900 dark:text-white">Top Services</h2>
              <PieChart className="w-4 h-4 text-surface-400" />
            </div>
            
            <div className="space-y-4">
              {topServices.length > 0 ? (
                topServices.map((service, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-surface-900 dark:text-white">{service.name}</p>
                      <p className="text-xs text-surface-500">{service.sales} bookings</p>
                    </div>
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{service.revenue}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-surface-500 dark:text-surface-400">
                  No services booked yet.
                </div>
              )}
            </div>
          </div>

          {/* AI Insights Widget */}
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-surface-900 dark:text-white flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#405742] flex items-center justify-center">
                  <Bot size={13} className="text-white" />
                </div>
                AI Insights
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#405742]/10 dark:bg-[#405742]/15 text-[#405742] dark:text-[#5a7a62] border border-[#405742]/20 dark:border-[#405742]/30">
                Powered by AI
              </span>
            </div>

            <div className="space-y-3">
              {aiInsights.map(({ icon: Icon, iconColor, bgColor, title, value, desc }) => (
                <div key={title} className={`${bgColor} rounded-xl p-3 flex items-start gap-3`}>
                  <div className={`w-8 h-8 rounded-lg bg-white dark:bg-surface-800 flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon size={15} className={iconColor} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-surface-700 dark:text-surface-300">{title}</p>
                    <p className="text-sm font-extrabold text-surface-900 dark:text-white">{value}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/ai-assistant"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#405742] text-white text-sm font-bold hover:bg-[#334d3b] hover:shadow-lg transition-all"
            >
              <Sparkles size={14} /> Chat with AI <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
