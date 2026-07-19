import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Bot,
  Building2,
  Calendar,
  CalendarCheck,
  ChevronRight,
  Clock3,
  FlaskConical,
  Heart,
  Microscope,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
  WandSparkles,
  Loader2,
} from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import AppointmentCard from '../../components/cards/AppointmentCard'
import BusinessCard from '../../components/cards/BusinessCard'
import StatWidget from '../../components/widgets/StatWidget'
import { bookingApi } from '../../api/services/bookingApi'
import { favoritesApi } from '../../api/services/favoritesApi'
import { paymentApi } from '../../api/services/paymentApi'

const quickActionClassName =
  'border border-transparent bg-[#405742] text-white hover:bg-[#334d3b]'

const brandGreenClassName = 'bg-[#405742] text-white shadow-lg shadow-[#405742]/25'
const brandGreenTextClassName = 'text-[#405742] dark:text-[#5a7a62]'
const brandGreenBorderClassName = 'border-[#405742]/20 dark:border-[#405742]/30'
const brandGreenBgLightClassName = 'bg-[#405742]/10 dark:bg-[#405742]/15'
const brandGreenButtonClassName =
  'rounded-2xl bg-[#405742] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#405742]/25 transition hover:bg-[#334d3b] active:scale-[0.98]'
const brandGreenLinkClassName =
  'inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-extrabold text-[#405742] hover:underline dark:text-[#5a7a62]'
const brandGreenBadgeClassName =
  'inline-flex items-center gap-2 rounded-full border border-[#405742]/20 dark:border-[#405742]/30 bg-[#405742]/10 dark:bg-[#405742]/15 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#405742] dark:text-[#5a7a62]'

const quickActions = [
  {
    label: 'Book Service',
    desc: 'Find salons near you',
    to: '/explore',
    Icon: Search,
  },
  {
    label: 'AI Advisor',
    desc: 'Get beauty guidance',
    to: '/ai-assistant',
    Icon: Bot,
  },
  {
    label: 'My Bookings',
    desc: 'Manage appointments',
    to: '/dashboard/bookings',
    Icon: CalendarCheck,
  },
]

const aiTools = [
  {
    label: 'AI Assistant',
    desc: 'Chat with your personal beauty stylist.',
    to: '/ai-assistant',
    Icon: Bot,
    badge: 'Popular',
  },
  {
    label: 'Hair Analysis',
    desc: 'Understand your hair condition and care needs.',
    to: '/analysis/hair',
    Icon: Microscope,
    badge: 'Smart Scan',
  },
  {
    label: 'Skin Analysis',
    desc: 'Get skincare guidance based on your concerns.',
    to: '/analysis/skin',
    Icon: FlaskConical,
    badge: 'Glow Plan',
  },
  {
    label: 'Salon Recs',
    desc: 'Find salons that match your service preferences.',
    to: '/recommendations/salons',
    Icon: Building2,
    badge: 'AI Match',
  },
]

const careTips = [
  'Book your facial 5–7 days before a special event.',
  'Save favorite salons to compare prices and ratings faster.',
  'Use AI Advisor before booking if you are unsure about a service.',
]

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-lg font-extrabold text-surface-950 dark:text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

