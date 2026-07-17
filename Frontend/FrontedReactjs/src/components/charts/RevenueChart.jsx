import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '../../utils/helpers'

const defaultData = [
  { name: 'Jan', revenue: 4200 },
  { name: 'Feb', revenue: 5800 },
  { name: 'Mar', revenue: 6400 },
  { name: 'Apr', revenue: 5200 },
  { name: 'May', revenue: 7800 },
  { name: 'Jun', revenue: 8900 },
  { name: 'Jul', revenue: 9200 },
  { name: 'Aug', revenue: 8600 },
  { name: 'Sep', revenue: 10400 },
  { name: 'Oct', revenue: 11200 },
  { name: 'Nov', revenue: 12800 },
  { name: 'Dec', revenue: 14500 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-3 shadow-lg">
        <p className="text-xs text-surface-500 dark:text-surface-400 font-medium">{label}</p>
        <p className="text-sm font-bold text-surface-900 dark:text-white">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

export default function RevenueChart({ data = defaultData, title = 'Revenue Overview', className }) {
  return (
    <div className={cn('bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6', className)}>
      <h3 className="text-base font-bold text-surface-900 dark:text-white mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
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
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#7C3AED"
            strokeWidth={2.5}
            fill="url(#colorRevenue)"
            dot={false}
            activeDot={{ r: 5, stroke: '#7C3AED', fill: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
