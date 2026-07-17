import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Brush,
  CalendarCheck,
  ChevronDown,
  Heart,
  Leaf,
  MapPin,
  MessageCircle,
  Quote,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserRoundCheck,
  UsersRound,
  WandSparkles,
} from 'lucide-react'

import BusinessCard from '../../components/cards/BusinessCard'
import businessesData from '../../data/businesses.json'
import { useCategoryStore } from '../../store/categoryStore'
import { businessApi } from '../../api/services/businessApi'

/* -------------------------------------------------------------------------- */
/* Small reusable components                                                   */
/* -------------------------------------------------------------------------- */

function useInView(threshold = 0.14) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
      },
      { threshold }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView]
}

function FadeSection({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView()

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 680ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 680ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

function SectionBadge({ children, icon: Icon = Sparkles, dark = false }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] ${
        dark
          ? 'border-white/10 bg-white/10 text-brand-100'
          : 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800/60 dark:bg-brand-950/40 dark:text-brand-300'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  )
}

function PremiumCard({ children, className = '', hover = true }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border border-surface-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.06)] dark:border-surface-800 dark:bg-surface-900 ${
        hover
          ? 'transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_24px_80px_rgba(124,58,237,0.14)]'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

function IconBox({ Icon, className = '' }) {
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-950/40 dark:text-brand-300 dark:ring-brand-900/50 ${className}`}
    >
      <Icon className="h-6 w-6" />
    </div>
  )
}

function SectionHeader({
  badge,
  title,
  subtitle,
  icon,
  align = 'center',
  dark = false,
  action,
}) {
  const isLeft = align === 'left'

  return (
    <div
      className={`mb-14 flex flex-col gap-6 ${
        isLeft ? 'items-start text-left' : 'mx-auto max-w-3xl items-center text-center'
      } md:flex-row md:items-end md:justify-between ${
        isLeft ? '' : 'md:flex-col md:items-center'
      }`}
    >
      <div className={isLeft ? 'max-w-3xl' : 'max-w-3xl'}>
        <SectionBadge icon={icon} dark={dark}>
          {badge}
        </SectionBadge>

        <h2
          className={`mt-5 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl ${
            dark ? 'text-white' : 'text-surface-950 dark:text-white'
          }`}
        >
          {title}
        </h2>

        {subtitle && (
          <p
            className={`mt-4 max-w-2xl text-sm leading-relaxed md:text-base ${
              dark ? 'text-surface-400' : 'text-surface-500 dark:text-surface-400'
            } ${isLeft ? '' : 'mx-auto'}`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {action}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Data                                                                        */
/* -------------------------------------------------------------------------- */

const serviceOptions = [
  { label: 'Haircut', Icon: Scissors },
  { label: 'Styling', Icon: WandSparkles },
  { label: 'Facial', Icon: Sparkles },
  { label: 'Skincare', Icon: Leaf },
  { label: 'Beard', Icon: UserRoundCheck },
  { label: 'Makeup', Icon: Brush },
]

const categoryDetails = {
  'cat-haircut': {
    title: 'Precision Haircuts',
    desc: 'Modern cuts, trims, and styling by trusted salon professionals.',
    Icon: Scissors,
    linkText: 'Explore Haircuts',
  },
  'cat-styling': {
    title: 'Hair Styling',
    desc: 'Blowouts, curls, color, and occasion-ready styling.',
    Icon: WandSparkles,
    linkText: 'Explore Styling',
  },
  'cat-facial': {
    title: 'Facial Treatments',
    desc: 'Cleansing, hydration, brightening, and glow treatments.',
    Icon: Sparkles,
    linkText: 'Explore Facials',
  },
  'cat-skincare': {
    title: 'Advanced Skincare',
    desc: 'Personalized skin treatments, peels, and routine support.',
    Icon: Leaf,
    linkText: 'Explore Skincare',
  },
  'cat-beard': {
    title: 'Beard Grooming',
    desc: 'Precise shaping, hot towel care, and premium grooming.',
    Icon: UserRoundCheck,
    linkText: 'Explore Beard',
  },
  'cat-makeup': {
    title: 'Professional Makeup',
    desc: 'Bridal, party, and everyday looks by experienced artists.',
    Icon: Brush,
    linkText: 'Explore Makeup',
  },
}

const aiFeatures = [
  {
    Icon: Scissors,
    title: 'Hairstyle Matching',
    desc: 'Get hairstyle ideas based on face shape, event type, and personal style.',
  },
  {
    Icon: Leaf,
    title: 'Skincare Routine',
    desc: 'Build a simple routine for hydration, glow, acne care, or sensitivity.',
  },
  {
    Icon: Brush,
    title: 'Makeup Suggestions',
    desc: 'Find makeup looks for outfits, lighting, skin tone, and occasions.',
  },
  {
    Icon: CalendarCheck,
    title: 'Smart Booking',
    desc: 'Turn recommendations into appointments with suitable salons nearby.',
  },
]

const howItWorks = [
  {
    number: '01',
    Icon: Search,
    title: 'Search',
    desc: 'Find beauty services by category, salon, treatment, or location.',
  },
  {
    number: '02',
    Icon: Bot,
    title: 'Personalize',
    desc: 'Use AI suggestions to choose what fits your face, skin, event, or style.',
  },
  {
    number: '03',
    Icon: CalendarCheck,
    title: 'Book',
    desc: 'Pick a trusted salon and move forward with confidence.',
  },
]

const partnerStats = [
  { Icon: TrendingUp, val: '3x', label: 'More Bookings' },
  { Icon: CalendarCheck, val: '40%', label: 'Less Admin Work' },
  { Icon: UsersRound, val: '12K+', label: 'Salon Partners' },
  { Icon: Star, val: '4.9', label: 'Average Rating' },
]

const testimonials = [
  {
    name: 'S. Derby',
    location: 'Melbourne, Australia',
    title: 'I can book anytime I want',
    text: 'Booking salon and beauty appointments is quick, simple, and available whenever I need it.',
    rating: 5,
    avatar: '/images/download (5).jpeg',
  },
  {
    name: 'C. M.',
    location: 'Gold Coast, Australia',
    title: 'Found my go-to salon',
    text: 'The platform made it easy to compare salons, check ratings, and book the right service.',
    rating: 5,
    avatar: '/images/download (6).jpeg',
  },
  {
    name: 'Ivory',
    location: 'Auckland, New Zealand',
    title: 'Clean and easy to use',
    text: 'I love how simple it is to browse services and find salons that match what I need.',
    rating: 5,
    avatar: '/images/download (7).jpeg',
  },
  {
    name: 'S.',
    location: 'Perth, Australia',
    title: 'Such a time-saver',
    text: 'I no longer need to call multiple places. I can search, compare, and book in minutes.',
    rating: 5,
    avatar: '/images/download (8).jpeg',
  },
]

const chatMessages = [
  {
    role: 'user',
    text: 'I need a fresh hairstyle for a wedding. What would suit me?',
  },
  {
    role: 'ai',
    text: 'A soft layered style or elegant updo would work beautifully. I can also suggest salons that specialize in event styling.',
  },
  {
    role: 'user',
    text: 'Can you suggest skincare before the event too?',
  },
  {
    role: 'ai',
    text: 'Yes. Focus on hydration, gentle exfoliation, and book a facial one week before the event for a healthy glow.',
  },
]

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  const navigate = useNavigate()
  const categories = useCategoryStore((state) => state.categories)

  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false)
  const [visibleMessages, setVisibleMessages] = useState(1)
  const [featuredBusinesses, setFeaturedBusinesses] = useState([])

  const serviceDropdownRef = useRef(null)
  const testimonialsRef = useRef(null)

  useEffect(() => {
    async function fetchSalons() {
      try {
        const response = await businessApi.getAll()
        // Default sort by rating or just take first 4
        const salons = response.data || []
        setFeaturedBusinesses(salons.slice(0, 4))
      } catch (error) {
        console.error('Failed to load featured salons', error)
        // Fallback
        setFeaturedBusinesses([...businessesData].sort((a, b) => b.rating - a.rating).slice(0, 4))
      }
    }
    fetchSalons()
  }, [])

  const filteredServiceOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return serviceOptions

    return serviceOptions.filter((option) =>
      option.label.toLowerCase().includes(query)
    )
  }, [searchQuery])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(event.target)
      ) {
        setServiceDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleMessages((current) =>
        current >= chatMessages.length ? 1 : current + 1
      )
    }, 2400)

    return () => clearInterval(interval)
  }, [])

  const handleSearch = (event) => {
    event.preventDefault()

    const queryParams = new URLSearchParams()

    if (searchQuery.trim()) queryParams.set('q', searchQuery.trim())
    if (location.trim()) queryParams.set('loc', location.trim())

    navigate(queryParams.toString() ? `/explore?${queryParams}` : '/explore')
  }

  const scrollTestimonials = (direction) => {
    if (!testimonialsRef.current) return

    testimonialsRef.current.scrollBy({
      left: direction === 'left' ? -360 : 360,
      behavior: 'smooth',
    })
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-surface-900 dark:bg-surface-950 dark:text-white">
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                               */}
      {/* ------------------------------------------------------------------ */}

      <section className="relative overflow-visible bg-white pt-28 pb-20 dark:bg-surface-950 lg:pt-32">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(250,245,255,0.95),rgba(255,255,255,1)_42%,rgba(253,242,248,0.86))] dark:bg-[linear-gradient(135deg,rgba(2,6,23,1),rgba(15,23,42,1)_48%,rgba(46,16,101,0.42))]" />
        <div className="absolute left-1/2 top-0 h-px w-[72rem] -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-300/60 to-transparent" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl dark:bg-brand-700/15" />
        <div className="absolute -left-40 bottom-10 h-96 w-96 rounded-full bg-pink-200/30 blur-3xl dark:bg-pink-700/15" />

        <div className="container relative z-10 mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:items-start">
            <div className="text-center lg:col-span-7 lg:text-left">
              <FadeSection>
                <h1 className="max-w-5xl text-4xl font-black leading-[1.08] tracking-[-0.035em] text-surface-950 dark:text-white md:text-6xl lg:text-7xl">
                  Find your perfect beauty services with expert guidance
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-surface-600 dark:text-surface-300 md:text-xl">
                  Browse trusted salons, compare services, and get personalized
                  recommendations for hair, skin, makeup, and grooming all in one
                  elegant experience.
                </p>

                <div className="relative z-[99999] mt-9 w-full max-w-4xl">
                  <div className="rounded-[2rem] border border-white bg-white/90 p-3 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-surface-800 dark:bg-surface-900/90">
                    <form
                      onSubmit={handleSearch}
                      className="grid grid-cols-1 gap-3 md:grid-cols-[1.05fr_0.95fr_auto]"
                    >
                      <div className="relative z-[9999]" ref={serviceDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setServiceDropdownOpen((open) => !open)}
                          className="flex w-full items-center gap-3 rounded-[1.35rem] bg-surface-50 px-4 py-4 text-left ring-1 ring-surface-100 transition hover:bg-white hover:ring-brand-200 dark:bg-surface-800 dark:ring-surface-700 dark:hover:bg-surface-800/80"
                        >
                          <Search className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" />

                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => {
                              setSearchQuery(event.target.value)
                              setServiceDropdownOpen(true)
                            }}
                            onFocus={() => setServiceDropdownOpen(true)}
                            placeholder="What service do you need?"
                            className="w-full bg-transparent text-sm font-semibold text-surface-950 outline-none placeholder:text-surface-400 dark:text-white"
                          />

                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-surface-400 transition-transform ${
                              serviceDropdownOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {serviceDropdownOpen && (
                          <div className="absolute left-0 top-full z-[99999] mt-3 max-h-[360px] w-full overflow-y-auto rounded-3xl border border-surface-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.16)] dark:border-surface-700 dark:bg-surface-900">
                            <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3 dark:border-surface-800">
                              <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-surface-400">
                                Popular services
                              </span>
                              <Sparkles className="h-4 w-4 text-brand-500" />
                            </div>

                            {filteredServiceOptions.length > 0 ? (
                              filteredServiceOptions.map(({ label, Icon }) => (
                                <button
                                  key={label}
                                  type="button"
                                  onClick={() => {
                                    setSearchQuery(label)
                                    setServiceDropdownOpen(false)
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-surface-700 transition hover:bg-brand-50 hover:text-brand-700 dark:text-surface-300 dark:hover:bg-surface-800 dark:hover:text-brand-300"
                                >
                                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
                                    <Icon className="h-4 w-4" />
                                  </span>
                                  {label}
                                </button>
                              ))
                            ) : (
                              <button
                                type="button"
                                onClick={() => setServiceDropdownOpen(false)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-brand-600 transition hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-surface-800"
                              >
                                <Search className="h-4 w-4" />
                                Search for “{searchQuery}”
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 rounded-[1.35rem] bg-surface-50 px-4 py-4 ring-1 ring-surface-100 transition hover:bg-white hover:ring-brand-200 dark:bg-surface-800 dark:ring-surface-700 dark:hover:bg-surface-800/80">
                        <MapPin className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" />
                        <input
                          type="text"
                          value={location}
                          onChange={(event) => setLocation(event.target.value)}
                          placeholder="City or area"
                          className="w-full bg-transparent text-sm font-semibold text-surface-950 outline-none placeholder:text-surface-400 dark:text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        className="rounded-[1.35rem] bg-[#405742] px-8 py-4 text-sm font-extrabold text-white shadow-lg shadow-[#405742]/25 transition hover:-translate-y-0.5 hover:bg-[#334d3b] active:scale-[0.98]"
                      >
                        Search
                      </button>
                    </form>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-semibold text-surface-500 dark:text-surface-400 lg:justify-start">
                    {['Haircut', 'Facial', 'Skincare', 'Makeup'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSearchQuery(item)}
                        className="rounded-full border border-surface-200 bg-white/80 px-3 py-1.5 transition hover:border-brand-300 hover:text-brand-700 dark:border-surface-800 dark:bg-surface-900 dark:hover:text-brand-300"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative z-20 mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
                  <Link
                    to="/explore"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#405742] px-6 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#334d3b]"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </FadeSection>
            </div>

            <div className="hidden lg:col-span-5 lg:block">
              <FadeSection delay={0.12}>
                <div className="relative">
                  <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-brand-500/20 via-pink-500/10 to-transparent blur-2xl" />

                  <div className="relative overflow-hidden rounded-[2.25rem] border border-white bg-white p-3 shadow-[0_35px_100px_rgba(15,23,42,0.18)] dark:border-surface-800 dark:bg-surface-900">
                    <img
                      src="https://i.pinimg.com/736x/97/fc/de/97fcde8f6e5a84371549ac5ccc280aac.jpg"
                      alt="Premium salon interior"
                      className="aspect-[4/5] w-full rounded-[1.65rem] object-cover"
                    />
                  </div>
                </div>
              </FadeSection>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Categories                                                         */}
      {/* ------------------------------------------------------------------ */}

      <section className="relative z-0 bg-white py-24 dark:bg-surface-950">
        <div className="container mx-auto max-w-7xl px-6">
          <FadeSection>
            <SectionHeader
              badge="Categories"
              icon={Sparkles}
              title="Explore services by your beauty goal"
              subtitle="A cleaner category experience helps users move faster from browsing to booking."
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category, index) => {
                const info =
                  categoryDetails[category.id] || {
                    title: category.name,
                    desc: 'Premium beauty and wellness service by trusted experts.',
                    Icon: Sparkles,
                    linkText: `Explore ${category.name}`,
                  }

                const Icon = info.Icon

                return (
                  <FadeSection key={category.id} delay={index * 0.035}>
                    <Link to={`/explore?category=${category.id}`} className="group block h-full">
                      <PremiumCard className="h-full p-6">
                        <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[4rem] bg-brand-50/70 dark:bg-brand-950/20" />

                        <div className="relative">
                          <div className="flex items-start justify-between gap-4">
                            <IconBox Icon={Icon} />
                            <span className="rounded-full bg-surface-50 px-3 py-1 text-[11px] font-extrabold text-surface-400 dark:bg-surface-800 dark:text-surface-500">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>

                          <h3 className="mt-6 text-xl font-extrabold text-surface-950 transition group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">
                            {info.title}
                          </h3>

                          <p className="mt-3 min-h-[50px] text-sm leading-relaxed text-surface-500 dark:text-surface-400">
                            {info.desc}
                          </p>

                          <div className="mt-7 flex items-center gap-2 text-sm font-extrabold text-brand-600 dark:text-brand-300">
                            {info.linkText}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </PremiumCard>
                    </Link>
                  </FadeSection>
                )
              })}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Featured Salons                                                    */}
      {/* ------------------------------------------------------------------ */}

      <section className="relative z-0 bg-surface-50 py-24 dark:bg-surface-900/40">
        <div className="container mx-auto max-w-7xl px-6">
          <FadeSection>
            <SectionHeader
              align="left"
              badge="Top Picks"
              icon={Star}
              title="Featured salons users can trust"
              subtitle="Show your strongest salon cards early so users can immediately understand quality and availability."
              action={
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 rounded-2xl border border-surface-200 bg-white px-5 py-3 text-sm font-extrabold text-surface-950 shadow-sm transition hover:border-brand-300 hover:text-brand-700 dark:border-surface-800 dark:bg-surface-900 dark:text-white dark:hover:text-brand-300"
                >
                  View All Salons
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredBusinesses.map((business, index) => (
                <FadeSection key={business.id} delay={index * 0.05}>
                  <BusinessCard business={business} />
                </FadeSection>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* AI Assistant                                                       */}
      {/* ------------------------------------------------------------------ */}

      <section className="relative z-0 overflow-hidden bg-surface-950 py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.18),transparent_34%)]" />
        <div className="absolute left-1/2 top-0 h-px w-[80rem] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="container relative z-10 mx-auto max-w-7xl px-6">
          <FadeSection>
            <SectionHeader
              badge="AI Beauty Advisor"
              icon={Bot}
              dark
              title="Personalized guidance before the user books"
              subtitle="The AI section builds confidence by helping users understand what service, style, or routine may fit them best."
            />

            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2.5rem] bg-brand-500/20 blur-2xl" />

                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-[0_35px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                  <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.06] px-6 py-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-700">
                      <Bot className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        Beauty AI Assistant
                      </h3>
                      <p className="flex items-center gap-2 text-xs font-semibold text-brand-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Online — Gemini powered
                      </p>
                    </div>
                  </div>

                  <div className="flex min-h-[340px] flex-col gap-4 p-6">
                    {chatMessages.slice(0, visibleMessages).map((message, index) => (
                      <div
                        key={`${message.role}-${index}`}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                            message.role === 'user'
                              ? 'rounded-tr-md bg-brand-600 text-white'
                              : 'rounded-tl-md border border-white/10 bg-white/10 text-surface-100'
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    ))}

                    {visibleMessages < chatMessages.length && (
                      <div className="flex justify-start">
                        <div className="flex gap-1.5 rounded-2xl rounded-tl-md border border-white/10 bg-white/10 px-4 py-3">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-brand-300" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-brand-300 [animation-delay:0.15s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-brand-300 [animation-delay:0.3s]" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 border-t border-white/10 bg-white/[0.05] p-4">
                    <input
                      type="text"
                      disabled
                      placeholder="Ask about styling, skincare, or salons..."
                      className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs text-white outline-none placeholder:text-surface-500"
                    />
                    <button
                      type="button"
                      disabled
                      className="rounded-2xl bg-white px-5 text-sm font-extrabold text-surface-950"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {aiFeatures.map((feature, index) => (
                  <FadeSection key={feature.title} delay={index * 0.05}>
                    <div className="group flex gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 transition hover:-translate-y-1 hover:bg-white/[0.08]">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-brand-200 ring-1 ring-white/10 transition group-hover:bg-white group-hover:text-brand-700">
                        <feature.Icon className="h-6 w-6" />
                      </div>

                      <div>
                        <h3 className="font-extrabold text-white">{feature.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-surface-400">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </FadeSection>
                ))}

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/ai-assistant"
                    className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-sm font-extrabold text-surface-950 transition hover:-translate-y-0.5 hover:bg-brand-100"
                  >
                    <Bot className="h-5 w-5 text-brand-700" />
                    Open AI Advisor
                  </Link>

                  <Link
                    to="/analysis/hair"
                    className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-7 py-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
                  >
                    <Scissors className="h-5 w-5" />
                    Try Analysis
                  </Link>
                </div>

                <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold text-surface-400">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Instant responses
                  </span>
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Private guidance
                  </span>
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Personalized suggestions
                  </span>
                </div>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* How It Works                                                       */}
      {/* ------------------------------------------------------------------ */}

      <section className="relative z-0 bg-white py-24 dark:bg-surface-950">
        <div className="container mx-auto max-w-6xl px-6">
          <FadeSection>
            <SectionHeader
              badge="Simple Process"
              icon={CalendarCheck}
              title="From search to booking in three clear steps"
              subtitle="A professional landing page should make the user journey obvious without forcing them to think."
            />

            <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="absolute left-[16%] right-[16%] top-12 hidden h-px bg-gradient-to-r from-transparent via-surface-300 to-transparent md:block dark:via-surface-700" />

              {howItWorks.map((step, index) => (
                <FadeSection key={step.number} delay={index * 0.06}>
                  <div className="relative h-full rounded-[1.75rem] border border-surface-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.05)] dark:border-surface-800 dark:bg-surface-900">
                    <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-800/60 dark:bg-brand-950/40 dark:text-brand-300">
                      <step.Icon className="h-8 w-8" />
                      <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-surface-950 text-[10px] font-extrabold text-white dark:bg-white dark:text-surface-950">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="mt-6 text-lg font-extrabold text-surface-950 dark:text-white">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
                      {step.desc}
                    </p>
                  </div>
                </FadeSection>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Testimonials                                                       */}
      {/* ------------------------------------------------------------------ */}

      <section className="relative z-0 overflow-x-hidden bg-black py-24 text-white">
  {/* Background Glow Effects */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(64,87,66,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(79,125,86,0.14),transparent_30%)]" />

  <div className="container relative z-10 mx-auto max-w-7xl px-6">
    <FadeSection>
      <SectionHeader
        align="left"
        badge="Customer Love"
        icon={Heart}
        dark
        title="A booking experience users remember"
        subtitle="Testimonials add social proof and make the landing page feel active and trustworthy."
        action={
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollTestimonials('left')}
              aria-label="Scroll testimonials left"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-surface-700 bg-surface-800 text-white shadow-sm transition hover:border-brand-400 hover:text-brand-400"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => scrollTestimonials('right')}
              aria-label="Scroll testimonials right"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-surface-700 bg-surface-800 text-white shadow-sm transition hover:border-brand-400 hover:text-brand-400"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        }
      />

      <div
        ref={testimonialsRef}
        className="flex snap-x gap-6 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((testimonial) => (
          <div
            key={`${testimonial.name}-${testimonial.title}`}
            className="min-w-[300px] snap-start pt-3 md:min-w-[360px]"
          >
            <div className="rounded-[1.75rem] border border-surface-700 bg-surface-900 p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-400">
            <Quote className="mb-5 h-8 w-8 text-brand-400" />

            <div className="mb-5 flex text-amber-400">
              {Array.from({ length: testimonial.rating }).map((_, index) => (
                <Star key={index} className="h-5 w-5 fill-current" />
              ))}
            </div>

            <h3 className="text-lg font-extrabold text-white">
              {testimonial.title}
            </h3>

            <p className="mt-3 min-h-[92px] text-sm leading-relaxed text-surface-300">
              {testimonial.text}
            </p>

            <div className="mt-8 flex items-center gap-4 border-t border-surface-700 pt-5">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="h-12 w-12 rounded-full object-cover"
              />

              <div>
                <h4 className="text-sm font-extrabold text-white">
                  {testimonial.name}
                </h4>

                <p className="text-xs font-medium text-surface-400">
                  {testimonial.location}
                </p>
              </div>
            </div>
            </div>
          </div>
        ))}
      </div>
    </FadeSection>
  </div>
</section>
      {/* ------------------------------------------------------------------ */}
      {/* Partner CTA                                                        */}
      {/* ------------------------------------------------------------------ */}

      <section className="relative z-0 overflow-hidden bg-white py-24 dark:bg-surface-950">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.08),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(64,87,66,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(79,125,86,0.08),transparent_30%)]" />
  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-surface-300 to-transparent dark:via-surface-800" />

  <div className="container relative z-10 mx-auto max-w-7xl px-6">
    <FadeSection>
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionBadge icon={TrendingUp}>
            For Salon Owners
          </SectionBadge>

          <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-surface-950 dark:text-white md:text-5xl">
            Grow your salon with a smarter booking presence.
          </h2>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-surface-600 dark:text-surface-400">
            Help customers discover your services, understand your expertise,
            and book faster with a polished AI-powered marketplace experience.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/auth/register?type=business"
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-surface-950 px-8 py-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-brand-700 dark:bg-white dark:text-surface-950 dark:hover:bg-brand-100"
            >
              List Your Salon Free
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-surface-200 bg-white px-8 py-4 text-sm font-extrabold text-surface-950 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 dark:border-surface-700 dark:bg-surface-900 dark:text-white dark:hover:border-brand-500 dark:hover:text-brand-300"
            >
              View Marketplace
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {partnerStats.map((stat, index) => (
            <FadeSection key={stat.label} delay={index * 0.05}>
              <div className="rounded-[1.75rem] border border-surface-200 bg-white p-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_24px_80px_rgba(124,58,237,0.12)] dark:border-surface-800 dark:bg-surface-900 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] dark:hover:border-brand-500 dark:hover:shadow-[0_24px_80px_rgba(64,87,66,0.15)]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-950/40 dark:text-brand-300 dark:ring-brand-900/50">
                  <stat.Icon className="h-6 w-6" />
                </div>

                <div className="mt-4 text-3xl font-extrabold text-surface-950 dark:text-white">
                  {stat.val}
                </div>

                <p className="mt-2 text-xs font-semibold text-surface-500 dark:text-surface-400">
                  {stat.label}
                </p>
              </div>
            </FadeSection>
          ))}
        </div>
      </div>
    </FadeSection>
  </div>
</section>
    </main>
  )
}