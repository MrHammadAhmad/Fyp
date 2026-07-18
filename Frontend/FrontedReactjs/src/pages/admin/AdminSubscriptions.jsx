import React, { useState, useEffect } from 'react'
import { CreditCard, Edit, Trash2, Plus, X } from 'lucide-react'
import Button from '../../components/ui/Button'
import { formatPrice } from '../../utils/helpers'
import { adminApi } from '../../api/services/adminApi'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import ConfirmModal from '../../components/ui/ConfirmModal'

export default function AdminSubscriptions() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  
  // Confirm Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    interval: 'month',
    features: ['']
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getSubscriptions()
      setPlans(data)
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
      toast.error('Failed to load subscription plans')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (planId) => {
    setPlanToDelete(planId)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    try {
      toast.loading('Deleting plan...', { id: 'delete-plan' })
      await adminApi.deleteSubscription(planToDelete)
      toast.success('Plan deleted successfully', { id: 'delete-plan' })
      fetchPlans()
    } catch (error) {
      console.error('Failed to delete plan:', error)
      toast.error('Failed to delete plan', { id: 'delete-plan' })
    } finally {
      setIsDeleteModalOpen(false)
      setPlanToDelete(null)
    }
  }

  const openModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan)
      setFormData({
        name: plan.name,
        price: plan.price.toString(),
        interval: plan.interval,
        features: plan.features && plan.features.length ? [...plan.features] : ['']
      })
    } else {
      setEditingPlan(null)
      setFormData({
        name: '',
        price: '',
        interval: 'month',
        features: ['']
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPlan(null)
  }

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({ ...formData, features: newFeatures })
  }

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] })
  }

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    if (newFeatures.length === 0) newFeatures.push('')
    setFormData({ ...formData, features: newFeatures })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price) {
      toast.error('Name and price are required')
      return
    }

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      features: formData.features.filter(f => f.trim() !== '')
    }

    try {
      const actionText = editingPlan ? 'Updating' : 'Creating'
      toast.loading(`${actionText} plan...`, { id: 'save-plan' })
      
      if (editingPlan) {
        await adminApi.updateSubscription(editingPlan.id, payload)
      } else {
        await adminApi.createSubscription(payload)
      }
      
      toast.success(`Plan ${editingPlan ? 'updated' : 'created'} successfully`, { id: 'save-plan' })
      closeModal()
      fetchPlans()
    } catch (error) {
      console.error('Failed to save plan:', error)
      toast.error('Failed to save plan', { id: 'save-plan' })
    }
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Subscription Plans</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Manage pricing tiers for businesses using the platform.</p>
        </div>
        <Button 
          leftIcon={<CreditCard className="w-4 h-4" />}
          onClick={() => openModal()}
        >
          Create New Plan
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
          <p className="text-surface-500 mb-4">No subscription plans created yet.</p>
          <Button variant="outline" onClick={() => openModal()}>Create your first plan</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm flex flex-col transition-all hover:shadow-md">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-surface-900 dark:text-white">{formatPrice(plan.price)}</span>
                  <span className="text-surface-500">/{plan.interval}</span>
                </div>
                <p className="mt-4 text-sm font-medium text-brand-600 dark:text-brand-400">{plan.businesses} active businesses</p>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features?.map((feature, i) => (
                  <li key={i} className="text-sm text-surface-600 dark:text-surface-300 flex items-start gap-2">
                    <span className="text-brand-500">•</span> {feature}
                  </li>
                ))}
              </ul>

              <div className="flex gap-2 pt-4 border-t border-surface-100 dark:border-surface-800">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  leftIcon={<Edit className="w-4 h-4" />}
                  onClick={() => openModal(plan)}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  className="px-3 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400"
                  onClick={() => handleDeleteClick(plan.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inline Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-surface-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-surface-200 dark:border-surface-800"
            >
              <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">
                  {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                </h2>
                <button onClick={closeModal} className="p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <form id="plan-form" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Plan Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      placeholder="e.g. Professional"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Price (Rs)</label>
                      <input 
                        type="number" 
                        required
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full px-4 py-2 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        placeholder="e.g. 29.99"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Billing Interval</label>
                      <select 
                        value={formData.interval}
                        onChange={(e) => setFormData({...formData, interval: e.target.value})}
                        className="w-full px-4 py-2 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      >
                        <option value="month">Monthly</option>
                        <option value="year">Yearly</option>
                        <option value="week">Weekly</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Features</label>
                      <button type="button" onClick={addFeature} className="text-xs text-brand-600 dark:text-brand-400 font-medium flex items-center gap-1 hover:underline">
                        <Plus className="w-3 h-3" /> Add Feature
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input 
                            type="text" 
                            value={feature}
                            onChange={(e) => handleFeatureChange(idx, e.target.value)}
                            className="flex-1 px-4 py-2 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                            placeholder="e.g. Unlimited Staff"
                          />
                          <button 
                            type="button" 
                            onClick={() => removeFeature(idx)}
                            className="p-2 text-surface-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-800 flex justify-end gap-3 bg-surface-50/50 dark:bg-surface-900/50">
                <Button variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit" form="plan-form">
                  {editingPlan ? 'Save Changes' : 'Create Plan'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Plan"
        message="Are you sure you want to delete this subscription plan? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  )
}
