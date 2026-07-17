import React from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { cn, generateTimeSlots, formatTime } from '../../utils/helpers'

export default function TimeSlotPicker({
  selectedTime,
  onSelect,
  startTime = '09:00',
  endTime = '18:00',
  interval = 60,
  className
}) {
  const slots = generateTimeSlots(startTime, endTime, interval)

  // Group by period
  const morning = slots.filter(s => {
    const h = parseInt(s.value.split(':')[0])
    return h < 12
  })
  const afternoon = slots.filter(s => {
    const h = parseInt(s.value.split(':')[0])
    return h >= 12 && h < 17
  })
  const evening = slots.filter(s => {
    const h = parseInt(s.value.split(':')[0])
    return h >= 17
  })

  const renderGroup = (label, groupSlots) => {
    if (groupSlots.length === 0) return null
    return (
      <div>
        <h4 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">{label}</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {groupSlots.map((slot) => (
            <motion.button
              key={slot.value}
              whileHover={slot.available ? { scale: 1.03 } : {}}
              whileTap={slot.available ? { scale: 0.97 } : {}}
              disabled={!slot.available}
              onClick={() => onSelect?.(slot.value)}
              className={cn(
                'py-2.5 px-3 rounded-xl text-sm font-medium transition-all text-center border cursor-pointer',
                selectedTime === slot.value
                  ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-500/25'
                  : slot.available
                  ? 'border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-brand-300 dark:hover:border-brand-700 text-surface-700 dark:text-surface-300'
                  : 'opacity-30 cursor-not-allowed border-transparent bg-surface-100 dark:bg-surface-800/50 text-surface-400 line-through'
              )}
            >
              {slot.label.replace(' AM', '').replace(' PM', '')}
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-1">Select a Time</h2>
        <p className="text-sm text-surface-500 dark:text-surface-400">Choose your preferred time slot</p>
      </div>

      <div className="space-y-5">
        {renderGroup('Morning', morning)}
        {renderGroup('Afternoon', afternoon)}
        {renderGroup('Evening', evening)}
      </div>
    </div>
  )
}
