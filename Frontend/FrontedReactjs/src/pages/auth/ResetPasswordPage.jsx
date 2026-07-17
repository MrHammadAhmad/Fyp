import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import showToast from '../../components/ui/Toast'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  // Prevent access if no token was passed from OTP verification
  if (!location.state?.token) {
    navigate('/auth/login')
    return null
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (formData.password.length < 8) {
      showToast.error('Password must be at least 8 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      showToast.error('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      showToast.success('Password reset successfully')
      navigate('/auth/login')
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
        <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-6">
          <Lock className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Set new password</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mb-8">
          Your new password must be different from previous used passwords.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-[38px] text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-4">
            Reset Password
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
