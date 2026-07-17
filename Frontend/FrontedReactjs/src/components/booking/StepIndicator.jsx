import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '../../utils/helpers'

export default function StepIndicator({ steps = [], currentStep = 1, className }) {
  return (
    <div className={cn('flex items-center w-full', className)}>
      {steps.map((label, i) => {
        const stepNum = i + 1
        const isActive = stepNum === currentStep
        const isCompleted = stepNum < currentStep

        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center relative">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted ? '#7C3AED' : isActive ? '#7C3AED' : '#e5e7eb',
                }}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  isCompleted || isActive ? 'text-white' : 'text-surface-400 dark:text-surface-500 dark:bg-surface-800'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
              </motion.div>
              <span className={cn(
                'absolute -bottom-6 text-[10px] font-medium whitespace-nowrap hidden sm:block',
                isActive ? 'text-brand-600 dark:text-brand-400 font-bold' :
                isCompleted ? 'text-surface-600 dark:text-surface-400' :
                'text-surface-400 dark:text-surface-500'
              )}>
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-1.5 rounded-full overflow-hidden bg-surface-200 dark:bg-surface-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-brand-600"
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
