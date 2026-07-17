import React from 'react'
import { motion } from 'framer-motion'
import { Clock, MapPin, Calendar, MoreVertical, CheckCircle, XCircle } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import { cn, formatDate, formatTime, formatDuration, formatPrice, getStatusColor, getStatusLabel } from '../../utils/helpers'

export default function AppointmentCard({
  appointment,
  variant = 'default', // 'default' | 'compact'
  onCancel,
  onReschedule,
  onViewDetails,
  className
}) {
  const {
    id, serviceName, businessName, businessImage, staffName, staffAvatar,
    date, time, duration, price, status
  } = appointment

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl border border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 hover:shadow-sm transition-shadow cursor-pointer',
          className
        )}
        onClick={() => onViewDetails?.(appointment)}
      >
        <Avatar src={staffAvatar || businessImage} alt={staffName || businessName} size="md" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-surface-900 dark:text-white truncate">{serviceName}</h4>
          <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
            {staffName && `${staffName} • `}{formatDate(date)} at {formatTime(time)}
          </p>
        </div>
        <Badge variant={getStatusColor(status)} size="sm">{getStatusLabel(status)}</Badge>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-5 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300',
        className
      )}
    >
      {/* Header with status */}
      <div className="flex items-center justify-between mb-4">
        <Badge variant={getStatusColor(status)} size="sm">{getStatusLabel(status)}</Badge>
        <span className="font-bold text-surface-900 dark:text-white text-sm">{formatPrice(price)}</span>
      </div>

      {/* Service info */}
      <h3 className="font-bold text-surface-900 dark:text-white text-base mb-1">{serviceName}</h3>
      
      {/* Business name */}
      <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-3">{businessName}</p>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
          <Calendar className="w-3.5 h-3.5 text-surface-400" />
          <span>{formatDate(date)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
          <Clock className="w-3.5 h-3.5 text-surface-400" />
          <span>{formatTime(time)} • {formatDuration(duration)}</span>
        </div>
      </div>

      {/* Staff */}
      {staffName && (
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-surface-50 dark:bg-surface-800/50">
          <Avatar src={staffAvatar} alt={staffName} size="sm" />
          <span className="text-xs font-medium text-surface-700 dark:text-surface-300">{staffName}</span>
        </div>
      )}

      {/* Actions */}
      {(status === 'confirmed' || status === 'upcoming' || status === 'pending') && (
        <div className="flex gap-2 pt-3 border-t border-surface-100 dark:border-surface-800">
          {onReschedule && (
            <button
              onClick={() => onReschedule(appointment)}
              className="flex-1 py-2 text-xs font-semibold rounded-xl border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
            >
              Reschedule
            </button>
          )}
          {onCancel && (
            <button
              onClick={() => onCancel(appointment)}
              className="flex-1 py-2 text-xs font-semibold rounded-xl text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}
