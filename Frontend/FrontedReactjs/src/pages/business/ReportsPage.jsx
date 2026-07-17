import React, { useState, useEffect, useMemo } from 'react'
import { Download, TrendingUp, DollarSign, Users, Calendar, BarChart3, Loader2, X, FileText, CheckCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import RevenueChart from '../../components/charts/RevenueChart'
import BookingChart from '../../components/charts/BookingChart'
import { businessApi } from '../../api/services/businessApi'
import { bookingApi } from '../../api/services/bookingApi'
import { useBusinessRefreshStore } from '../../store/businessRefreshStore'
import { formatPrice, formatDate } from '../../utils/helpers'
import * as Dialog from '@radix-ui/react-dialog'
import showToast from '../../components/ui/Toast'

export default function ReportsPage() {
  const [report, setReport] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeReportId, setActiveReportId] = useState(null)

  // Subscribe to global refresh signal from NewBookingModal
  const refreshKey = useBusinessRefreshStore((s) => s.refreshKey)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const salon = await businessApi.getMySalon().catch(() => null)
        const salonId = salon?.id || 'b1'

        const [reportData, appts, realStaff] = await Promise.all([
          businessApi.getPerformanceReport().catch(() => null),
          bookingApi.getMyBookings().catch(() => []),
          businessApi.getStaff(salonId).catch(() => [])
        ])

        setReport(reportData)
        setAppointments(appts || [])
        setStaffList(realStaff || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [refreshKey])

  const reportsList = [
    { id: 1, name: 'Sales Summary', desc: 'Overview of total sales, taxes, and net revenue.', icon: DollarSign, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/30' },
    { id: 2, name: 'Staff Performance', desc: 'Revenue generated and hours worked per staff.', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { id: 3, name: 'Appointments by Service', desc: 'Most popular services booked.', icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    { id: 4, name: 'Client Retention', desc: 'New vs returning customer metrics.', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  ]

  // Report 1: Sales Summary Data Breakdown
  const salesSummaryData = useMemo(() => {
    return appointments
      .filter(a => a.payment_status === 'paid')
      .map(a => {
        const gross = parseFloat(a.price || 0)
        const tax = gross * 0.10 // 10% tax mock
        const net = gross - tax
        return {
          id: a.id,
          ref: `APT-${a.id.substring(0, 8).toUpperCase()}`,
          client: a.customer_name || 'Walk-in Client',
          date: a.date,
          gross,
          tax,
          net
        }
      })
  }, [appointments])

  // Report 2: Staff Performance Data Breakdown
  const staffPerformanceData = useMemo(() => {
    const defaultStaff = [
      { id: 's1', name: 'Alex Stylist', role: 'Senior Stylist' },
      { id: 's2', name: 'Jordan Barber', role: 'Master Barber' }
    ]
    const list = staffList.length > 0 ? staffList : defaultStaff

    return list.map(member => {
      // Find appointments assigned to this staff member
      const memberAppts = appointments.filter(a => 
        a.staff_id === member.id || a.staffName === member.name
      )
      const completed = memberAppts.filter(a => a.status === 'completed' || a.status === 'confirmed')
      const revenue = completed.reduce((sum, a) => sum + parseFloat(a.price || 0), 0)
      // Mock hours worked (assuming 45 mins per completed booking)
      const hours = (completed.length * 0.75).toFixed(1)

      return {
        id: member.id,
        name: member.name,
        role: member.role || 'Stylist',
        bookingsCount: memberAppts.length,
        completedCount: completed.length,
        revenue,
        hours
      }
    })
  }, [staffList, appointments])

  // Report 3: Appointments by Service Breakdown
  const appointmentsByServiceData = useMemo(() => {
    const servicesMap = {}
    appointments.forEach(a => {
      const sName = a.serviceName || 'Standard Service'
      const price = parseFloat(a.price || 0)
      const isPaid = a.payment_status === 'paid'

      if (!servicesMap[sName]) {
        servicesMap[sName] = { count: 0, revenue: 0 }
      }
      servicesMap[sName].count += 1
      if (isPaid) {
        servicesMap[sName].revenue += price
      }
    })

    return Object.entries(servicesMap)
      .map(([name, stats]) => ({
        name,
        bookings: stats.count,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.bookings - a.bookings)
  }, [appointments])

  // Report 4: Client Retention Data Breakdown
  const clientRetentionData = useMemo(() => {
    const clientsMap = {}
    appointments.forEach(a => {
      const name = a.customer_name || 'Walk-in Client'
      const key = a.customer_phone?.trim() || name
      const price = parseFloat(a.price || 0)

      if (!clientsMap[key]) {
        clientsMap[key] = { name, visits: 0, spent: 0, dates: [] }
      }
      clientsMap[key].visits += 1
      clientsMap[key].spent += price
      clientsMap[key].dates.push(a.date)
    })

    const details = Object.entries(clientsMap).map(([key, data]) => {
      const status = data.visits > 1 ? 'Returning' : 'New'
      const sortedDates = data.dates.sort((a, b) => new Date(b) - new Date(a))
      return {
        name: data.name,
        visits: data.visits,
        spent: data.spent,
        lastVisit: sortedDates[0],
        status
      }
    })

    const newClients = details.filter(c => c.status === 'New').length
    const returningClients = details.filter(c => c.status === 'Returning').length
    const total = details.length || 1
    const retentionRate = ((returningClients / total) * 100).toFixed(0)

    return {
      details,
      newClients,
      returningClients,
      retentionRate
    }
  }, [appointments])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Reports &amp; Analytics</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Deep dive into your business performance data.</p>
        </div>

      </div>

      {/* Live KPI Summary from API */}
      {!loading && report && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-surface-500 mb-1">Total Revenue</p>
            <p className="text-2xl font-extrabold text-surface-900 dark:text-white">{formatPrice(report.total_earnings || 0)}</p>
          </div>
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-surface-500 mb-1">Total Appointments</p>
            <p className="text-2xl font-extrabold text-surface-900 dark:text-white">{report.appointments_count || 0}</p>
          </div>
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-surface-500 mb-1">Unique Customers</p>
            <p className="text-2xl font-extrabold text-surface-900 dark:text-white">{report.customer_count || 0}</p>
          </div>
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-surface-500 mb-1">Completed</p>
            <p className="text-2xl font-extrabold text-surface-900 dark:text-white">{report.status_breakdown?.completed || 0}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart title="Gross Revenue" />
        <BookingChart title="Total Bookings" />
      </div>

      {/* Most Booked Services from API */}
      {!loading && report?.popular_services && Object.keys(report.popular_services).length > 0 && (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-surface-400" />
            <h3 className="font-bold text-lg text-surface-900 dark:text-white">Most Booked Services</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(report.popular_services).map(([name, count]) => {
              const max = Math.max(...Object.values(report.popular_services))
              const pct = Math.round((count / max) * 100)
              return (
                <div key={name} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300 w-40 truncate">{name}</span>
                  <div className="flex-1 h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-bold text-surface-900 dark:text-white w-10 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Detailed Reports Section */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm mt-8">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-surface-400" />
          <h3 className="font-bold text-lg text-surface-900 dark:text-white">Detailed Reports</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportsList.map((reportItem) => (
            <div 
              key={reportItem.id} 
              onClick={() => setActiveReportId(reportItem.id)}
              className="flex items-start gap-4 p-4 rounded-xl border border-surface-200 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-700 transition-colors cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${reportItem.bg} ${reportItem.color}`}>
                <reportItem.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-surface-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{reportItem.name}</h4>
                <p className="text-sm text-surface-500 dark:text-surface-400">{reportItem.desc}</p>
              </div>
              <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">View</Button>
            </div>
          ))}
        </div>
      </div>

      {/* RADIX DIALOG MODAL FOR DETAILED REPORT TABLES */}
      <Dialog.Root open={activeReportId !== null} onOpenChange={(open) => !open && setActiveReportId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-surface-900 rounded-3xl p-6 w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto shadow-xl z-50 focus:outline-none border border-surface-100 dark:border-surface-800">
            
            <div className="flex justify-between items-center mb-6 border-b border-surface-100 dark:border-surface-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <Dialog.Title className="text-xl font-bold text-surface-900 dark:text-white">
                    {activeReportId === 1 && 'Sales Summary Report'}
                    {activeReportId === 2 && 'Staff Performance Report'}
                    {activeReportId === 3 && 'Appointments by Service Report'}
                    {activeReportId === 4 && 'Client Retention Metrics'}
                  </Dialog.Title>
                  <p className="text-xs text-surface-400">Real-time dynamic business intelligence</p>
                </div>
              </div>
              <Dialog.Close className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200">
                <X size={20} />
              </Dialog.Close>
            </div>

            {/* Content for Report 1: Sales Summary */}
            {activeReportId === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-surface-50 dark:bg-surface-850 p-4 rounded-2xl">
                    <p className="text-xs text-surface-500">Gross Sales (Paid)</p>
                    <p className="text-xl font-bold text-surface-900 dark:text-white">
                      {formatPrice(salesSummaryData.reduce((sum, s) => sum + s.gross, 0))}
                    </p>
                  </div>
                  <div className="bg-surface-50 dark:bg-surface-850 p-4 rounded-2xl">
                    <p className="text-xs text-surface-500">Taxes (10% Est.)</p>
                    <p className="text-xl font-bold text-amber-600">
                      {formatPrice(salesSummaryData.reduce((sum, s) => sum + s.tax, 0))}
                    </p>
                  </div>
                  <div className="bg-surface-50 dark:bg-surface-850 p-4 rounded-2xl">
                    <p className="text-xs text-surface-500">Net Revenue</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {formatPrice(salesSummaryData.reduce((sum, s) => sum + s.net, 0))}
                    </p>
                  </div>
                </div>

                <div className="border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-50 dark:bg-surface-950 text-xs font-bold text-surface-500 uppercase">
                        <th className="p-3 pl-4">Transaction Ref</th>
                        <th className="p-3">Client</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Gross Sales</th>
                        <th className="p-3">Tax (10%)</th>
                        <th className="p-3 pr-4 text-right">Net Sales</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-sm">
                      {salesSummaryData.length > 0 ? (
                        salesSummaryData.map((item) => (
                          <tr key={item.id} className="hover:bg-surface-50/50">
                            <td className="p-3 pl-4 font-mono font-semibold">{item.ref}</td>
                            <td className="p-3">{item.client}</td>
                            <td className="p-3">{formatDate(item.date)}</td>
                            <td className="p-3 font-semibold">{formatPrice(item.gross)}</td>
                            <td className="p-3 text-surface-500">{formatPrice(item.tax)}</td>
                            <td className="p-3 pr-4 text-right font-bold text-emerald-600">{formatPrice(item.net)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-6 text-center text-surface-400">No sales transactions available to report.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Content for Report 2: Staff Performance */}
            {activeReportId === 2 && (
              <div className="space-y-4">
                <div className="border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-50 dark:bg-surface-950 text-xs font-bold text-surface-500 uppercase">
                        <th className="p-3 pl-4">Staff Member</th>
                        <th className="p-3">Role</th>
                        <th className="p-3 text-center">Total Bookings</th>
                        <th className="p-3 text-center">Completed</th>
                        <th className="p-3 text-center">Hours Worked</th>
                        <th className="p-3 pr-4 text-right">Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-sm">
                      {staffPerformanceData.map((staff) => (
                        <tr key={staff.id} className="hover:bg-surface-50/50">
                          <td className="p-3 pl-4 font-bold">{staff.name}</td>
                          <td className="p-3 text-surface-500">{staff.role}</td>
                          <td className="p-3 text-center">{staff.bookingsCount}</td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                              <CheckCircle size={14} /> {staff.completedCount}
                            </span>
                          </td>
                          <td className="p-3 text-center font-medium">{staff.hours} hrs</td>
                          <td className="p-3 pr-4 text-right font-bold text-surface-900 dark:text-white">
                            {formatPrice(staff.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Content for Report 3: Appointments by Service */}
            {activeReportId === 3 && (
              <div className="space-y-4">
                <div className="border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-50 dark:bg-surface-950 text-xs font-bold text-surface-500 uppercase">
                        <th className="p-3 pl-4">Service Offered</th>
                        <th className="p-3 text-center">Total Bookings count</th>
                        <th className="p-3 pr-4 text-right">Total Revenue (Paid)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-sm">
                      {appointmentsByServiceData.length > 0 ? (
                        appointmentsByServiceData.map((svc) => (
                          <tr key={svc.name} className="hover:bg-surface-50/50">
                            <td className="p-3 pl-4 font-bold">{svc.name}</td>
                            <td className="p-3 text-center font-semibold">{svc.bookings}</td>
                            <td className="p-3 pr-4 text-right font-bold text-emerald-600">{formatPrice(svc.revenue)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="p-6 text-center text-surface-400">No service bookings logged yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Content for Report 4: Client Retention */}
            {activeReportId === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-surface-50 dark:bg-surface-850 p-4 rounded-2xl">
                    <p className="text-xs text-surface-500">New Customers</p>
                    <p className="text-xl font-bold text-blue-600">{clientRetentionData.newClients}</p>
                  </div>
                  <div className="bg-surface-50 dark:bg-surface-850 p-4 rounded-2xl">
                    <p className="text-xs text-surface-500">Returning Customers</p>
                    <p className="text-xl font-bold text-emerald-600">{clientRetentionData.returningClients}</p>
                  </div>
                  <div className="bg-surface-50 dark:bg-surface-850 p-4 rounded-2xl">
                    <p className="text-xs text-surface-500">Retention Rate</p>
                    <p className="text-xl font-bold text-brand-600">{clientRetentionData.retentionRate}%</p>
                  </div>
                </div>

                <div className="border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-50 dark:bg-surface-950 text-xs font-bold text-surface-500 uppercase">
                        <th className="p-3 pl-4">Client Name</th>
                        <th className="p-3 text-center">Total Visits</th>
                        <th className="p-3">Last Visited Date</th>
                        <th className="p-3 text-center">Customer Type</th>
                        <th className="p-3 pr-4 text-right">Total Lifetime Spend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-sm">
                      {clientRetentionData.details.length > 0 ? (
                        clientRetentionData.details.map((client) => (
                          <tr key={client.name} className="hover:bg-surface-50/50">
                            <td className="p-3 pl-4 font-bold">{client.name}</td>
                            <td className="p-3 text-center font-semibold">{client.visits}</td>
                            <td className="p-3 text-surface-500">{formatDate(client.lastVisit)}</td>
                            <td className="p-3 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                                client.status === 'Returning'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30'
                                  : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30'
                              }`}>
                                {client.status}
                              </span>
                            </td>
                            <td className="p-3 pr-4 text-right font-bold text-surface-900 dark:text-white">
                              {formatPrice(client.spent)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-6 text-center text-surface-400">No client booking history recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-surface-100 dark:border-surface-800 mt-6">
              <Dialog.Close asChild>
                <Button variant="outline" type="button">Close Report</Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
