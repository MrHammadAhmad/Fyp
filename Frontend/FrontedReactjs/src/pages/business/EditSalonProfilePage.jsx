import React, { useState } from 'react'
import { Save, Store, MapPin, Phone, Mail, Clock, Image as ImageIcon } from 'lucide-react'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function EditSalonProfilePage() {
  const [formData, setFormData] = useState({
    name: 'Elegant Style Salon',
    description: 'A premium beauty salon offering hair and skin care services.',
    address: '123 Beauty Lane, Downtown',
    phone: '+1 234 567 8900',
    email: 'contact@elegantstyle.com',
    openingHours: '09:00 - 20:00',
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name || !formData.address || !formData.phone) {
      toast.error('Please fill in all required fields.')
      return
    }

    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Salon profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update salon profile.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
          <Store className="text-brand-500" />
          Edit Salon Profile
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Update your salon details, contact information, and business hours.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-surface-900 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Salon Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                placeholder="Enter salon name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
              <input 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                placeholder="e.g. +1 234 567 8900"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Description
            </label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white resize-none"
              placeholder="Tell customers about your salon..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
              <input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                placeholder="Full street address"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                placeholder="contact@example.com"
              />
            </div>
          </div>


          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300 flex justify-between">
              Cover Image
            </label>
            <div className="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-white dark:bg-surface-900 rounded-full flex items-center justify-center shadow-sm mb-3">
                <ImageIcon size={24} className="text-brand-500" />
              </div>
              <p className="text-sm font-medium text-surface-900 dark:text-white mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-surface-500">SVG, PNG, JPG or GIF (max. 800x400px)</p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-surface-100 dark:border-surface-800">
          <Button variant="outline" type="button">Cancel</Button>
          <Button type="submit" disabled={isSaving} leftIcon={<Save size={18} />}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
