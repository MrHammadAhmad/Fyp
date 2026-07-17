import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Store, Activity, TrendingUp, DollarSign, AlertCircle, CheckCircle2, ShieldCheck, Clock } from 'lucide-react'
import StatWidget from '../../components/widgets/StatWidget'
import RevenueChart from '../../components/charts/RevenueChart'
import CustomerGrowthChart from '../../components/charts/CustomerGrowthChart'
import Button from '../../components/ui/Button'
import { formatPrice, formatDateRelative } from '../../utils/helpers'
import { adminApi } from '../../api/services/adminApi'
import showToast from '../../components/ui/Toast'

export default function AdminDashboard() {
  const [report, setReport] = useState(null)
  const [pendingSalons, setPendingSalons] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)

  const getLiveActivityIcon = (type) => {
    if (type === 'registration') return Store
    return Users
  }

  const getLiveActivityColor = (type) => {
    if (type === 'registration') return 'text-brand-500'
    return 'text-blue-500'
  }

  const liveActivities = (report?.recent_activities || []).map((act, idx) => ({
    id: idx,
    type: act.type,
    text: act.text,
    time: act.time || new Date().toISOString(),
    icon: getLiveActivityIcon(act.type),
    color: getLiveActivityColor(act.type)
  }))

  const revenueData = report?.appointments?.monthly_revenue
    ? Object.entries(report.appointments.monthly_revenue).map(([month, val]) => ({
        name: month,
        revenue: val
      })).sort((a, b) => a.name.localeCompare(b.name))
    : undefined

  const growthData = report?.users?.monthly_growth
    ? Object.entries(report.users.monthly_growth).map(([month, val]) => ({
        name: month,
        customers: val
      })).sort((a, b) => a.name.localeCompare(b.name))
    : undefined

  async function loadData() {
    try {
      setLoading(true)
      const reportData = await adminApi.getSystemReport()
      setReport(reportData)
      
      const unapproved = await adminApi.getSalons(false)
      setPendingSalons(unapproved || [])
    } catch (err) {
      console.error(err)
      showToast.error('Failed to load admin stats.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApprove = async (salonId) => {
    try {
      setProcessingId(salonId)
      await adminApi.approveSalon(salonId, true)
      setPendingSalons(prev => prev.filter(s => s.id !== salonId))
      showToast.success('Salon approved successfully!')
      
      // Reload stats report
      const reportData = await adminApi.getSystemReport()
      setReport(reportData)
    } catch (err) {
      console.error(err)
      showToast.error('Failed to approve salon.')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    )
  }

  const totalUsers = report?.users?.total || 0
  const approvedSalons = report?.salons?.breakdown?.approved || 0
  const totalRevenue = report?.appointments?.total_revenue || 0.0
  const totalAppointments = report?.appointments?.total || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Platform Overview</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Welcome to the Beauty Personalized AI Admin Center.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadData} variant="outline" size="sm">
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget title="Total Users" value={totalUsers} change={0} icon={Users} color="brand" />
        <StatWidget title="Active Businesses" value={approvedSalons} change={0} icon={Store} color="accent" />
        <StatWidget title="Platform Revenue" value={formatPrice(totalRevenue)} change={0} icon={DollarSign} color="amber" />
        <StatWidget title="Bookings Processed" value={totalAppointments} change={0} icon={Activity} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Area */}
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart data={revenueData} title="Platform Gross Merchandise Value (GMV)" />
          <CustomerGrowthChart data={growthData} title="User Registration Growth" />
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          
          {/* Action Required */}
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-surface-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" /> Pending Approvals ({pendingSalons.length})
              </h2>
            </div>
            
            <div className="space-y-4">
              {pendingSalons.length > 0 ? (
                pendingSalons.map(biz => (
                  <div key={biz.id} className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-surface-900 dark:text-white text-sm">{biz.name}</p>
                        <p className="text-xs text-surface-500">{biz.city || 'No City'} • Applied {new Date(biz.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        fullWidth 
                        disabled={processingId === biz.id}
                        onClick={() => handleApprove(biz.id)}
                        className="bg-[#405742] hover:bg-[#334d3b]"
                      >
                        {processingId === biz.id ? 'Approving...' : 'Approve Salon'}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-surface-500 dark:text-surface-400">
                  No salons pending approval.
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-surface-900 dark:text-white mb-6">System Activity</h2>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-surface-200 dark:before:via-surface-800 before:to-transparent">
              {liveActivities.length > 0 ? (
                liveActivities.map((activity) => (
                  <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-surface-900 bg-surface-100 dark:bg-surface-800 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${activity.color} z-10`}>
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <time className="text-xs font-medium text-brand-600 dark:text-brand-400">{formatDateRelative(activity.time)}</time>
                      </div>
                      <div className="text-sm text-surface-600 dark:text-surface-300">{activity.text}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-surface-500 dark:text-surface-400">
                  No recent activities recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
