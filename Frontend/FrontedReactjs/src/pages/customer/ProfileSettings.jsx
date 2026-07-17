import React, { useState } from 'react'
import { Camera } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import showToast from '../../components/ui/Toast'
import { authApi } from '../../api/services/authApi'

export default function ProfileSettings() {
  const { user, updateUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const updatedProfile = await authApi.updateProfile({
        name: formData.name,
        phone: formData.phone
      })
      updateUser(updatedProfile)
      showToast.success('Profile updated successfully')
    } catch (error) {
      showToast.error('Failed to update profile')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Profile Settings</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">Update your personal information and preferences.</p>
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar src={user?.avatar} alt={user?.name} size="2xl" />
              <button type="button" className="absolute bottom-0 right-0 p-2 bg-white dark:bg-surface-800 rounded-full border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:text-brand-600 transition-colors shadow-sm">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-surface-900 dark:text-white text-lg">Profile Photo</h3>
              <p className="text-xs text-surface-500 mb-3">JPG, GIF or PNG. Max size of 5MB.</p>
              <Button type="button" variant="outline" size="sm">Upload New</Button>
            </div>
          </div>

          <hr className="border-surface-100 dark:border-surface-800" />

          <div className="space-y-4">
            <h3 className="font-bold text-surface-900 dark:text-white">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <Input label="Email Address" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled />
              <Input label="Phone Number" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>



          <div className="pt-4 flex justify-end">
            <Button type="submit" loading={isSubmitting} variant="brand405">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
