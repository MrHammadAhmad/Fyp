import React, { useState } from 'react'
import { Search } from 'lucide-react'
import ServiceCard from '../cards/ServiceCard'
import { cn } from '../../utils/helpers'

export default function ServiceSelector({ services = [], selectedService, onSelect, className }) {
  const [search, setSearch] = useState('')

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-1">Choose a Service</h2>
        <p className="text-sm text-surface-500 dark:text-surface-400">Select the service you'd like to book</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services..."
          className="w-full h-11 pl-11 pr-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-surface-900 dark:text-white placeholder:text-surface-400"
        />
      </div>

      {/* Services List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {filtered.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            variant="compact"
            selected={selectedService?.id === service.id}
            onSelect={onSelect}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-surface-400 text-center py-8">No services found</p>
        )}
      </div>
    </div>
  )
}
