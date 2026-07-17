import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Calendar, Clock, MapPin, User, Scissors, CreditCard } from 'lucide-react'
import { cn, formatPrice, formatDate, formatTime, formatDuration } from '../../utils/helpers'

export default function BookingConfirmation({ bookingData, business, service, staff, onConfirm, onEdit, isSubmitting }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-brand-600 dark:text-brand-400" />
        </div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Review & Confirm</h2>
        <p className="text-surface-500 dark:text-surface-400">Please review your booking details before confirming.</p>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
        <div className="flex items-start justify-between border-b border-surface-100 dark:border-surface-800 pb-4 mb-4">
          <div>
            <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-1">{business?.name || 'Business Name'}</h3>
            <p className="text-sm text-surface-500 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {business?.address || 'Business Address'}
            </p>
          </div>
          <button onClick={() => onEdit(1)} className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">Edit</button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-surface-900 dark:text-white">{service?.name || 'Service Name'}</p>
                <p className="text-xs text-surface-500">{formatDuration(service?.duration || 60)}</p>
              </div>
            </div>
            <p className="font-bold text-surface-900 dark:text-white">{formatPrice(service?.price || 0)}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-surface-500 mb-0.5">With</p>
              <p className="font-semibold text-surface-900 dark:text-white">{staff?.name || 'Any Available'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-surface-500 mb-0.5">Date & Time</p>
              <p className="font-semibold text-surface-900 dark:text-white">
                {bookingData?.date ? formatDate(bookingData.date) : 'Date'}, {bookingData?.timeSlot ? formatTime(bookingData.timeSlot) : 'Time'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-surface-100 dark:border-surface-800">
          <div className="flex items-center justify-between font-bold text-lg">
            <span className="text-surface-900 dark:text-white">Total</span>
            <span className="text-brand-600 dark:text-brand-400">{formatPrice(service?.price || 0)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={() => onEdit(1)}
          className="px-6 py-3 rounded-xl border border-surface-200 dark:border-surface-700 font-semibold text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1 bg-brand-600 text-white rounded-xl font-bold py-3 hover:bg-brand-700 transition-colors shadow-brand hover:shadow-brand-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isSubmitting && <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />}
          Confirm Booking
        </button>
      </div>
    </div>
  )
}
