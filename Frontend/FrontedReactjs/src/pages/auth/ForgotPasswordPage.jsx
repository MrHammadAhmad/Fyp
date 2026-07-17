import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { motion } from 'framer-motion'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import showToast from '../../components/ui/Toast'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) {
      showToast.error('Please enter your email')
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      showToast.success('Recovery code sent to your email')
      navigate('/auth/verify-otp', { state: { email } })
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
        <Link to="/auth/login" className="inline-flex items-center gap-2 text-sm font-semibold text-surface-500 hover:text-surface-900 dark:hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-6">
          <KeyRound className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Forgot password?</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mb-8">
          No worries, we'll send you reset instructions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            Reset password
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
