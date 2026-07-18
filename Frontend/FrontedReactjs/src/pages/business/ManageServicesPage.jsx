import React, { useState, useEffect } from 'react'
import { Scissors, Plus, Search, Edit2, Trash2, Clock, DollarSign, AlertTriangle, Loader2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import * as Dialog from '@radix-ui/react-dialog'
import toast from 'react-hot-toast'
import { businessApi } from '../../api/services/businessApi'
import { useAuth } from '../../hooks/useAuth'

export default function ManageServicesPage() {
  const { user } = useAuth()
  const [salon, setSalon] = useState(null)
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState(null)
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newService, setNewService] = useState({ name: '', category: 'Hair', price: 0, duration: 30, description: '' })

  useEffect(() => {
    const fetchSalonAndServices = async () => {
      if (!user) return
      try {
        setIsLoading(true)
        let mySalon = await businessApi.getMySalon(user.id)
        
        // If owner has no salon, auto-create a default one
        if (!mySalon) {
          mySalon = await businessApi.createSalon({
            name: `${user.name || 'My'} Salon`,
            location: 'Update your address',
            category: 'Hair'
          })
        }
        setSalon(mySalon)

        // Fetch services
        const realServices = await businessApi.getRealServices(mySalon.id)
        setServices(realServices)
      } catch (error) {
        toast.error("Failed to load services")
      } finally {
        setIsLoading(false)
      }
    }
    fetchSalonAndServices()
  }, [user])

  const handleDeleteClick = (service) => {
    setServiceToDelete(service)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await businessApi.deleteService(serviceToDelete.id)
      setServices(services.filter(s => s.id !== serviceToDelete.id))
      setIsDeleteDialogOpen(false)
      setServiceToDelete(null)
      toast.success('Service deleted successfully.')
    } catch (error) {
      toast.error('Failed to delete service')
    }
  }

  const handleEditClick = (service) => {
    setEditingService({ ...service })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingService.name || editingService.price === '' || editingService.duration === '') {
      toast.error('Name, Price, and Duration are required.')
      return
    }
    try {
      const updated = await businessApi.updateService(editingService.id, editingService)
      setServices(services.map(s => s.id === updated.id ? updated : s))
      setIsEditModalOpen(false)
      toast.success('Service updated successfully.')
    } catch (error) {
      toast.error('Failed to update service')
    }
  }

  const handleAddService = async (e) => {
    e.preventDefault()
    if (!newService.name || newService.price === '' || newService.duration === '') {
      toast.error('Name, Price, and Duration are required.')
      return
    }
    if (!salon) return

    try {
      const created = await businessApi.createService(salon.id, newService)
      setServices([...services, created])
      setIsAddModalOpen(false)
      setNewService({ name: '', category: 'Hair', price: 0, duration: 30, description: '' })
      toast.success('Service added successfully.')
    } catch (error) {
      toast.error('Failed to add service')
    }
  }

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.category && s.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-brand-500 w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <Scissors className="text-brand-500" />
            Manage Services
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Add, update pricing and duration, or remove services from your catalog.
          </p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setIsAddModalOpen(true)}>
          Add New Service
        </Button>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 overflow-hidden">
        <div className="p-4 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
            <input 
              type="text" 
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800 text-surface-500 dark:text-surface-400 text-sm bg-white dark:bg-surface-900">
                <th className="py-3 px-4 font-medium">Service Name</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium">Duration</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(service => (
                <tr key={service.id} className="border-b border-surface-100 dark:border-surface-800/50 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="py-4 px-4 font-medium text-surface-900 dark:text-white">
                    {service.name}
                    <p className="text-xs text-surface-500 font-normal mt-0.5 max-w-xs truncate">{service.description}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                      {service.category || 'General'}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-surface-900 dark:text-white">
                    ${Number(service.price).toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-surface-600 dark:text-surface-400">
                    {service.duration} mins
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button 
                      onClick={() => handleEditClick(service)}
                      className="p-2 text-surface-400 hover:text-brand-500 transition-colors rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"
                      title="Edit Service"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(service)}
                      className="p-2 text-surface-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete Service"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-surface-500">
                    No services found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-surface-900 rounded-3xl p-6 w-[90vw] max-w-md shadow-xl z-50 focus:outline-none">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={32} />
              </div>
              <Dialog.Title className="text-xl font-bold text-surface-900 dark:text-white mb-2">
                Delete Service
              </Dialog.Title>
              <Dialog.Description className="text-surface-500 dark:text-surface-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-surface-700 dark:text-surface-300">"{serviceToDelete?.name}"</span>? This action cannot be undone.
              </Dialog.Description>
              
              <div className="flex w-full gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>
                  Yes, Delete
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit Service Modal */}
      <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-surface-900 rounded-3xl p-6 w-[90vw] max-w-md shadow-xl z-50 focus:outline-none">
            <Dialog.Title className="text-xl font-bold text-surface-900 dark:text-white mb-6">
              Edit Service
            </Dialog.Title>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Service Name</label>
                <input 
                  type="text" 
                  value={editingService?.name || ''}
                  onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Price (Rs)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={editingService?.price || 0}
                      onChange={(e) => setEditingService({...editingService, price: parseFloat(e.target.value)})}
                      className="w-full pl-9 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Duration (mins)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
                    <input 
                      type="number" 
                      min="5"
                      step="5"
                      value={editingService?.duration || 0}
                      onChange={(e) => setEditingService({...editingService, duration: parseInt(e.target.value)})}
                      className="w-full pl-9 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Description</label>
                <textarea 
                  value={editingService?.description || ''}
                  onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-800 mt-6">
                <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Add Service Modal */}
      <Dialog.Root open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-surface-900 rounded-3xl p-6 w-[90vw] max-w-md shadow-xl z-50 focus:outline-none">
            <Dialog.Title className="text-xl font-bold text-surface-900 dark:text-white mb-6">
              Add New Service
            </Dialog.Title>
            
            <form onSubmit={handleAddService} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Service Name</label>
                <input 
                  type="text" 
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Price (Rs)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={newService.price}
                      onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value)})}
                      className="w-full pl-9 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Duration (mins)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
                    <input 
                      type="number" 
                      min="5"
                      step="5"
                      value={newService.duration}
                      onChange={(e) => setNewService({...newService, duration: parseInt(e.target.value)})}
                      className="w-full pl-9 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Description</label>
                <textarea 
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-800 mt-6">
                <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Add Service
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  )
}
