import React, { useState } from 'react'
import { TrendingUp, Users, Scissors, Star, Download, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import Button from '../../components/ui/Button'

const performanceData = [
  { name: 'Week 1', revenue: 4000, clients: 85 },
  { name: 'Week 2', revenue: 3000, clients: 65 },
  { name: 'Week 3', revenue: 5000, clients: 105 },
  { name: 'Week 4', revenue: 4500, clients: 95 },
]

const serviceData = [
  { name: 'Haircuts', count: 120 },
  { name: 'Coloring', count: 85 },
  { name: 'Styling', count: 60 },
  { name: 'Treatments', count: 45 },
]

export default function SalonPerformanceDashboard() {
  const [dateRange, setDateRange] = useState('This Month')

  const metrics = [
    { label: 'Total Revenue', value: '$16,500', trend: '+12%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Total Clients', value: '350', trend: '+5%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Services Rendered', value: '415', trend: '+8%', icon: Scissors, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Avg Rating', value: '4.8', trend: '+0.1', icon: Star, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-brand-500" />
            Performance Dashboard
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Monitor your salon's growth, revenue, and client satisfaction.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
            <select 
              className="pl-9 pr-4 py-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm font-medium dark:text-white appearance-none"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>
          <Button variant="outline" leftIcon={<Download size={18} />}>
            Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((stat, i) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-surface-900 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Revenue Overview</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#9ca3af" />
                <YAxis axisLine={false} tickLine={false} stroke="#9ca3af" tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Top Services</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" axisLine={false} tickLine={false} stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="#4b5563" fontWeight="500" />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
