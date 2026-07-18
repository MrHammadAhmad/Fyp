import React, { useState, useEffect } from 'react'
import { Plus, Users, Crown, CreditCard, X, DollarSign, Loader2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import { formatPrice } from '../../utils/helpers'
import * as Dialog from '@radix-ui/react-dialog'
import showToast from '../../components/ui/Toast'
import { membershipApi } from '../../api/services/membershipApi'
import { businessApi } from '../../api/services/businessApi'
import ConfirmModal from '../../components/ui/ConfirmModal'

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [salonId, setSalonId] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, planId: null })

  // Add Plan Form State
  const [newPlan, setNewPlan] = useState({ name: '', price: '', billing: 'monthly', perks: '' })

  // Edit Plan Form State
  const [editingPlan, setEditingPlan] = useState({ id: '', name: '', price: '', billing: 'monthly', perks: '' })

  // Load salon + memberships from the real database
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const salon = await businessApi.getMySalon()
        if (!salon?.id) {
          showToast.error('No salon found. Please set up your salon first.')
          return
        }
        setSalonId(salon.id)
        const data = await membershipApi.getAll(salon.id)
        // Normalize perks from comma string to array if needed
        const normalized = (data || []).map(m => ({
          ...m,
          perks: Array.isArray(m.perks)
            ? m.perks
            : (m.perks || '').split(',').map(p => p.trim()).filter(Boolean)
        }))
        setMemberships(normalized)
      } catch (err) {
        console.error(err)
        showToast.error('Failed to load membership plans.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ── CREATE ──────────────────────────────────────────────────────
  const handleCreatePlan = async (e) => {
    e.preventDefault()
    if (!newPlan.name.trim()) return showToast.error('Please enter plan name.')
    const price = parseFloat(newPlan.price)
    if (isNaN(price) || price <= 0) return showToast.error('Please enter a valid price.')
    const perksList = newPlan.perks.split(',').map(p => p.trim()).filter(Boolean)
    if (perksList.length === 0) return showToast.error('Please enter at least one perk.')

    setSubmitting(true)
    try {
      const billingLabel = newPlan.billing === 'weekly' ? '1 Week' : newPlan.billing === 'yearly' ? '1 Year' : '1 Month'
      const created = await membershipApi.create({
        salon_id: salonId,
        name: newPlan.name.trim(),
        price,
        duration: billingLabel,
        perks: perksList.join(', '),
        is_active: true
      })
      setMemberships(prev => [...prev, {
        ...created,
        perks: perksList
      }])
      showToast.success('Membership plan created and saved to database!')
      setIsAddModalOpen(false)
      setNewPlan({ name: '', price: '', billing: 'monthly', perks: '' })
    } catch (err) {
      console.error(err)
      showToast.error('Failed to create membership plan.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── OPEN EDIT ───────────────────────────────────────────────────
  const openEditModal = (plan) => {
    const dur = plan.duration || ''
    const billing = dur.includes('Week') ? 'weekly' : dur.includes('Year') ? 'yearly' : 'monthly'
    setEditingPlan({
      id: plan.id,
      name: plan.name,
      price: plan.price.toString(),
      billing,
      perks: Array.isArray(plan.perks) ? plan.perks.join(', ') : (plan.perks || '')
    })
    setIsEditModalOpen(true)
  }

  // ── UPDATE ──────────────────────────────────────────────────────
  const handleSaveEditPlan = async (e) => {
    e.preventDefault()
    if (!editingPlan.name.trim()) return showToast.error('Please enter plan name.')
    const price = parseFloat(editingPlan.price)
    if (isNaN(price) || price <= 0) return showToast.error('Please enter a valid price.')
    const perksList = editingPlan.perks.split(',').map(p => p.trim()).filter(Boolean)
    if (perksList.length === 0) return showToast.error('Please enter at least one perk.')

    setSubmitting(true)
    try {
      const billingLabel = editingPlan.billing === 'weekly' ? '1 Week' : editingPlan.billing === 'yearly' ? '1 Year' : '1 Month'
      const updated = await membershipApi.update(editingPlan.id, {
        name: editingPlan.name.trim(),
        price,
        duration: billingLabel,
        perks: perksList.join(', ')
      })
      setMemberships(prev => prev.map(m => m.id === editingPlan.id
        ? { ...updated, perks: perksList }
        : m
      ))
      showToast.success('Membership plan updated in database!')
      setIsEditModalOpen(false)
    } catch (err) {
      console.error(err)
      showToast.error('Failed to update membership plan.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── DELETE ──────────────────────────────────────────────────────
  const handleDeletePlan = (id) => {
    setDeleteConfirm({ isOpen: true, planId: id })
  }

  const confirmDeletePlan = async () => {
    if (!deleteConfirm.planId) return
    const id = deleteConfirm.planId
    try {
      await membershipApi.delete(id)
      setMemberships(prev => prev.filter(m => m.id !== id))
      showToast.success('Plan deleted from database.')
    } catch (err) {
      console.error(err)
      showToast.error('Failed to delete plan.')
    }
  }

  // Helper: derive billing label from duration string
  const billingLabel = (duration) => {
    if (!duration) return 'month'
    if (duration.toLowerCase().includes('week')) return 'week'
    if (duration.toLowerCase().includes('year')) return 'year'
    return 'month'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Memberships</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Create and manage recurring revenue subscriptions.</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
          Create Membership
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memberships.map(plan => (
            <div key={plan.id} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 border-b border-surface-100 dark:border-surface-800 bg-gradient-to-br from-surface-50 to-white dark:from-surface-800/50 dark:to-surface-900 relative">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
                    <Crown className="w-6 h-6" />
                  </div>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-1 rounded-lg text-surface-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    title="Delete plan"
                  >
                    <X size={16} />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-surface-900 dark:text-white">{formatPrice(plan.price)}</span>
                  <span className="text-sm text-surface-500">/{billingLabel(plan.duration)}</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Included Perks:</h4>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.perks && plan.perks.map((perk, i) => (
                    <li key={i} className="text-sm text-surface-600 dark:text-surface-400 flex items-start gap-2">
                      <span className="text-brand-500 mt-0.5">•</span> {perk}
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                    <CreditCard className="w-4 h-4" />
                    <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${plan.is_active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30' : 'bg-surface-100 text-surface-500'}`}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openEditModal(plan)}>Edit Plan</Button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State / Add New Card */}
          <div className="bg-surface-50 dark:bg-surface-800/20 rounded-2xl border-2 border-dashed border-surface-200 dark:border-surface-700 flex flex-col items-center justify-center p-8 text-center min-h-[350px]">
            <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">Create New Plan</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-6 max-w-xs">Build a recurring revenue stream by offering a new membership tier.</p>
            <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>Create Plan</Button>
          </div>
        </div>
      )}

      {/* CREATE DIALOG */}
      <Dialog.Root open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-surface-900 rounded-3xl p-6 w-[90vw] max-w-md shadow-xl z-50 focus:outline-none border border-surface-100 dark:border-surface-800">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-bold text-surface-900 dark:text-white">Create Membership Plan</Dialog.Title>
              <Dialog.Close className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"><X size={20} /></Dialog.Close>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Plan Name</label>
                <input type="text" value={newPlan.name} onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                  placeholder="e.g. VIP Gold Unlimited" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Price (Rs)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
                    <input type="number" min="1" step="0.01" value={newPlan.price} onChange={(e) => setNewPlan({...newPlan, price: e.target.value})}
                      className="w-full pl-9 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                      placeholder="49.00" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Billing Cycle</label>
                  <select value={newPlan.billing} onChange={(e) => setNewPlan({...newPlan, billing: e.target.value})}
                    className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white">
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Perks (Comma-separated)</label>
                <textarea value={newPlan.perks} onChange={(e) => setNewPlan({...newPlan, perks: e.target.value})}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white h-24 resize-none"
                  placeholder="e.g. Unlimited haircuts, 10% off products, Priority booking" required />
                <p className="text-xs text-surface-500">Separate each perk with a comma</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-800 mt-6">
                <Dialog.Close asChild><Button variant="outline" type="button">Cancel</Button></Dialog.Close>
                <Button variant="brand" type="submit" disabled={submitting}>
                  {submitting ? <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Saving...</span> : 'Save Plan'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* EDIT DIALOG */}
      <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-surface-900 rounded-3xl p-6 w-[90vw] max-w-md shadow-xl z-50 focus:outline-none border border-surface-100 dark:border-surface-800">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-bold text-surface-900 dark:text-white">Edit Membership Plan</Dialog.Title>
              <Dialog.Close className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"><X size={20} /></Dialog.Close>
            </div>

            <form onSubmit={handleSaveEditPlan} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Plan Name</label>
                <input type="text" value={editingPlan.name} onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                  placeholder="e.g. VIP Gold Unlimited" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Price (Rs)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
                    <input type="number" min="1" step="0.01" value={editingPlan.price} onChange={(e) => setEditingPlan({...editingPlan, price: e.target.value})}
                      className="w-full pl-9 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                      placeholder="49.00" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Billing Cycle</label>
                  <select value={editingPlan.billing} onChange={(e) => setEditingPlan({...editingPlan, billing: e.target.value})}
                    className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white">
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Perks (Comma-separated)</label>
                <textarea value={editingPlan.perks} onChange={(e) => setEditingPlan({...editingPlan, perks: e.target.value})}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white h-24 resize-none"
                  placeholder="e.g. Unlimited haircuts, 10% off products, Priority booking" required />
                <p className="text-xs text-surface-500">Separate each perk with a comma</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-800 mt-6">
                <Dialog.Close asChild><Button variant="outline" type="button">Cancel</Button></Dialog.Close>
                <Button variant="brand" type="submit" disabled={submitting}>
                  {submitting ? <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Saving...</span> : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, planId: null })}
        onConfirm={confirmDeletePlan}
        title="Delete Membership Plan"
        message="Are you sure you want to delete this membership plan?"
        confirmText="Delete"
        isDestructive
      />
    </div>
  )
}
