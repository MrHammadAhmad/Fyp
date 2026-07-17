import React, { useState } from 'react'
import {
  Droplets,
  Edit,
  Palette,
  Plus,
  ScanFace,
  Scissors,
  Trash2,
  X
} from 'lucide-react'
import Button from '../../components/ui/Button'
import { useCategoryStore } from '../../store/categoryStore'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

function StylingIcon({ className, strokeWidth = 1.75 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="5" width="16" height="5" rx="1.5" />
      <path d="M7 10v9" />
      <path d="M10 10v9" />
      <path d="M13 10v9" />
      <path d="M16 10v9" />
    </svg>
  )
}

function BeardIcon({ className, strokeWidth = 1.75 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="9" r="4.5" />
      <path d="M8 13.5c.8 3.2 6.2 3.2 8 0" />
      <path d="M9.5 12.5c.5 1.2 4.5 1.2 5 0" />
    </svg>
  )
}

const categoryIcons = {
  'cat-haircut': Scissors,
  'cat-styling': StylingIcon,
  'cat-facial': ScanFace,
  'cat-skincare': Droplets,
  'cat-beard': BeardIcon,
  'cat-makeup': Palette,
}

export default function AdminCategories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  })

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug
      })
    } else {
      setEditingCategory(null)
      setFormData({ name: '', slug: '' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required')
      return
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, formData)
      toast.success('Category updated globally')
    } else {
      const newId = `cat-${formData.slug.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      addCategory({ id: newId, ...formData })
      toast.success('Category created globally')
    }
    closeModal()
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category globally?')) {
      deleteCategory(id)
      toast.success('Category deleted globally')
    }
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Categories</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Manage the global platform service categories.</p>
        </div>
        <Button 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => openModal()}
        >
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map(cat => {
          const Icon = categoryIcons[cat.id] || Scissors
          return (
            <div key={cat.id} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm group">
              <div className="h-32 bg-[#405742]/10 dark:bg-[#405742]/15 relative flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm text-[#405742] dark:bg-surface-800 dark:text-brand-300">
                  <Icon className="h-8 w-8" strokeWidth={1.75} />
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-surface-900 dark:text-white">{cat.name}</h3>
                  <p className="text-xs text-surface-500 mt-0.5 capitalize">{cat.slug}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openModal(cat)}
                    className="p-1.5 rounded text-surface-400 hover:text-[#405742] hover:bg-[#405742]/10 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Inline Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-surface-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-surface-200 dark:border-surface-800"
            >
              <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h2>
                <button onClick={closeModal} className="p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Category Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      placeholder="e.g. Hair Coloring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Slug</label>
                    <input 
                      type="text" 
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      className="w-full px-4 py-2 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      placeholder="e.g. coloring"
                    />
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-800 flex justify-end gap-3 bg-surface-50/50 dark:bg-surface-900/50">
                <Button variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit" form="category-form">
                  {editingCategory ? 'Save Changes' : 'Add Category'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
