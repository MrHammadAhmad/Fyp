import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '../../utils/helpers'

const defaultData = [
  { name: 'Jan', customers: 120 },
  { name: 'Feb', customers: 145 },
  { name: 'Mar', customers: 190 },
  { name: 'Apr', customers: 230 },
  { name: 'May', customers: 280 },
  { name: 'Jun', customers: 345 },
  { name: 'Jul', customers: 390 },
  { name: 'Aug', customers: 410 },
  { name: 'Sep', customers: 470 },
  { name: 'Oct', customers: 520 },
  { name: 'Nov', customers: 590 },
  { name: 'Dec', customers: 680 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-3 shadow-lg">
        <p className="text-xs text-surface-500 dark:text-surface-400 font-medium">{label}</p>
        <p className="text-sm font-bold text-surface-900 dark:text-white">
          {payload[0].value} customers
        </p>
      </div>
    )
  }
  return null
}

export default function CustomerGrowthChart({ data = defaultData, title = 'Customer Growth', className }) {
  return (
    <div className={cn('bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6', className)}>
      <h3 className="text-base font-bold text-surface-900 dark:text-white mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="customers"
            stroke="#10B981"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, stroke: '#10B981', fill: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
