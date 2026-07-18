import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isToday, isTomorrow, addDays, isBefore } from 'date-fns'

// ===== Tailwind class merge utility =====
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// ===== Date & Time Formatters =====
export function formatDate(date, fmt = 'MMM d, yyyy') {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, fmt)
  } catch {
    return date
  }
}

export function formatTime(time) {
  // Convert "14:30" to "2:30 PM"
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  return `${h}:${String(minutes).padStart(2, '0')} ${period}`
}

export function formatDateRelative(date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'EEE, MMM d')
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

// ===== Currency Formatters =====
export function formatPrice(amount, currency = 'PKR') {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPriceRange(min, max) {
  if (min === max) return formatPrice(min)
  return `${formatPrice(min)} – ${formatPrice(max)}`
}

// ===== Number Formatters =====
export function formatNumber(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

// ===== String Utilities =====
export function truncate(str, length = 100) {
  if (!str) return ''
  return str.length > length ? `${str.slice(0, length)}...` : str
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// ===== Booking Status =====
export function getStatusColor(status) {
  const colors = {
    confirmed: 'badge-green',
    upcoming: 'badge-brand',
    completed: 'badge-gray',
    cancelled: 'badge-red',
    pending: 'badge-orange',
    'no-show': 'badge-red',
  }
  return colors[status] || 'badge-gray'
}

export function getStatusLabel(status) {
  const labels = {
    confirmed: 'Confirmed',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending',
    'no-show': 'No Show',
  }
  return labels[status] || capitalize(status)
}

// ===== Time Slots Generator =====
export function generateTimeSlots(start = '09:00', end = '18:00', interval = 30) {
  const slots = []
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)
  
  let currentH = startH
  let currentM = startM
  
  while (currentH < endH || (currentH === endH && currentM <= endM)) {
    const timeStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`
    slots.push({
      value: timeStr,
      label: formatTime(timeStr),
      available: Math.random() > 0.3, // Mock availability
    })
    
    currentM += interval
    if (currentM >= 60) {
      currentH += 1
      currentM -= 60
    }
  }
  
  return slots
}

// ===== Debounce =====
export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// ===== Star Rating =====
export function getStarArray(rating) {
  return Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(rating)) return 'full'
    if (i < rating) return 'half'
    return 'empty'
  })
}

// ===== Validation =====
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone) {
  return /^\+?[\d\s\-()]{10,}$/.test(phone)
}

// ===== Array utilities =====
export function groupBy(arr, key) {
  return arr.reduce((groups, item) => {
    const group = item[key]
    return { ...groups, [group]: [...(groups[group] || []), item] }
  }, {})
}

export function sortBy(arr, key, direction = 'asc') {
  return [...arr].sort((a, b) => {
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
    return 0
  })
}
