import React, { useState, useEffect, useMemo } from 'react'
import { Filter, Plus, MoreHorizontal, Mail, Phone, Loader2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import Avatar from '../../components/ui/Avatar'
import { formatPrice, formatDate } from '../../utils/helpers'
import { bookingApi } from '../../api/services/bookingApi'
import { useBusinessRefreshStore } from '../../store/businessRefreshStore'
import showToast from '../../components/ui/Toast'

const PAGE_SIZE = 10

/**
 * Derives a deduplicated customer list from the owner's appointments.
 * - Matches by phone number (walk-in bookings) or user_id (registered customers).
 * - Aggregates booking count, total spent, and last visit date per customer.
 */
function deriveCustomers(appointments) {
  const byKey = {}

  appointments.forEach((apt) => {
    // Prefer phone-based dedup for walk-in; fall back to user_id for registered
    const key = apt.customer_phone?.trim() || apt.user_id || apt.id
    if (!key) return

    const name = apt.customer_name || apt.customerName || 'Registered Customer'
    const phone = apt.customer_phone || '—'
    const price = parseFloat(apt.price || 0)

    if (!byKey[key]) {
      byKey[key] = {
        id: key,
        name,
        phone,
        email: apt.email || '—',
        totalBookings: 0,
        totalSpent: 0,
        lastVisit: apt.date,
        status: 'active',
        isWalkIn: !apt.user_id || apt.booking_type === 'walk-in',
      }
    }

    byKey[key].totalBookings += 1
    if (apt.payment_status === 'paid') {
      byKey[key].totalSpent += price
    }
    // Track most recent visit
    if (apt.date > byKey[key].lastVisit) {
      byKey[key].lastVisit = apt.date
    }
  })

  return Object.values(byKey).sort((a, b) => (b.lastVisit > a.lastVisit ? 1 : -1))
}

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  // Subscribe to global refresh signal from NewBookingModal
  const refreshKey = useBusinessRefreshStore((s) => s.refreshKey)

  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true)
        const appts = await bookingApi.getMyBookings()
        setCustomers(deriveCustomers(appts || []))
      } catch (err) {
        console.error(err)
        showToast.error('Failed to load customer data.')
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [refreshKey]) // Re-fetches whenever a new booking is created

  const filteredCustomers = useMemo(() => {
    if (!search) return customers
    const q = search.toLowerCase()
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email !== '—' && c.email.toLowerCase().includes(q))
    )
  }, [customers, search])

  const paginated = filteredCustomers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(filteredCustomers.length / PAGE_SIZE) || 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Customers</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Manage your client list and view their history.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
          leftIcon={<Plus className="w-4 h-4" />} 
          onClick={() => window.dispatchEvent(new CustomEvent('open-new-booking'))}
        >
          Add Customer
        </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email or phone..."
            className="w-full sm:max-w-md"
          />

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
                  <th className="p-4 pl-6 font-medium">Customer Info</th>
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium text-center">Bookings</th>
                  <th className="p-4 font-medium">Total Spent</th>
                  <th className="p-4 font-medium">Last Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-sm">
                {paginated.length > 0 ? (
                  paginated.map((customer) => (
                    <tr key={customer.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar fallback={customer.name} size="md" />
                          <div>
                            <p className="font-bold text-surface-900 dark:text-white">{customer.name}</p>
                            {customer.isWalkIn && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                Walk-in
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {customer.email !== '—' && (
                            <p className="text-surface-600 dark:text-surface-300 flex items-center gap-1.5 text-xs">
                              <Mail className="w-3.5 h-3.5 text-surface-400" /> {customer.email}
                            </p>
                          )}
                          <p className="text-surface-600 dark:text-surface-300 flex items-center gap-1.5 text-xs">
                            <Phone className="w-3.5 h-3.5 text-surface-400" /> {customer.phone}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold text-xs">
                          {customer.totalBookings}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-surface-900 dark:text-white">
                        {formatPrice(customer.totalSpent)}
                      </td>
                      <td className="p-4 text-surface-600 dark:text-surface-400">
                        {formatDate(customer.lastVisit)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-surface-500">
                      No customers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredCustomers.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-surface-200 dark:border-surface-800 flex justify-center">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}