function EmptyAppointments() {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-surface-300 bg-white p-8 text-center shadow-sm dark:border-surface-700 dark:bg-surface-900">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
        <Calendar className="h-8 w-8" />
      </div>

      <h3 className="text-base font-extrabold text-surface-950 dark:text-white">
        No upcoming appointments
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-surface-500 dark:text-surface-400">
        Time for a little self-care? Explore trusted salons and book your next
        appointment in a few clicks.
      </p>

      <Link
        to="/explore"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#405742] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-[#334d3b] active:scale-[0.98]"
      >
        Explore Services
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function AiToolCard({ tool }) {
  const { label, desc, to, Icon, badge } = tool

  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-[1.75rem] border border-surface-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#405742]/30 hover:shadow-xl hover:shadow-[#405742]/10 dark:border-surface-800 dark:bg-surface-900`}
    >
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-[4rem] ${brandGreenBgLightClassName} transition group-hover:bg-[#405742]/15 dark:group-hover:bg-[#405742]/25`} />

      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${brandGreenClassName} transition group-hover:scale-105`}>
            <Icon className="h-6 w-6" />
          </div>

          <span className="rounded-full bg-surface-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-surface-500 dark:bg-surface-800 dark:text-surface-400">
            {badge}
          </span>
        </div>

        <h3 className="text-sm font-extrabold text-surface-950 dark:text-white">
          {label}
        </h3>

        <p className="mt-2 min-h-[40px] text-xs leading-relaxed text-surface-500 dark:text-surface-400">
          {desc}
        </p>

        <div className={`mt-5 flex items-center gap-2 text-xs font-extrabold ${brandGreenTextClassName}`}>
          Open tool
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}

function TipCard() {
  return (
    <div className={`rounded-[1.75rem] border ${brandGreenBorderClassName} bg-gradient-to-br from-[#405742]/8 via-white to-[#405742]/5 p-6 shadow-sm dark:from-[#405742]/15 dark:via-surface-900 dark:to-surface-900`}>
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${brandGreenClassName}`}>
          <Sparkles className="h-5 w-5" />
        </div>

        <div>
          <h3 className="font-extrabold text-surface-950 dark:text-white">
            Smart beauty tips
          </h3>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400">
            Helpful reminders for better decisions
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {careTips.map((tip) => (
          <div key={tip} className="flex gap-3">
            <ShieldCheck className={`mt-0.5 h-4 w-4 shrink-0 ${brandGreenTextClassName}`} />
            <p className="text-sm leading-relaxed text-surface-600 dark:text-surface-300">
              {tip}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [favorites, setFavorites] = useState([])
  const [wallet, setWallet] = useState({ balance: 0, loyaltyPoints: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const [bookingsData, favoritesData, walletData] = await Promise.all([
          bookingApi.getMyBookings(),
          favoritesApi.getFavorites(),
          paymentApi.getWalletBalance()
        ])
        setBookings(bookingsData)
        setFavorites(favoritesData)
        setWallet(walletData)
      } catch (error) {
        console.error("Failed to load dashboard data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter((booking) => ['upcoming', 'confirmed', 'pending'].includes(booking.status))
      .slice(0, 2)
  }, [bookings])

  const favoriteBusinesses = useMemo(() => {
    return favorites.slice(0, 3)
  }, [favorites])

  const firstName = user?.name?.split(' ')[0] || 'Guest'

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin text-[#405742] w-10 h-10" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50/70 dark:bg-surface-950">
      <div className="space-y-6 py-2 sm:space-y-8">
        {/* Hero Welcome */}
        <section className="relative overflow-hidden rounded-[2rem] border border-surface-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)] dark:border-surface-800 dark:bg-surface-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.12),transparent_30%)]" />

          <div className="relative grid grid-cols-1 gap-6 p-6 md:grid-cols-[1.35fr_0.65fr] md:p-8">
            <div>
              <div className={`mb-4 ${brandGreenBadgeClassName}`}>
                <Sparkles className="h-3.5 w-3.5" />
                Customer Dashboard
              </div>

              <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-surface-950 dark:text-white md:text-5xl">
                Welcome back, {firstName}. Ready for your next glow-up?
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-surface-600 dark:text-surface-300 md:text-base">
                Manage appointments, revisit favorite salons, and use AI tools to
                make confident beauty decisions faster.
              </p>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3">
                {quickActions.map(({ label, desc, to, Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`group flex min-h-[56px] flex-1 flex-col justify-center gap-1 rounded-2xl px-4 py-2.5 shadow-sm transition-all hover:-translate-y-0.5 ${quickActionClassName}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-extrabold leading-tight whitespace-nowrap">
                        {label}
                      </p>
                      <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                    </div>
                    <p className="truncate text-xs leading-tight opacity-75 whitespace-nowrap">
                      {desc}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/60 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-surface-800 dark:bg-surface-950/50">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-surface-400">
                    Today
                  </p>
                  <h3 className="mt-1 font-extrabold text-surface-950 dark:text-white">
                    Beauty summary
                  </h3>
                </div>

                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${brandGreenClassName}`}>
                  <WandSparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-surface-50 p-4 dark:bg-surface-900">
                  <div className="flex items-center gap-3">
                    <CalendarCheck className={`h-5 w-5 ${brandGreenTextClassName}`} />
                    <span className="text-sm font-semibold text-surface-600 dark:text-surface-300">
                      Upcoming
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-surface-950 dark:text-white">
                    {upcomingBookings.length}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-surface-50 p-4 dark:bg-surface-900">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-rose-500" />
                    <span className="text-sm font-semibold text-surface-600 dark:text-surface-300">
                      Favorites
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-surface-950 dark:text-white">
                    {favorites.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatWidget title="Upcoming Bookings" value={bookings.filter(b => ['upcoming', 'confirmed', 'pending'].includes(b.status)).length.toString()} icon={Calendar} color="brand" />
          <StatWidget title="Favorite Places" value={favorites.length.toString()} icon={Heart} color="accent" />
          <StatWidget title="Wallet Balance" value={`$${wallet.balance.toFixed(2)}`} icon={Wallet} color="amber" />
          <StatWidget title="Loyalty Points" value={wallet.loyaltyPoints.toLocaleString()} icon={Bell} color="blue" />
        </section>

        {/* Main Content */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-[1.75rem] border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-800 dark:bg-surface-900">
              <SectionHeader
                title="Upcoming appointments"
                subtitle="Your nearest confirmed and upcoming bookings."
                action={
                  <Link
                    to="/dashboard/bookings"
                    className={brandGreenLinkClassName}
                  >
                    View all
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                }
              />

              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <AppointmentCard key={booking.id} appointment={booking} />
                  ))}
                </div>
              ) : (
                <EmptyAppointments />
              )}
            </div>

            <div className="rounded-[1.75rem] border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-800 dark:bg-surface-900">
              <SectionHeader
                title="AI beauty tools"
                subtitle="Use AI to reduce confusion before selecting a service."
                action={
                  <Link
                    to="/ai-assistant"
                    className={brandGreenLinkClassName}
                  >
                    Open AI Chat
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                }
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {aiTools.map((tool) => (
                  <AiToolCard key={tool.to} tool={tool} />
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[1.75rem] border border-surface-200 bg-white p-6 shadow-sm dark:border-surface-800 dark:bg-surface-900">
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${brandGreenClassName}`}>
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-extrabold text-surface-950 dark:text-white">
                    Need a quick booking?
                  </h3>
                  <p className="text-xs font-medium text-surface-500 dark:text-surface-400">
                    Start with location and service search.
                  </p>
                </div>
              </div>

              <Link
                to="/dashboard/nearby"
                className={`inline-flex w-full items-center justify-center gap-2 ${brandGreenButtonClassName}`}
              >
                Find Nearby Salons
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-[1.75rem] border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-800 dark:bg-surface-900">
              <SectionHeader
                title="Your favorites"
                subtitle="Saved salons for quick access."
                action={
                  <Link
                    to="/dashboard/favorites"
                    className={brandGreenLinkClassName}
                  >
                    View all
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                }
              />

              <div className="space-y-4">
                {favoriteBusinesses.length > 0 ? (
                  favoriteBusinesses.map((business) => (
                    <BusinessCard key={business.id} business={business} variant="list" />
                  ))
                ) : (
                  <p className="text-sm text-surface-500 py-4 text-center">No favorites saved yet.</p>
                )}
              </div>
            </div>

            <TipCard />
          </aside>
        </section>
      </div>
    </div>
  )
}