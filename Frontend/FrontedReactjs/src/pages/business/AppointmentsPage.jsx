import React, { useState, useEffect, useMemo } from 'react'
import { Filter, Plus, Calendar, Clock, User, Download, MoreHorizontal, Loader2, RefreshCw, Trash2, Star, X } from 'lucide-react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import { getStatusColor, getStatusLabel, formatPrice, formatDate, formatTime, formatDuration } from '../../utils/helpers'
import { bookingApi } from '../../api/services/bookingApi'
import { useBusinessRefreshStore } from '../../store/businessRefreshStore'
import showToast from '../../components/ui/Toast'
import ConfirmModal from '../../components/ui/ConfirmModal'


const PAGE_SIZE = 10

export default function AppointmentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, aptId: null })

  // Subscribe to global refresh signal from NewBookingModal
  const refreshKey = useBusinessRefreshStore((s) => s.refreshKey)

  async function fetchAppointments() {
    try {
      setLoading(true)
      const data = await bookingApi.getMyBookings()
      setAppointments(data || [])
    } catch (err) {
      console.error(err)
      showToast.error('Failed to load appointments.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await bookingApi.updateStatus(appointmentId, { status: newStatus })
      showToast.success('Status updated successfully')
      fetchAppointments()
    } catch (err) {
      console.error(err)
      showToast.error(err.response?.data?.detail || 'Failed to update status')
    }
  }

  const handleDelete = (appointmentId) => {
    setDeleteConfirm({ isOpen: true, aptId: appointmentId })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.aptId) return
    try {
      await bookingApi.delete(deleteConfirm.aptId)
      showToast.success('Appointment deleted successfully')
      fetchAppointments()
    } catch (err) {
      console.error(err)
      showToast.error(err.response?.data?.detail || 'Failed to delete appointment')
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [refreshKey]) // Re-fetches whenever a new booking is created

  const filteredAppointments = useMemo(() => {
    let list = appointments
    if (statusFilter !== 'all') {
      list = list.filter((b) => b.status === statusFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (b) =>
          b.customer_name?.toLowerCase().includes(q) ||
          b.serviceName?.toLowerCase().includes(q) ||
          b.staffName?.toLowerCase().includes(q)
      )
    }
    return list
  }, [appointments, statusFilter, search])

  const paginated = filteredAppointments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(filteredAppointments.length / PAGE_SIZE) || 1

  const handleExport = () => {
    if (filteredAppointments.length === 0) {
      showToast.error('No appointments to export')
      return
    }

    const headers = ['Client', 'Service', 'Date', 'Time', 'Staff', 'Price', 'Status']
    const rows = filteredAppointments.map((b) => [
      `"Rs. {(b.customer_name || b.customerName || '').replace(/"/g, '""')}"`,
      `"Rs. {(b.serviceName || '').replace(/"/g, '""')}"`,
      formatDate(b.date),
      formatTime(b.time),
      `"Rs. {(b.staffName || 'Any').replace(/"/g, '""')}"`,
      b.price || 0,
      b.status
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `appointments_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Appointments</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Manage all your upcoming and past bookings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={handleExport}>
            Export
          </Button>
          <Button
            variant="outline"
            size="md"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchAppointments}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by client, service or staff..."
            className="w-full sm:max-w-xs"
          />
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-500 w-full sm:w-auto"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50/50 dark:bg-surface-900/50 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  <th className="p-4 pl-6 font-medium">Client &amp; Service</th>
                  <th className="p-4 font-medium">Date &amp; Time</th>
                  <th className="p-4 font-medium">Staff</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 pr-6 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-sm">
                {paginated.length > 0 ? (
                  paginated.map((booking) => (
                    <tr key={booking.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                            {(booking.customerName || booking.customer_name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-surface-900 dark:text-white">
                                {booking.customerName || booking.customer_name || '—'}
                              </p>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider ${booking.booking_type === 'walk-in' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                {booking.booking_type === 'walk-in' ? 'Walk-In' : 'Online'}
                              </span>
                            </div>
                            <p className="text-xs text-surface-500 mt-0.5">{booking.customerEmail ? `${booking.customerEmail} • ` : ''}{booking.serviceName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-surface-900 dark:text-white">{formatDate(booking.date)}</p>
                          <p className="text-xs text-surface-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {formatTime(booking.time)}
                            {booking.duration ? ` (${formatDuration(booking.duration)})` : ''}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-xs font-medium text-surface-700 dark:text-surface-300">
                          <User className="w-3 h-3" /> {booking.staffName || 'Any'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-surface-900 dark:text-white">
                        {formatPrice(booking.price || 0)}
                      </td>
                      <td className="p-4">
                        <Badge variant={getStatusColor(booking.status)}>{getStatusLabel(booking.status)}</Badge>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={booking.status}
                            onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                            className="bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-lg px-2 py-1.5 text-xs font-medium outline-none focus:border-brand-500 w-full sm:w-auto"
                          >
                            <option value="pending">Pending</option>
                            {booking.status === 'completed' && <option value="completed">Completed</option>}
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button 
                            onClick={() => handleDelete(booking.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            title="Delete Appointment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-surface-500">
                      No appointments found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredAppointments.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-surface-200 dark:border-surface-800 flex justify-center">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, aptId: null })}
        onConfirm={confirmDelete}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
        confirmText="Delete"
        isDestructive
      />
    </div>
  )
}
