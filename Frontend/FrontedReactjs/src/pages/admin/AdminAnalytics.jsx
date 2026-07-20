import React, { useState } from 'react'
import { Download, Users, Store, Activity, TrendingUp } from 'lucide-react'
import Button from '../../components/ui/Button'
import RevenueChart from '../../components/charts/RevenueChart'
import BookingChart from '../../components/charts/BookingChart'
import CustomerGrowthChart from '../../components/charts/CustomerGrowthChart'
import { adminApi } from '../../api/services/adminApi'
import toast from 'react-hot-toast'

export default function AdminAnalytics() {
  const [dateFilter, setDateFilter] = useState('7days')
  const [isExporting, setIsExporting] = useState(false)
  const [report, setReport] = useState(null)
  
  React.useEffect(() => {
    async function loadData() {
      try {
        const reportData = await adminApi.getSystemReport()
        setReport(reportData)
      } catch (err) {
        console.error('Failed to load analytics data:', err)
      }
    }
    loadData()
  }, [])

  const revenueData = report?.appointments?.daily_revenue
    ? Object.entries(report.appointments.daily_revenue).map(([day, val]) => {
        const d = new Date(day)
        return {
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: val
        }
      })
    : undefined

  const growthData = report?.users?.daily_growth
    ? Object.entries(report.users.daily_growth).map(([day, val]) => {
        const d = new Date(day)
        return {
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          customers: val
        }
      })
    : undefined

  const bookingData = report?.appointments?.daily_trends
    ? Object.entries(report.appointments.daily_trends).map(([day, val]) => {
        const d = new Date(day)
        return {
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          bookings: val
        }
      })
    : undefined

  const handleExport = async () => {
    try {
      setIsExporting(true)
      toast.loading('Generating report...', { id: 'export-report' })
      const reportData = await adminApi.getSystemReport()
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2))
      const downloadAnchorElement = document.createElement('a')
      downloadAnchorElement.setAttribute("href", dataStr)
      downloadAnchorElement.setAttribute("download", `platform_analytics_${dateFilter}_${new Date().toISOString().split('T')[0]}.json`)
      document.body.appendChild(downloadAnchorElement)
      downloadAnchorElement.click()
      downloadAnchorElement.remove()
      
      toast.success('Report exported successfully', { id: 'export-report' })
    } catch (error) {
      console.error('Failed to export report:', error)
      toast.error('Failed to export report', { id: 'export-report' })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Platform Analytics</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Comprehensive overview of platform growth and revenue.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
          <Button 
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueData} title="Platform Gross Revenue (Last 7 Days)" />
        <CustomerGrowthChart data={growthData} title="Active User Growth (Last 7 Days)" />
        <BookingChart data={bookingData} title="Total Platform Bookings (Last 7 Days)" />
        
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-surface-900 dark:text-white mb-6">Key Performance Indicators</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-surface-600 dark:text-surface-400">Customer Retention Rate</span>
                <span className="font-bold text-surface-900 dark:text-white">68%</span>
              </div>
              <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-surface-600 dark:text-surface-400">Business Churn Rate</span>
                <span className="font-bold text-surface-900 dark:text-white">2.4%</span>
              </div>
              <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-surface-600 dark:text-surface-400">Booking Completion Rate</span>
                <span className="font-bold text-surface-900 dark:text-white">89%</span>
              </div>
              <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-2">
                <div className="bg-brand-500 h-2 rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-surface-600 dark:text-surface-400">No-Show Rate</span>
                <span className="font-bold text-surface-900 dark:text-white">4.1%</span>
              </div>
              <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
