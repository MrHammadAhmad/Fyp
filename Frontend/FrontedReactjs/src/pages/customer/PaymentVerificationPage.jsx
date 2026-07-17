import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Clock, ArrowRight, FileText } from 'lucide-react'
import Button from '../../components/ui/Button'

export default function PaymentVerificationPage() {
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status') || 'pending' // verified, pending, failed
  const navigate = useNavigate()
  const [dots, setDots] = useState('.')

  useEffect(() => {
    if (status === 'pending') {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '.' : prev + '.')
      }, 500)
      return () => clearInterval(interval)
    }
  }, [status])

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-surface-900 rounded-3xl p-8 shadow-card text-center border border-surface-200 dark:border-surface-800">
        
        {status === 'verified' && (
          <div className="space-y-6">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={50} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Payment Verified!</h1>
              <p className="text-surface-600 dark:text-surface-400">
                Your transaction has been processed successfully. Your booking is now confirmed.
              </p>
            </div>
            <div className="bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Transaction ID</span>
                <span className="font-medium text-surface-900 dark:text-white">TRX-10294</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Amount Paid</span>
                <span className="font-bold text-brand-600 dark:text-brand-400">$65.00</span>
              </div>
            </div>
            <div className="pt-4 flex flex-col gap-3">
              <Button variant="primary" onClick={() => navigate('/dashboard/bookings')} rightIcon={<ArrowRight size={18} />}>
                View My Bookings
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard/payment-history')} leftIcon={<FileText size={18} />}>
                View Receipt
              </Button>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="space-y-6">
            <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto relative">
              <Clock size={50} className="text-yellow-600 dark:text-yellow-400 animate-pulse" />
              <div className="absolute inset-0 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Processing Payment</h1>
              <p className="text-surface-600 dark:text-surface-400">
                Please wait while we verify your transaction with the provider{dots}
              </p>
            </div>
            <p className="text-xs text-surface-500 mt-4">Please do not close this window or click back.</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-6">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <XCircle size={50} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Payment Failed</h1>
              <p className="text-surface-600 dark:text-surface-400">
                We couldn't process your payment. Please check your payment details or try a different method.
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                Try Again
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}
