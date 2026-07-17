import React, { useState } from 'react'
import { BarChart3, TrendingUp, Calendar, CalendarX2, CheckCircle2, Download, Filter } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import Button from '../../components/ui/Button'

// Mock Data
const bookingData = [
  { name: 'Mon', completed: 45, cancelled: 5 },
  { name: 'Tue', completed: 52, cancelled: 8 },
  { name: 'Wed', completed: 38, cancelled: 3 },
  { name: 'Thu', completed: 65, cancelled: 10 },
  { name: 'Fri', completed: 85, cancelled: 12 },
  { name: 'Sat', completed: 110, cancelled: 15 },
  { name: 'Sun', completed: 90, cancelled: 8 },
]

export default function BookingStatisticsDashboard() {
  const [dateRange, setDateRange] = useState('Last 7 Days')

  const stats = [
    { label: 'Total Bookings', value: '485', trend: '+12%', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Completed', value: '435', trend: '+15%', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Cancelled', value: '50', trend: '-5%', icon: CalendarX2, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
    { label: 'Revenue Generated', value: '$24,500', trend: '+18%', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-brand-500" />
            Booking Statistics
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Platform-wide booking analytics and trends.
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm font-medium dark:text-white"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
          <Button variant="outline" leftIcon={<Download size={18} />}>
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-surface-900 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                stat.trend.startsWith('+') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-surface-500 dark:text-surface-400 text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-surface-900 dark:text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Booking Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Volume by Day</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="completed" name="Completed" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
