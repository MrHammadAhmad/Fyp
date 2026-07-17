import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, ArrowRight, Sparkles, Building2, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'
import showToast from '../../components/ui/Toast'
import { authApi } from '../../api/services/authApi'

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeSlide = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } },
}

const childFade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
}

// ─── TypeCard ─────────────────────────────────────────────────────────────────
function TypeCard({ icon: Icon, title, description, onClick }) {
  const [active, setActive] = useState(false)

  return (
    <motion.button
      variants={childFade}
      onClick={onClick}
      onPointerDown={() => setActive(true)}
      onPointerUp={() => setActive(false)}
      onPointerLeave={() => setActive(false)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      className={`
        group w-full text-left relative overflow-hidden
        rounded-2xl border px-6 py-5
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
        border-surface-200 dark:border-surface-800
        hover:border-brand-400 dark:hover:border-brand-500
        bg-white dark:bg-surface-900
        hover:bg-brand-50/40 dark:hover:bg-brand-950/30
        shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]
        dark:shadow-none dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]
      `}
    >
      {/* Subtle gradient accent on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
          bg-gradient-to-br from-brand-50/60 to-transparent dark:from-brand-950/40 dark:to-transparent"
      />

      <span className="relative flex items-center gap-4">
        {/* Icon bubble */}
        <span className="
          flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center
          bg-surface-100 dark:bg-surface-800
          group-hover:bg-brand-100 dark:group-hover:bg-brand-900/60
          transition-colors duration-200
        ">
          <Icon className="w-5 h-5 text-surface-500 dark:text-surface-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-200" />
        </span>

        {/* Text */}
        <span className="flex-1 min-w-0">
          <span className="block font-semibold text-[15px] leading-snug text-surface-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors duration-200">
            {title}
          </span>
          <span className="block text-sm text-surface-500 dark:text-surface-450 mt-0.5 leading-relaxed">
            {description}
          </span>
        </span>

        {/* Arrow */}
        <ArrowRight className="
          flex-shrink-0 w-4 h-4
          text-surface-300 dark:text-surface-600
          group-hover:text-brand-500 dark:group-hover:text-brand-400
          group-hover:translate-x-0.5
          transition-all duration-200
        " />
      </span>
    </motion.button>
  )
}

// ─── PasswordInput ────────────────────────────────────────────────────────────
function PasswordInput({ value, onChange }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        label="Password"
        type={show ? 'text' : 'password'}
        placeholder="Create a strong password"
        value={value}
        onChange={onChange}
        required
        className="pr-12"
      />
      <button
        type="button"
        aria-label={show ? 'Hide password' : 'Show password'}
        onClick={() => setShow(s => !s)}
        className="
          absolute right-3.5 bottom-0 h-[42px] flex items-center justify-center
          text-surface-400 hover:text-surface-700 dark:hover:text-surface-200
          transition-colors duration-150 rounded-md
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
        "
      >
        {show
          ? <EyeOff className="w-[18px] h-[18px]" />
          : <Eye className="w-[18px] h-[18px]" />
        }
      </button>
    </div>
  )
}

