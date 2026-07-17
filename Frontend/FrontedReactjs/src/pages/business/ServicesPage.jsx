import React, { useState, useEffect, useMemo } from 'react'
import { Plus, MoreHorizontal, Edit, Trash2, Search, Filter, Scissors, Loader2, DollarSign, Clock, X } from 'lucide-react'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/common/SearchBar'
import { formatPrice, formatDuration } from '../../utils/helpers'
import servicesData from '../../data/services.json'
import { businessApi } from '../../api/services/businessApi'
import showToast from '../../components/ui/Toast'
import * as Dialog from '@radix-ui/react-dialog'
import { useCategoryStore } from '../../store/categoryStore'

export default function ServicesPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [servicesList, setServicesList] = useState([])
  const [salonId, setSalonId] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const globalCategories = useCategoryStore((state) => state.categories)
  const categories = ['All', ...globalCategories.map(c => c.name)]


  // Fetch Services from Backend
  const loadData = async () => {
    setLoading(true)
    try {
      const salon = await businessApi.getMySalon().catch(() => null)
      let list = []
      let bizId = 'b1'
      
      if (salon?.id) {
        setSalonId(salon.id)
        bizId = salon.id
        const realServices = await businessApi.getRealServices(salon.id).catch(() => [])
        list = (realServices && realServices.length > 0)
          ? realServices
          : servicesData.filter((s) => s.businessId === 'b1')
      } else {
        list = servicesData.filter((s) => s.businessId === 'b1')
      }

      setServicesList(list)
    } catch (err) {
      console.error(err)
      showToast.error('Failed to load services.')
      setServicesList(servicesData.filter((s) => s.businessId === 'b1'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const allServices = useMemo(() => {
    const existingCategoryIds = new Set(servicesList.map(s => s.category || s.categoryId));
    const existingServiceNames = new Set(servicesList.map(s => s.name.toLowerCase()));
    
    const mockServices = globalCategories
      .filter(cat => !existingCategoryIds.has(cat.id) && !existingServiceNames.has(cat.name.toLowerCase()))
      .map((cat, idx) => ({
        id: `mock-s-${cat.id}`,
        businessId: salonId || 'b1',
        categoryId: cat.id,
        name: cat.name,
        description: `Professional ${cat.name} treatment`,
        price: 30 + (idx * 5),
        duration: 30
      }));
      
    return [...servicesList, ...mockServices];
  }, [servicesList, globalCategories, salonId]);

  const filteredServices = useMemo(() => {
    let result = allServices
    if (activeCategory !== 'All') {
      result = result.filter(s => {
        const cat = (s.category || s.categoryId || 'Haircut').replace('cat-', '')
        return cat.toLowerCase() === activeCategory.toLowerCase()
      })
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [servicesList, search, activeCategory])



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Services Menu</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Manage your services, pricing, and durations.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm">


        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50/50 dark:bg-surface-900/50 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  <th className="p-4 pl-6 font-medium">Service Details</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Duration</th>
                  <th className="p-4 font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-sm">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 overflow-hidden shrink-0">
                            {service.image || service.image_url ? (
                              <img src={service.image || service.image_url} alt={service.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-surface-400">
                                <Scissors className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-surface-900 dark:text-white mb-0.5">{service.name}</p>
                            <p className="text-xs text-surface-500 line-clamp-1 max-w-xs">{service.description || 'No description provided'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-xs font-medium text-surface-700 dark:text-surface-300 capitalize">
                          {globalCategories.find(c => c.id === (service.category || service.categoryId))?.name || (service.category || service.categoryId || 'Hair').replace('cat-', '')}
                        </span>
                      </td>
                      <td className="p-4 text-surface-600 dark:text-surface-300 font-medium">
                        {formatDuration(service.duration)}
                      </td>
                      <td className="p-4 font-bold text-surface-900 dark:text-white">
                        {formatPrice(service.price)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-surface-500">
                      No services found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>





    </div>
  )
}
