import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../utils/helpers'

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right', // 'right' | 'left' | 'bottom'
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showClose = true,
  className
}) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const positionClasses = {
    right: 'top-0 right-0 h-full border-l',
    left: 'top-0 left-0 h-full border-r',
    bottom: 'bottom-0 left-0 right-0 w-full border-t max-h-[90vh] rounded-t-3xl',
  }

  const sizeClasses = {
    sm: position === 'bottom' ? 'h-[300px]' : 'w-full max-w-sm',
    md: position === 'bottom' ? 'h-[500px]' : 'w-full max-w-md',
    lg: position === 'bottom' ? 'h-[700px]' : 'w-full max-w-lg',
    xl: position === 'bottom' ? 'h-[85vh]' : 'w-full max-w-xl',
    full: position === 'bottom' ? 'h-[95vh]' : 'w-full max-w-full',
  }

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  const drawerVariants = {
    hidden: {
      x: position === 'right' ? '100%' : position === 'left' ? '-100%' : 0,
      y: position === 'bottom' ? '100%' : 0,
    },
    visible: {
      x: 0,
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 200 }
    },
    exit: {
      x: position === 'right' ? '100%' : position === 'left' ? '-100%' : 0,
      y: position === 'bottom' ? '100%' : 0,
      transition: { ease: 'easeInOut', duration: 0.2 }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Drawer content */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'absolute bg-white dark:bg-surface-950 border-surface-200 dark:border-surface-800 shadow-2xl flex flex-col',
              positionClasses[position],
              sizeClasses[size],
              className
            )}
          >
            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between p-5 border-b border-surface-100 dark:border-surface-800">
                {title ? (
                  <h3 className="text-lg font-bold text-surface-900 dark:text-white">
                    {title}
                  </h3>
                ) : (
                  <div />
                )}
                {showClose && (
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
