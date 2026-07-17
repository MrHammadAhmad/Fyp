import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay, isToday, isBefore, startOfDay } from 'date-fns'
import { cn } from '../../utils/helpers'

export default function DatePicker({ selectedDate, onSelect, openingHours, className }) {
  const [weekOffset, setWeekOffset] = useState(0)

  const today = startOfDay(new Date())
  const weekStart = addDays(startOfWeek(today, { weekStartsOn: 1 }), weekOffset * 7)

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i)
      const dayNameFull = format(date, 'EEEE')
      let isClosed = false
      if (openingHours && openingHours.length > 0) {
        const schedule = openingHours.find(h => h.day === dayNameFull)
        if (schedule && (schedule.closed === true || schedule.closed === 'true')) {
          isClosed = true
        }
      }
      return {
        date,
        dayName: format(date, 'EEE'),
        dayNum: format(date, 'd'),
        month: format(date, 'MMM'),
        isPast: isBefore(date, today),
        isToday: isToday(date),
        isSelected: selectedDate && isSameDay(date, selectedDate),
        isClosed
      }
    })
  }, [weekStart, selectedDate, openingHours])

  const monthLabel = format(weekStart, 'MMMM yyyy')

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-1">Select a Date</h2>
        <p className="text-sm text-surface-500 dark:text-surface-400">Choose your preferred appointment date</p>
      </div>

      {/* Month/Week Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          disabled={weekOffset <= 0}
          className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-surface-600 dark:text-surface-400" />
        </button>
        <span className="text-sm font-bold text-surface-900 dark:text-white">{monthLabel}</span>
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          disabled={weekOffset >= 8}
          className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-surface-600 dark:text-surface-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => (
          <motion.button
            key={i}
            whileHover={!(day.isPast || day.isClosed) ? { scale: 1.05 } : {}}
            whileTap={!(day.isPast || day.isClosed) ? { scale: 0.95 } : {}}
            disabled={day.isPast || day.isClosed}
            onClick={() => onSelect?.(day.date)}
            className={cn(
              'flex flex-col items-center gap-1 py-3 px-1 rounded-2xl text-center transition-all cursor-pointer border relative',
              day.isSelected
                ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-500/25'
                : day.isToday
                ? 'border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-300'
                : (day.isPast || day.isClosed)
                ? 'opacity-40 cursor-not-allowed border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50 text-surface-400'
                : 'border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-brand-300 dark:hover:border-brand-700 text-surface-700 dark:text-surface-300'
            )}
          >
            <span className={cn('text-[10px] font-medium uppercase', day.isSelected && 'text-white/80')}>
              {day.dayName}
            </span>
            <span className={cn('text-lg font-bold', day.isSelected && 'text-white')}>
              {day.dayNum}
            </span>
            {day.isClosed && !day.isPast && (
              <span className="absolute -bottom-1.5 text-[8px] font-bold text-red-500 uppercase">Closed</span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Today shortcut */}
      {weekOffset !== 0 && (
        <button
          onClick={() => { setWeekOffset(0); onSelect?.(today) }}
          className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
        >
          ← Back to today
        </button>
      )}
    </div>
  )
}
