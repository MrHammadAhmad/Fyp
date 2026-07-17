import React from 'react'
import StaffCard from '../cards/StaffCard'
import { cn } from '../../utils/helpers'

export default function StaffSelector({ staff = [], selectedStaff, onSelect, className }) {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-1">Choose Your Specialist</h2>
        <p className="text-sm text-surface-500 dark:text-surface-400">Select a staff member or choose "Any available"</p>
      </div>

      {/* Any available option */}
      <div
        onClick={() => onSelect?.({ id: 'any', name: 'Any Available' })}
        className={cn(
          'flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all',
          selectedStaff?.id === 'any'
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 shadow-md ring-1 ring-brand-500'
            : 'border-surface-200 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-surface-900'
        )}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
          ✨
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-surface-900 dark:text-white text-sm">Any Available</h4>
          <p className="text-xs text-surface-500 dark:text-surface-400">We'll assign the best available specialist</p>
        </div>
        <div className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
          selectedStaff?.id === 'any' ? 'border-brand-500 bg-brand-500' : 'border-surface-300 dark:border-surface-600'
        )}>
          {selectedStaff?.id === 'any' && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      </div>

      {/* Staff List */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {staff.map((member) => (
          <StaffCard
            key={member.id}
            staff={member}
            variant="selectable"
            selected={selectedStaff?.id === member.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
