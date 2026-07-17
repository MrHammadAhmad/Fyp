import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import showToast from '../../components/ui/Toast'

export default function OTPVerificationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || 'your email'
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRefs = useRef([])

  // Focus first input on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(value.length - 1)
    }
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Move to next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) {
      showToast.error('Please enter the 6-digit code')
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      showToast.success('Code verified successfully')
      navigate('/auth/reset-password', { state: { token: 'mock_token', email } })
    }, 1500)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] mt-16 flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4 relative overflow-hidden py-12">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-500/10 dark:bg-accent-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 -z-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-surface-100 dark:border-surface-800 p-8 sm:p-10"
      >
        <Link to="/auth/forgot-password" className="inline-flex items-center gap-2 text-sm font-semibold text-surface-500 hover:text-surface-900 dark:hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-6">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Check your email</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mb-8">
          We've sent a 6-digit verification code to <span className="font-bold text-surface-900 dark:text-white">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-surface-900 dark:text-white"
              />
            ))}
          </div>

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            Verify Code
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Didn't receive the email?{' '}
            <button className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
              Click to resend
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
