import React, { useState, useEffect } from 'react'
import { Store, Globe, Clock, Shield, Save, Loader2 } from 'lucide-react'
import Input, { Textarea } from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Switch from '../../components/ui/Switch'
import showToast from '../../components/ui/Toast'
import { businessApi } from '../../api/services/businessApi'

const TABS = [
  { id: 'general', label: 'General Info', icon: Store },
  { id: 'booking', label: 'Online Booking', icon: Globe },
  { id: 'hours', label: 'Opening Hours', icon: Clock },
  { id: 'cancellation', label: 'Cancellation Policy', icon: Shield },
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const DEFAULT_HOURS = DAYS.map(day => ({
  day,
  open: day === 'Sunday' ? '' : '09:00',
  close: day === 'Sunday' ? '' : '18:00',
  closed: day === 'Sunday'
}))

export default function BusinessSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [salonId, setSalonId] = useState(null)

  // General Info state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [town, setTown] = useState('')
  const [shopNo, setShopNo] = useState('')
  const [zipCode, setZipCode] = useState('')

  // Booking Preferences
  const [bookingOnline, setBookingOnline] = useState(true)
  const [allowWalkin, setAllowWalkin] = useState(true)

  // Opening Hours
  const [hours, setHours] = useState(DEFAULT_HOURS)

  // Cancellation Policy
  const [cancellationHours, setCancellationHours] = useState('24')
  const [cancellationFee, setCancellationFee] = useState('0')
  const [allowNoshowRebooking, setAllowNoshowRebooking] = useState(true)

  // Load salon data on mount
  useEffect(() => {
    async function fetchSalon() {
      try {
        setLoading(true)
        const salon = await businessApi.getMySalon()
        if (!salon?.id) {
          showToast.error('No salon found. Please create your salon first.')
          setLoading(false)
          return
        }
        setSalonId(salon.id)

        // Populate form fields from database
        setName(salon.name || '')
        setDescription(salon.description || '')
        setPhone(salon.contact_info || '')
        setEmail(salon.email || '')
        setStreetAddress(salon.street_address || salon.address || '')
        setCity(salon.city || '')
        setCountry(salon.country || '')
        setTown(salon.town || '')
        setShopNo(salon.shop_no || '')
        setZipCode(salon.zip_code || '')

        // Booking preferences from database
        if (salon.enable_online_booking !== undefined) setBookingOnline(salon.enable_online_booking)
        if (salon.allow_walkin_bookings !== undefined) setAllowWalkin(salon.allow_walkin_bookings)

        // Cancellation policy from database
        if (salon.cancellation_hours !== undefined && salon.cancellation_hours !== null) setCancellationHours(String(salon.cancellation_hours))
        if (salon.cancellation_fee !== undefined && salon.cancellation_fee !== null) setCancellationFee(String(salon.cancellation_fee))
        if (salon.allow_noshow_rebooking !== undefined) setAllowNoshowRebooking(salon.allow_noshow_rebooking)

        // Parse opening hours JSON if available
        if (salon.opening_hours) {
          try {
            const parsed = JSON.parse(salon.opening_hours)
            if (Array.isArray(parsed)) {
              setHours(parsed)
            } else {
              console.warn('Opening hours is not an array:', parsed)
            }
          } catch (e) {
            console.error('Failed to parse opening hours from database:', e)
            showToast.error('Failed to load opening hours due to corrupted data in database.')
          }
        }
      } catch (err) {
        console.error(err)
        showToast.error('Failed to load salon settings.')
      } finally {
        setLoading(false)
      }
    }
    fetchSalon()
  }, [])

  // Save all settings to the real database
  const handleSave = async () => {
    if (!salonId) return showToast.error('No salon found.')
    setIsSubmitting(true)
    try {
      console.log('Saving opening hours:', hours)
      const updateData = {
        name: name.trim(),
        description: description.trim(),
        contact_info: phone.trim(),
        street_address: streetAddress.trim(),
        city: city.trim(),
        country: country.trim(),
        town: town.trim(),
        shop_no: shopNo.trim(),
        location: [city, country].filter(Boolean).join(', '),
        opening_hours: JSON.stringify(hours),
        // Booking preferences
        enable_online_booking: bookingOnline,
        allow_walkin_bookings: allowWalkin,
        // Cancellation policy
        cancellation_hours: parseInt(cancellationHours) || 24,
        cancellation_fee: parseFloat(cancellationFee) || 0,
        allow_noshow_rebooking: allowNoshowRebooking,
      }

      console.log('Update payload:', updateData)

      // Remove empty strings so backend doesn't clear valid data
      const cleaned = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== '')
      )

      await businessApi.updateSalon(salonId, cleaned)
      showToast.success('Settings saved to database successfully!')
    } catch (err) {
      console.error(err)
      showToast.error('Failed to save settings: ' + (err.response?.data?.detail || err.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Opening hours helpers
  const updateHour = (index, field, value) => {
    setHours(prev => prev.map((h, i) => i === index ? { ...h, [field]: value } : h))
  }
  const toggleDayClosed = (index) => {
    setHours(prev => prev.map((h, i) =>
      i === index ? { ...h, closed: !h.closed, open: !h.closed ? '' : '09:00', close: !h.closed ? '' : '18:00' } : h
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Business Settings</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Configure your salon profile, operations, and policies.</p>
        </div>
        <Button onClick={handleSave} loading={isSubmitting} leftIcon={<Save className="w-4 h-4" />}>Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Tab Navigation */}
        <div className="md:col-span-1 space-y-1">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${
                  isActive
                    ? 'bg-white dark:bg-surface-900 text-brand-600 dark:text-brand-400 font-semibold border border-surface-200 dark:border-surface-800 shadow-sm'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                }`}>
                <Icon className="w-5 h-5" /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">

          {/* ─── General Info ─────────────────────────── */}
          {activeTab === 'general' && (
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">General Information</h2>

              <Input label="Business Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your Salon Name" />

              <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe your salon..." rows={4} />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
                <Input label="Email Address" value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@salon.com" />
              </div>

              <hr className="border-surface-100 dark:border-surface-800" />

              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Location</h2>
              <Input label="Street Address" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} placeholder="123 Fashion Ave" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Shop No." value={shopNo} onChange={e => setShopNo(e.target.value)} placeholder="Suite 200" />
                <Input label="Town" value={town} onChange={e => setTown(e.target.value)} placeholder="Downtown" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input label="City" value={city} onChange={e => setCity(e.target.value)} placeholder="New York" />
                <Input label="Country" value={country} onChange={e => setCountry(e.target.value)} placeholder="USA" />
                <Input label="Zip Code" value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="10001" />
              </div>
            </div>
          )}

          {/* ─── Online Booking ───────────────────────── */}
          {activeTab === 'booking' && (
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Booking Preferences</h2>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">Enable Online Booking</h3>
                  <p className="text-sm text-surface-500">Allow clients to book appointments via your Beauty Personalized AI page.</p>
                </div>
                <Switch checked={bookingOnline} onChange={setBookingOnline} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">Allow Walk-in Bookings</h3>
                  <p className="text-sm text-surface-500">Let staff add walk-in customers from the dashboard.</p>
                </div>
                <Switch checked={allowWalkin} onChange={setAllowWalkin} />
              </div>
            </div>
          )}

          {/* ─── Opening Hours ────────────────────────── */}
          {activeTab === 'hours' && (
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Opening Hours</h2>
              <p className="text-sm text-surface-500 dark:text-surface-400">Set your working hours for each day. These are saved to the database.</p>

              <div className="space-y-3">
                {hours.map((h, i) => (
                  <div key={h.day} className="flex items-center gap-4 p-3 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-100 dark:border-surface-800">
                    <span className="w-28 text-sm font-semibold text-surface-900 dark:text-white">{h.day}</span>
                    {h.closed ? (
                      <span className="flex-1 text-sm text-surface-400 italic">Closed</span>
                    ) : (
                      <div className="flex-1 flex items-center gap-2">
                        <input type="time" value={h.open} onChange={e => updateHour(i, 'open', e.target.value)}
                          className="px-3 py-1.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                        <span className="text-surface-400">to</span>
                        <input type="time" value={h.close} onChange={e => updateHour(i, 'close', e.target.value)}
                          className="px-3 py-1.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                      </div>
                    )}
                    <button onClick={() => toggleDayClosed(i)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        h.closed
                          ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100'
                      }`}>
                      {h.closed ? 'Closed' : 'Open'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Cancellation Policy ──────────────────── */}
          {activeTab === 'cancellation' && (
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Cancellation Policy</h2>
              <p className="text-sm text-surface-500 dark:text-surface-400">Define how clients can cancel their bookings.</p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Minimum notice before cancellation</label>
                  <select value={cancellationHours} onChange={e => setCancellationHours(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                    <option value="1">1 hour before</option>
                    <option value="2">2 hours before</option>
                    <option value="4">4 hours before</option>
                    <option value="12">12 hours before</option>
                    <option value="24">24 hours before</option>
                    <option value="48">48 hours before</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Late cancellation fee ($)</label>
                  <Input value={cancellationFee} onChange={e => setCancellationFee(e.target.value)} type="number" min="0" step="5" placeholder="0" />
                  <p className="text-xs text-surface-400">Charged to clients who cancel too late. Set to 0 for no fee.</p>
                </div>


              </div>
            </div>
          )}



        </div>
      </div>
    </div>
  )
}
