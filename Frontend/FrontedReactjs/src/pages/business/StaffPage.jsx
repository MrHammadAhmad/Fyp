import React, { useState, useEffect, useMemo } from 'react'
import { Plus, MoreHorizontal, Star, Edit, Trash2, Loader2, X, User } from 'lucide-react'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import SearchBar from '../../components/common/SearchBar'
import staffData from '../../data/staff.json'
import { businessApi } from '../../api/services/businessApi'
import { bookingApi } from '../../api/services/bookingApi'
import { staffApi } from '../../api/services/staffApi'
import { useBusinessRefreshStore } from '../../store/businessRefreshStore'
import showToast from '../../components/ui/Toast'
import * as Dialog from '@radix-ui/react-dialog'
import ConfirmModal from '../../components/ui/ConfirmModal'

export default function StaffPage() {
  const [search, setSearch] = useState('')
  const [staffList, setStaffList] = useState([])
  const [appointmentCounts, setAppointmentCounts] = useState({})
  const [salonId, setSalonId] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, staffId: null })

  // Add Form State
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Specialist',
    avatar: ''
  })

  // Edit Form State
  const [editingStaff, setEditingStaff] = useState({
    id: '',
    name: '',
    role: 'Specialist',
    avatar: ''
  })

  const [submitting, setSubmitting] = useState(false)

  // Subscribe to global refresh signal from NewBookingModal
  const refreshKey = useBusinessRefreshStore((s) => s.refreshKey)

  const loadData = async () => {
    setLoading(true)
    try {
      const salon = await businessApi.getMySalon().catch(() => null)
      if (salon?.id) {
        setSalonId(salon.id)
        const [realStaff, appts] = await Promise.all([
          businessApi.getStaff(salon.id).catch(() => null),
          bookingApi.getMyBookings().catch(() => []),
        ])

        const list = (realStaff && realStaff.length > 0)
          ? realStaff
          : staffData.filter((s) => s.businessId === 'b1')
        setStaffList(list)

        // Count bookings per staff member
        const counts = {}
        ;(appts || []).forEach((apt) => {
          if (apt.staff_id) {
            counts[apt.staff_id] = (counts[apt.staff_id] || 0) + 1
          } else if (apt.staffName) {
            counts[apt.staffName] = (counts[apt.staffName] || 0) + 1
          }
        })
        setAppointmentCounts(counts)
      } else {
        setStaffList(staffData.filter((s) => s.businessId === 'b1'))
      }
    } catch (err) {
      console.error(err)
      showToast.error('Failed to load staff data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [refreshKey]) // Re-fetches whenever a new booking is created

  const filteredStaff = useMemo(() => {
    if (!search) return staffList
    return staffList.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.role || s.specialty || '').toLowerCase().includes(search.toLowerCase())
    )
  }, [staffList, search])

  // Handle Form Submit (Add)
  const handleAddStaff = async (e) => {
    e.preventDefault()
    if (!newStaff.name.trim()) {
      showToast.error('Please enter staff name.')
      return
    }

    setSubmitting(true)
    try {
      const targetSalonId = salonId || 'b1'
      const avatarUrl = newStaff.avatar.trim() || 'https://images.pexels.com/photos/7508276/pexels-photo-7508276.jpeg'
      
      const payload = {
        salon_id: targetSalonId,
        name: newStaff.name.trim(),
        role: newStaff.role,
        avatar: avatarUrl
      }

      if (salonId) {
        const created = await staffApi.createStaff(payload)
        setStaffList((prev) => [...prev, created])
      } else {
        const mockCreated = {
          id: `staff-mock-${Date.now()}`,
          ...payload,
          rating: 5.0,
          reviewCount: 0
        }
        setStaffList((prev) => [...prev, mockCreated])
      }

      showToast.success('Staff member added successfully!')
      setIsAddModalOpen(false)
      setNewStaff({ name: '', role: 'Specialist', avatar: '' })
    } catch (err) {
      console.error(err)
      showToast.error('Failed to add staff member. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Edit Click
  const openEditModal = (member) => {
    setEditingStaff({
      id: member.id,
      name: member.name,
      role: member.role || member.specialty || 'Specialist',
      avatar: member.avatar || ''
    })
    setIsEditModalOpen(true)
  }

  // Handle Edit Save
  const handleSaveEditStaff = async (e) => {
    e.preventDefault()
    if (!editingStaff.name.trim()) {
      showToast.error('Please enter staff name.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: editingStaff.name.trim(),
        role: editingStaff.role,
        avatar: editingStaff.avatar.trim() || 'https://images.pexels.com/photos/7508276/pexels-photo-7508276.jpeg'
      }

      if (salonId && !editingStaff.id.startsWith('staff-mock-')) {
        const updated = await staffApi.updateStaff(editingStaff.id, payload)
        setStaffList((prev) => prev.map((s) => s.id === editingStaff.id ? updated : s))
      } else {
        // Mock update
        setStaffList((prev) => prev.map((s) => s.id === editingStaff.id ? { ...s, ...payload } : s))
      }

      showToast.success('Staff member updated successfully!')
      setIsEditModalOpen(false)
    } catch (err) {
      console.error(err)
      showToast.error('Failed to update staff member. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Delete
  const handleDeleteStaff = (id) => {
    setDeleteConfirm({ isOpen: true, staffId: id })
  }

  const confirmDeleteStaff = async () => {
    if (!deleteConfirm.staffId) return
    const id = deleteConfirm.staffId

    try {
      if (salonId && !id.startsWith('staff-mock-')) {
        await staffApi.deleteStaff(id)
      }
      setStaffList((prev) => prev.filter((s) => s.id !== id))
      showToast.success('Staff member removed successfully!')
    } catch (err) {
      console.error(err)
      showToast.error('Failed to delete staff member. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Staff Members</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Manage your team, schedules, and permissions.</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
          Add Staff Member
        </Button>
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-surface-200 dark:border-surface-800">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search staff by name or role..."
            className="w-full sm:max-w-md"
          />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50/50 dark:bg-surface-900/50 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  <th className="p-4 pl-6 font-medium">Staff Member</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Rating</th>
                  <th className="p-4 font-medium">Bookings</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 pr-6 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-sm">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((member) => {
                    const bookingCount = appointmentCounts[member.id] || appointmentCounts[member.name] || 0
                    return (
                      <tr key={member.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar src={member.avatar} fallback={member.name} size="md" />
                            <div>
                              <p className="font-bold text-surface-900 dark:text-white">{member.name}</p>
                              <p className="text-xs text-surface-500">{member.email || 'No email provided'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-surface-600 dark:text-surface-300 font-medium">
                          {member.role || member.specialty || '—'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-surface-900 dark:text-white">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            {member.rating ? member.rating.toFixed(1) : '—'}
                            {member.reviewCount > 0 && (
                              <span className="text-xs text-surface-400 font-normal">({member.reviewCount})</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold text-xs">
                            {bookingCount}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge variant="success">Active</Badge>
                        </td>
                        <td className="p-4 pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openEditModal(member)}
                              className="p-2 rounded-lg text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors" 
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteStaff(member.id)}
                              className="p-2 rounded-lg text-surface-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" 
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-surface-500">
                      No staff members found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Radix Dialog for Add Staff */}
      <Dialog.Root open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-surface-900 rounded-3xl p-6 w-[90vw] max-w-md shadow-xl z-50 focus:outline-none border border-surface-100 dark:border-surface-800">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-bold text-surface-900 dark:text-white">
                Add New Staff Member
              </Dialog.Title>
              <Dialog.Close className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200">
                <X size={20} />
              </Dialog.Close>
            </div>
            
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Staff Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
                  <input 
                    type="text" 
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Role / Specialty</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                >
                  <option value="Specialist">Specialist</option>
                  <option value="Master Barber">Master Barber</option>
                  <option value="Senior Stylist">Senior Stylist</option>
                  <option value="Junior Stylist">Junior Stylist</option>
                  <option value="Receptionist">Receptionist</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Avatar Image URL</label>
                <input 
                  type="url" 
                  value={newStaff.avatar}
                  onChange={(e) => setNewStaff({...newStaff, avatar: e.target.value})}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                  placeholder="Optional image URL link (e.g. pexels, unsplash)"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-800 mt-6">
                <Dialog.Close asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button variant="brand" type="submit" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </span>
                  ) : 'Save Staff'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Radix Dialog for Edit Staff */}
      <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-surface-900 rounded-3xl p-6 w-[90vw] max-w-md shadow-xl z-50 focus:outline-none border border-surface-100 dark:border-surface-800">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-bold text-surface-900 dark:text-white">
                Edit Staff Member
              </Dialog.Title>
              <Dialog.Close className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200">
                <X size={20} />
              </Dialog.Close>
            </div>
            
            <form onSubmit={handleSaveEditStaff} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Staff Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
                  <input 
                    type="text" 
                    value={editingStaff.name}
                    onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Role / Specialty</label>
                <select
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({...editingStaff, role: e.target.value})}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                >
                  <option value="Specialist">Specialist</option>
                  <option value="Master Barber">Master Barber</option>
                  <option value="Senior Stylist">Senior Stylist</option>
                  <option value="Junior Stylist">Junior Stylist</option>
                  <option value="Receptionist">Receptionist</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Avatar Image URL</label>
                <input 
                  type="url" 
                  value={editingStaff.avatar}
                  onChange={(e) => setEditingStaff({...editingStaff, avatar: e.target.value})}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                  placeholder="Optional image URL link (e.g. pexels, unsplash)"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-800 mt-6">
                <Dialog.Close asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button variant="brand" type="submit" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </span>
                  ) : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, staffId: null })}
        onConfirm={confirmDeleteStaff}
        title="Delete Staff Member"
        message="Are you sure you want to delete this staff member?"
        confirmText="Delete"
        isDestructive
      />
    </div>
  )
}
