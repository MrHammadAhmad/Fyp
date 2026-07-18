import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '../../utils/helpers'

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

export default function CustomerGrowthChart({ data, title = 'Customer Growth', className }) {
  const chartData = data && data.length > 0 ? data : [];
  return (
    <div className={cn('bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6', className)}>
      <h3 className="text-base font-bold text-surface-900 dark:text-white mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
