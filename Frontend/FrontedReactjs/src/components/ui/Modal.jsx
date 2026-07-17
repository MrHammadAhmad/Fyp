import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../utils/helpers'

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
}

export default function Modal({ isOpen, onClose, title, description, children, size = 'md', className }) {
  const overlayRef = useRef()
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => onClose?.()}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, type: 'spring', damping: 25, stiffness: 400 }}
            className={cn(
              'relative w-full bg-white dark:bg-surface-900 rounded-3xl shadow-elevated',
              'border border-surface-200 dark:border-surface-800',
              'overflow-hidden',
              sizes[size],
              className
            )}
          >
            {/* Header */}
            {(title || onClose) && (
              <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100 dark:border-surface-800">
                <div>
                  {title && <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{title}</h2>}
                  {description && <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">{description}</p>}
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[80vh]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
