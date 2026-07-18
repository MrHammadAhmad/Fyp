import React, { useState, useEffect } from 'react'
import { 
  Building2, MapPin, Sparkles, DollarSign, Clock, Plus, Trash2, 
  Save, UserCheck, Scissors, Database, HelpCircle 
} from 'lucide-react'
import { businessApi } from '../../api/services/businessApi'
import { staffApi } from '../../api/services/staffApi'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import showToast from '../../components/ui/Toast'

const GLOBAL_SERVICES_LIST = [
  { name: 'Haircut', defaultPrice: 30, defaultDuration: 30 },
  { name: 'Styling', defaultPrice: 45, defaultDuration: 45 },
  { name: 'Facial', defaultPrice: 50, defaultDuration: 45 },
  { name: 'Skincare', defaultPrice: 60, defaultDuration: 60 },
  { name: 'Beard', defaultPrice: 20, defaultDuration: 20 },
  { name: 'Makeup', defaultPrice: 75, defaultDuration: 60 }
]

export default function ManageSalonPage() {
  const [salonId, setSalonId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Salon Details form state
  const [salonData, setSalonData] = useState({
    name: '',
    description: '',
    cover_image: '',
    country: '',
    city: '',
    town: '',
    shop_no: '',
    street_address: '',
    location: '' // fallback combined location string
  })

  // Services state: list of { name, checked, price, duration }
  const [services, setServices] = useState(
    GLOBAL_SERVICES_LIST.map(s => ({
      name: s.name,
      checked: false,
      price: s.defaultPrice,
      duration: s.defaultDuration
    }))
  )

  // Staff/Barbers state
  const [staff, setStaff] = useState([])
  const [newBarber, setNewBarber] = useState({
    name: '',
    role: 'Specialist',
    avatar: ''
  })
  const [addingBarber, setAddingBarber] = useState(false)

  // Fetch all data for the owner's salon
  useEffect(() => {
    async function loadSalonData() {
      try {
        setLoading(true)
        const mySalon = await businessApi.getMySalon()
        if (mySalon) {
          setSalonId(mySalon.id)
          setSalonData({
            name: mySalon.name || '',
            description: mySalon.description || '',
            cover_image: mySalon.cover_image || mySalon.image_url || '',
            country: mySalon.country || '',
            city: mySalon.city || '',
            town: mySalon.town || '',
            shop_no: mySalon.shop_no || '',
            street_address: mySalon.street_address || '',
            location: mySalon.location || ''
          })

          // Load salon's registered services
          const realServices = await businessApi.getRealServices(mySalon.id)
          if (realServices && realServices.length > 0) {
            setServices(prev => 
              prev.map(p => {
                const matched = realServices.find(rs => rs.name.toLowerCase() === p.name.toLowerCase())
                if (matched) {
                  return {
                    ...p,
                    checked: true,
                    price: parseFloat(matched.price),
                    duration: parseInt(matched.duration)
                  }
                }
                return p
              })
            )
          }

          // Load staff
          const salonStaff = await staffApi.getStaff(mySalon.id)
          setStaff(salonStaff || [])
        }
      } catch (error) {
        console.error(error)
        showToast.error('Failed to load salon details.')
      } finally {
        setLoading(false)
      }
    }

    loadSalonData()
  }, [])

  // Handle service checkbox toggles and input values
  const handleServiceToggle = (index) => {
    setServices(prev => prev.map((s, idx) => idx === index ? { ...s, checked: !s.checked } : s))
  }

  const handleServiceChange = (index, field, value) => {
    setServices(prev => prev.map((s, idx) => idx === index ? { ...s, [field]: value } : s))
  }

  // Handle core Save action
  const handleSaveSalon = async (e) => {
    e.preventDefault()
    if (!salonData.name || !salonData.city) {
      showToast.error('Please enter Shop Name and Area in Lahore.')
      return
    }

    try {
      setSaving(true)
      // Form location string as street address, City, Country
      const locationText = `${salonData.street_address || ''}, ${salonData.town || ''}, ${salonData.city}, Lahore, Pakistan`
      
      const payload = {
        name: salonData.name,
        description: salonData.description,
        cover_image: salonData.cover_image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
        location: locationText,
        address: locationText,
        country: 'Pakistan',
        city: 'Lahore',
        town: salonData.city,
        shop_no: salonData.shop_no,
        street_address: salonData.street_address,
        opening_hours: '9:00 AM - 9:00 PM',
        contact_info: 'Contact owner profile'
      }

      let activeSalonId = salonId
      if (salonId) {
        await businessApi.updateSalon(salonId, payload)
        showToast.success('Salon details updated successfully!')
      } else {
        const newSalon = await businessApi.createSalon(payload)
        activeSalonId = newSalon.id
        setSalonId(newSalon.id)
        showToast.success('Salon profile created successfully!')
      }

      // Sync Services in the database
      const checkedServices = services.filter(s => s.checked)
      const currentDbServices = await businessApi.getRealServices(activeSalonId)

      // Add or update checked services
      for (const checkedSvc of checkedServices) {
        const existing = currentDbServices.find(s => s.name.toLowerCase() === checkedSvc.name.toLowerCase())
        if (existing) {
          if (parseFloat(existing.price) !== parseFloat(checkedSvc.price) || parseInt(existing.duration) !== parseInt(checkedSvc.duration)) {
            await businessApi.updateService(existing.id, {
              price: parseFloat(checkedSvc.price),
              duration: parseInt(checkedSvc.duration)
            })
          }
        } else {
          await businessApi.createService(activeSalonId, {
            name: checkedSvc.name,
            price: parseFloat(checkedSvc.price),
            duration: parseInt(checkedSvc.duration),
            image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'
          })
        }
      }

      // Delete unchecked services
      for (const dbSvc of currentDbServices) {
        const isStillChecked = checkedServices.some(s => s.name.toLowerCase() === dbSvc.name.toLowerCase())
        if (!isStillChecked) {
          await businessApi.deleteService(dbSvc.id)
        }
      }

      showToast.success('Services synchronized successfully!')
    } catch (error) {
      console.error(error)
      showToast.error(error.response?.data?.detail || 'Failed to save salon details.')
    } finally {
      setSaving(false)
    }
  }

  // Barber/Staff operations
  const handleAddBarber = async () => {
    if (!salonId) {
      showToast.error('Please save your salon details first before adding barbers.')
      return
    }
    if (!newBarber.name) {
      showToast.error('Please enter the Barber\'s name.')
      return
    }

    try {
      setAddingBarber(true)
      const payload = {
        salon_id: salonId,
        name: newBarber.name,
        role: newBarber.role || 'Stylist',
        avatar: newBarber.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newBarber.name}`
      }
      
      const created = await staffApi.createStaff(payload)
      setStaff(prev => [...prev, created])
      setNewBarber({ name: '', role: 'Specialist', avatar: '' })
      showToast.success('Barber added successfully!')
    } catch (error) {
      console.error(error)
      showToast.error('Failed to add barber.')
    } finally {
      setAddingBarber(false)
    }
  }

  const handleDeleteBarber = async (id) => {
    try {
      await staffApi.deleteStaff(id)
      setStaff(prev => prev.filter(b => b.id !== id))
      showToast.success('Barber removed successfully!')
    } catch (error) {
      console.error(error)
      showToast.error('Failed to remove barber.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Data Dashboard</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">Configure your shop details, services, and barbers lists live to the database.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Salon Onboarding Profile & Details */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSaveSalon} className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2 border-b border-surface-100 dark:border-surface-800 pb-3">
              <Building2 className="w-5 h-5 text-[#405742]" /> Shop Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Shop Name" 
                placeholder="Aura Hair Salon" 
                value={salonData.name} 
                onChange={e => setSalonData({...salonData, name: e.target.value})} 
                required 
              />
              <Input 
                label="Cover Image URL" 
                placeholder="https://images.unsplash.com/photo-..." 
                value={salonData.cover_image} 
                onChange={e => setSalonData({...salonData, cover_image: e.target.value})} 
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Shop Description</label>
              <textarea 
                className="w-full min-h-[100px] p-3 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm resize-none"
                placeholder="Tell users what makes your shop special..."
                value={salonData.description}
                onChange={e => setSalonData({...salonData, description: e.target.value})}
              />
            </div>

            {/* Location Fields */}
            <div className="space-y-4 pt-4 border-t border-surface-100 dark:border-surface-800">
              <h3 className="font-bold text-surface-900 dark:text-white text-sm flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#405742]" /> Location Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Input 
                  label="Shop No" 
                  placeholder="Suite 14B" 
                  value={salonData.shop_no} 
                  onChange={e => setSalonData({...salonData, shop_no: e.target.value})} 
                />
                <Input 
                  label="Street Address" 
                  placeholder="12 Main Boulevard" 
                  value={salonData.street_address} 
                  onChange={e => setSalonData({...salonData, street_address: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Input 
                  label="Area in Lahore" 
                  placeholder="e.g. Gulberg, DHA, Johar Town" 
                  value={salonData.city} 
                  onChange={e => setSalonData({...salonData, city: e.target.value})} 
                  required 
                  list="lahore-areas"
                />
                <datalist id="lahore-areas">
                  <option value="Gulberg" />
                  <option value="DHA" />
                  <option value="Johar Town" />
                  <option value="Model Town" />
                  <option value="Bahria Town" />
                  <option value="Wapda Town" />
                  <option value="Cavalry Ground" />
                  <option value="Cantt" />
                </datalist>
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" disabled={saving} className="bg-[#405742] hover:bg-[#334d3b]">
              {saving ? 'Saving Details...' : 'Save Profile & Services Setup'}
            </Button>
          </form>


        </div>

        {/* Right Column: Barbers/Staff List Management */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2 border-b border-surface-100 dark:border-surface-800 pb-3">
              <UserCheck className="w-5 h-5 text-[#405742]" /> Manage Barbers
            </h2>

            {/* List of Barbers */}
            {staff.length > 0 ? (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {staff.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-xl border border-surface-100 dark:border-surface-850 bg-surface-50 dark:bg-surface-950/40">
                    <div className="flex items-center gap-3">
                      <img 
                        src={b.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${b.name}`} 
                        className="w-9 h-9 rounded-xl object-cover" 
                        alt={b.name} 
                      />
                      <div>
                        <h4 className="font-bold text-surface-900 dark:text-white text-sm">{b.name}</h4>
                        <p className="text-xs text-surface-500">{b.role || 'Stylist'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteBarber(b.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                      title="Remove Barber"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-surface-500 dark:text-surface-400 text-sm">
                No barbers added yet. Use the fields below to add your team!
              </div>
            )}

            {/* Add Barber Form */}
            <div className="border-t border-surface-100 dark:border-surface-800 pt-4 space-y-4">
              <h3 className="font-bold text-surface-900 dark:text-white text-sm">Add New Barber</h3>
              <Input 
                label="Name" 
                placeholder="Hassan Ali" 
                value={newBarber.name} 
                onChange={e => setNewBarber({...newBarber, name: e.target.value})} 
              />
              <Input 
                label="Role / Title" 
                placeholder="Senior Barber" 
                value={newBarber.role} 
                onChange={e => setNewBarber({...newBarber, role: e.target.value})} 
              />
              <Input 
                label="Avatar Image URL" 
                placeholder="https://api.dicebear.com/..." 
                value={newBarber.avatar} 
                onChange={e => setNewBarber({...newBarber, avatar: e.target.value})} 
              />
              <Button onClick={handleAddBarber} fullWidth disabled={addingBarber} className="bg-[#405742] hover:bg-[#334d3b]">
                {addingBarber ? 'Adding Barber...' : 'Add Barber'}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
