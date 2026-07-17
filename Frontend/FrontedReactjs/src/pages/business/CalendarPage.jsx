import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon, Clock, Users, Loader2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import { cn, generateTimeSlots } from '../../utils/helpers'
import staffData from '../../data/staff.json'
import { bookingApi } from '../../api/services/bookingApi'
import { businessApi } from '../../api/services/businessApi'
import { useBusinessRefreshStore } from '../../store/businessRefreshStore'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('day') // 'day' | 'week'
  const [appointments, setAppointments] = useState([])
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)

  const timeSlots = generateTimeSlots('09:00', '18:00', 60)

  // Subscribe to global refresh signal from NewBookingModal
  const refreshKey = useBusinessRefreshStore((s) => s.refreshKey)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [appts, salon] = await Promise.all([
          bookingApi.getMyBookings().catch(() => []),
          businessApi.getMySalon().catch(() => null),
        ])
        setAppointments(appts || [])

        // Load real staff if salon available; fall back to static JSON
        if (salon?.id) {
          const realStaff = await businessApi.getStaff(salon.id).catch(() => null)
          if (realStaff && realStaff.length > 0) {
            setStaffList(realStaff)
          } else {
            setStaffList(staffData.filter((s) => s.businessId === 'b1'))
          }
        } else {
          setStaffList(staffData.filter((s) => s.businessId === 'b1'))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [refreshKey]) // Re-loads whenever a new booking is created

  // Filter appointments to the currently viewed date
  const dateStr = [
    currentDate.getFullYear(),
    String(currentDate.getMonth() + 1).padStart(2, '0'),
    String(currentDate.getDate()).padStart(2, '0')
  ].join('-')
  
  const todayBookings = appointments.filter(
    (b) =>
      b.date === dateStr &&
      b.status !== 'cancelled'
  )

  const handlePrevDay = () => {
    const prev = new Date(currentDate)
    prev.setDate(prev.getDate() - 1)
    setCurrentDate(prev)
  }

  const handleNextDay = () => {
    const next = new Date(currentDate)
    next.setDate(next.getDate() + 1)
    setCurrentDate(next)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Match a booking to a staff column.
  // Real appointments have staffName (joined from Staff table) or staff_id.
  // Legacy static data matched by staffName directly.
  function getBookingsForStaff(member) {
    if (member.id === 'unassigned') {
      return todayBookings.filter((b) => !b.staff_id && !b.staffName)
    }
    return todayBookings.filter((b) => {
      // Match by id (real staff) or by name (fallback)
      if (member.id && b.staff_id) return b.staff_id === member.id
      if (b.staffName && member.name) return b.staffName === member.name
      return false
    })
  }

  // Determine if we need an Unassigned column
  const unassignedBookings = todayBookings.filter((b) => !b.staff_id && !b.staffName)
  const staffToRender = [...staffList]
  if (unassignedBookings.length > 0) {
    staffToRender.push({ id: 'unassigned', name: 'Unassigned', role: 'Any Staff' })
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">

      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl">
            <button onClick={handlePrevDay} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleToday} className="px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-white dark:hover:bg-surface-700 text-surface-900 dark:text-white">
              Today
            </button>
            <button onClick={handleNextDay} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-lg font-bold text-surface-900 dark:text-white min-w-[200px]">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">


          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => window.dispatchEvent(new CustomEvent('open-new-booking'))}>New Appointment</Button>
        </div>
      </div>

      {/* Calendar Grid Area */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="flex-1 overflow-auto flex">

          {/* Time Column */}
          <div className="w-20 flex-shrink-0 border-r border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950/50">
            <div className="h-14 border-b border-surface-200 dark:border-surface-800 sticky top-0 bg-surface-50 dark:bg-surface-950/50 z-10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-surface-400" />
            </div>
            {timeSlots.map(slot => (
              <div key={slot.value} className="h-24 border-b border-surface-200 dark:border-surface-800 p-2 text-right">
                <span className="text-xs font-medium text-surface-500 dark:text-surface-400 -mt-2.5 block">{slot.label}</span>
              </div>
            ))}
          </div>

          {/* Staff Columns */}
          <div className="flex-1 flex min-w-max">
            {staffToRender.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-surface-400 text-sm">
                No staff members found. Add staff in Manage Salon.
              </div>
            ) : (
              staffToRender.map((member, i) => (
                <div key={member.id} className={cn('flex-1 min-w-[200px] border-r border-surface-200 dark:border-surface-800 relative', i === staffToRender.length - 1 && 'border-r-0')}>
                  {/* Staff Header */}
                  <div className="h-14 border-b border-surface-200 dark:border-surface-800 sticky top-0 bg-white dark:bg-surface-900 z-10 flex flex-col items-center justify-center p-2">
                    <span className="text-sm font-bold text-surface-900 dark:text-white truncate w-full text-center">{member.name}</span>
                    <span className="text-xs text-surface-500 truncate w-full text-center">{member.role || member.specialty || ''}</span>
                  </div>

                  {/* Grid Background */}
                  <div className="relative">
                    {timeSlots.map(slot => (
                      <div key={slot.value} className="h-24 border-b border-surface-100 dark:border-surface-800/50 hover:bg-surface-50 dark:hover:bg-surface-800/20 cursor-crosshair transition-colors" />
                    ))}

                    {/* Live Booking Items (Positioned absolutely) */}
                    {getBookingsForStaff(member).map((booking) => {
                      const timePart = (booking.time || '09:00:00').substring(0, 5)
                      const [h, m] = timePart.split(':').map(Number)
                      const top = (h - 9) * 96 + (m / 60) * 96
                      const height = ((booking.duration || 60) / 60) * 96

                      return (
                        <div
                          key={booking.id}
                          className={cn(
                            'absolute left-1 right-1 rounded-lg p-2 border shadow-sm flex flex-col justify-between overflow-hidden group cursor-pointer hover:shadow-md hover:z-20 transition-all',
                            booking.status === 'completed'
                              ? 'bg-surface-100 border-surface-300 dark:bg-surface-800 dark:border-surface-600' :
                            booking.status === 'confirmed'
                              ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/30 dark:border-brand-800'
                              : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800'
                          )}
                          style={{ top: `${top}px`, height: `${Math.max(height, 36)}px` }}
                          title={`${booking.serviceName} - ${booking.customer_name || booking.customerName || 'Customer'}`}
                        >
                          <div>
                            <p className={cn('text-xs font-bold truncate', booking.status === 'completed' ? 'text-surface-700 dark:text-surface-300' : booking.status === 'confirmed' ? 'text-brand-900 dark:text-brand-100' : 'text-emerald-900 dark:text-emerald-100')}>
                              {timePart} - {booking.serviceName || 'Appointment'}
                            </p>
                            {height > 48 && (
                              <p className={cn('text-xs truncate flex items-center gap-1 mt-1', booking.status === 'completed' ? 'text-surface-500 dark:text-surface-400' : booking.status === 'confirmed' ? 'text-brand-700 dark:text-brand-300' : 'text-emerald-700 dark:text-emerald-300')}>
                                <Users className="w-3 h-3" /> {booking.customer_name || booking.customerName || 'Customer'}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  )
}