// ─── RegisterPage ─────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [step, setStep] = useState(searchParams.get('type') || 'choose')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    businessName: '',
  })

  const update = (field) => (e) => setFormData(d => ({ ...d, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      showToast.error('Please fill in all required fields')
      return
    }
    if (step === 'business' && !formData.businessName) {
      showToast.error('Please enter your business name')
      return
    }
    setIsSubmitting(true)

    try {
      // Register the user
      const response = await authApi.register({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: step === 'business' ? 'business_owner' : 'customer',
        businessName: formData.businessName,
      })
      
      showToast.success(response.message || 'Verification email sent. Please check your inbox.')
      navigate('/auth/login')
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Registration failed'
      showToast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (step !== 'choose') setStep('choose')
    else navigate('/auth/login')
  }

  return (
    <div className="min-h-[calc(100vh-64px)] mt-16 flex bg-white dark:bg-surface-950 font-sans antialiased">

      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div className="
        relative w-full lg:w-1/2
        flex flex-col
        px-6 py-10
        sm:px-12 sm:py-12
        md:px-16
        xl:px-24
      ">

        {/* Back button — top-left, correctly offset */}
        <div className="flex items-center mb-10">
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="
              -ml-2 flex items-center gap-1.5
              text-sm font-medium text-surface-500 dark:text-surface-400
              hover:text-surface-900 dark:hover:text-white
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-md px-2 py-1
            "
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Centered content container with max-width */}
        <div className="
          flex-1 flex flex-col justify-center
          w-full max-w-[400px] mx-auto
        ">
          <AnimatePresence mode="wait">

            {/* ── Step: Choose type ─────────────────────────────────────── */}
            {step === 'choose' && (
              <motion.div
                key="choose"
                variants={stagger}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8"
              >
                {/* Header */}
                <motion.div variants={childFade} className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <span className="text-xs font-semibold tracking-widest uppercase text-brand-600 dark:text-brand-400">
                      Beauty AI
                    </span>
                  </div>
                  <h1 className="text-[28px] sm:text-3xl font-bold text-surface-950 dark:text-white leading-tight tracking-tight">
                    Create your account
                  </h1>
                  <p className="text-[15px] text-surface-500 dark:text-surface-400 leading-relaxed">
                    Choose how you'd like to use Beauty AI.
                  </p>
                </motion.div>

                {/* Type cards */}
                <div className="space-y-3">
                  <TypeCard
                    icon={User}
                    title="Beauty AI for customers"
                    description="Book salons, spas, and top professionals near you."
                    onClick={() => setStep('customer')}
                  />
                  <TypeCard
                    icon={Building2}
                    title="Beauty AI for professionals"
                    description="Manage bookings and grow your beauty business."
                    onClick={() => setStep('business')}
                  />
                </div>

                {/* Sign-in link */}
                <motion.p variants={childFade} className="text-center text-sm text-surface-500 dark:text-surface-400">
                  Already have an account?{' '}
                  <Link
                    to="/auth/login"
                    className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </motion.p>
              </motion.div>
            )}

            {/* ── Step: Registration form ───────────────────────────────── */}
            {(step === 'customer' || step === 'business') && (
              <motion.div
                key="form"
                {...fadeSlide}
                className="space-y-7"
              >
                {/* Header */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <span className="text-xs font-semibold tracking-widest uppercase text-brand-600 dark:text-brand-400">
                      {step === 'business' ? 'Professionals' : 'Customers'}
                    </span>
                  </div>
                  <h1 className="text-[28px] sm:text-3xl font-bold text-surface-950 dark:text-white leading-tight tracking-tight">
                    {step === 'business' ? 'Set up your business' : 'Join Beauty AI'}
                  </h1>
                  <p className="text-[15px] text-surface-500 dark:text-surface-400 leading-relaxed">
                    {step === 'business'
                      ? 'Create your professional account to start taking bookings.'
                      : 'Create your account to discover and book beauty services.'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {step === 'business' && (
                    <Input
                      label="Business Name"
                      placeholder="e.g. Aura Hair & Styling"
                      value={formData.businessName}
                      onChange={update('businessName')}
                      required
                      autoFocus
                    />
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="First Name"
                      placeholder="Jane"
                      value={formData.firstName}
                      onChange={update('firstName')}
                      required
                      autoFocus={step === 'customer'}
                      autoComplete="given-name"
                    />
                    <Input
                      label="Last Name"
                      placeholder="Smith"
                      value={formData.lastName}
                      onChange={update('lastName')}
                      required
                      autoComplete="family-name"
                    />
                  </div>

                  <Input
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={update('email')}
                    required
                    autoComplete="email"
                  />

                  <PasswordInput
                    value={formData.password}
                    onChange={update('password')}
                  />

                  {/* CTA */}
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={isSubmitting}
                    className="
                      w-full mt-10
                      bg-surface-950 text-white
                      hover:bg-surface-800
                      dark:bg-white dark:text-surface-950
                      dark:hover:bg-surface-100
                      rounded-xl font-semibold text-[15px]
                      py-3.5 px-6
                      shadow-[0_1px_2px_rgba(0,0,0,0.12)]
                      hover:shadow-[0_4px_12px_rgba(0,0,0,0.18)]
                      dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]
                      active:scale-[0.985]
                      transition-all duration-150 ease-out
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
                    "
                  >
                    {isSubmitting ? 'Creating account…' : 'Create account'}
                  </Button>
                </form>

                {/* Switch type link */}
                <p className="text-center text-sm text-surface-500 dark:text-surface-400 pt-1">
                  {step === 'business' ? 'Signing up as a customer?' : 'Signing up as a professional?'}{' '}
                  <button
                    type="button"
                    onClick={() => setStep(step === 'business' ? 'customer' : 'business')}
                    className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors focus-visible:outline-none focus-visible:underline"
                  >
                    {step === 'business' ? 'Switch to customer' : 'Switch to professional'}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-surface-400 dark:text-surface-600 select-none">
          © {new Date().getFullYear()} Beauty Personalized AI · All rights reserved
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background image */}
        <img
          src="/images/PIC2.jpeg"
          alt="Luxury beauty studio interior"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
          decoding="async"
        />

        {/* Multi-layer gradient overlay for depth and readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />

        {/* Subtle vignette frame */}
        <div className="absolute inset-0"
          style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.25)' }}
        />

        {/* Bottom content */}
        <div className="relative mt-auto w-full p-12 xl:p-16">
          {/* Eyebrow tag */}
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-white/90 tracking-wide">
              Trusted by 10,000+ beauty professionals
            </span>
          </div>

          <h2 className="text-[34px] xl:text-[40px] font-bold text-white tracking-tight leading-[1.15] mb-4">
            The future of beauty<br />starts here.
          </h2>

          <p className="text-base text-white/65 leading-relaxed max-w-sm">
            Discover and book top-rated salons, spas, and independent artists — all powered by AI that knows your style.
          </p>

          {/* Social proof row */}
          <div className="mt-8 pt-8 border-t border-white/15 flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold text-white">50k+</p>
              <p className="text-xs text-white/50 mt-0.5">Bookings made</p>
            </div>
            <div className="w-px h-8 bg-white/15" />
            <div>
              <p className="text-2xl font-bold text-white">4.9★</p>
              <p className="text-xs text-white/50 mt-0.5">Average rating</p>
            </div>
            <div className="w-px h-8 bg-white/15" />
            <div>
              <p className="text-2xl font-bold text-white">200+</p>
              <p className="text-xs text-white/50 mt-0.5">Cities covered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}