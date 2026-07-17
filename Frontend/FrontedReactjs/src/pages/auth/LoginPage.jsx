// sample comment 
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'
import showToast from '../../components/ui/Toast'
import { authApi } from '../../api/services/authApi'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      showToast.error('Please enter your email and password')
      return
    }

    setIsSubmitting(true)

    try {
      // Call the real auth API
      const response = await authApi.login({
        email: formData.email,
        password: formData.password
      })

      // Pass the real user and token to the store
      login(response.user, response.token)
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed'
      showToast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] mt-16 flex overflow-hidden bg-white dark:bg-surface-950 font-sans">
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-20 relative">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 p-2 text-surface-900 dark:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-full transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="my-auto max-w-md w-full mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2 tracking-tight">
              Sign In
            </h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Welcome back! Please enter your details to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-brand-600 focus:ring-brand-500 bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700"
                />
                <span className="text-sm text-surface-600 dark:text-surface-400">Remember me</span>
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting}
              className="w-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-full font-semibold py-3.5"
            >
              Sign In
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-surface-600 dark:text-surface-400">
              Don't have an account?{' '}
              <Link
                to="/auth/register"
                className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-surface-400 mt-8">
          © {new Date().getFullYear()} Beauty Personalized AI. All rights reserved.
        </div>
      </div>

      {/* Right Column: Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="/images/PIC1.jpg"
          alt="Luxury salon interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="max-w-md space-y-4">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Manage your beauty appointments effortlessly.
            </h2>
            <p className="text-white/70 text-lg">
              Join millions of users booking with ease on Beauty Personalized AI.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
