import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '../../utils/helpers'

const defaultData = [
  { name: 'Mon', bookings: 12 },
  { name: 'Tue', bookings: 19 },
  { name: 'Wed', bookings: 15 },
  { name: 'Thu', bookings: 22 },
  { name: 'Fri', bookings: 28 },
  { name: 'Sat', bookings: 35 },
  { name: 'Sun', bookings: 18 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-3 shadow-lg">
        <p className="text-xs text-surface-500 dark:text-surface-400 font-medium">{label}</p>
        <p className="text-sm font-bold text-surface-900 dark:text-white">
          {payload[0].value} bookings
        </p>
      </div>
    )
  }
  return null
}

export default function BookingChart({ data = defaultData, title = 'Bookings This Week', className }) {
  return (
    <div className={cn('bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6', className)}>
      <h3 className="text-base font-bold text-surface-900 dark:text-white mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }} />
          <Bar
            dataKey="bookings"
            fill="#7C3AED"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
