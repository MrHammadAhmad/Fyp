import React, { useState, useEffect } from 'react'
import { Filter, MoreHorizontal, CheckCircle2, XCircle, MapPin, ExternalLink, Ban } from 'lucide-react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/services/adminApi'

export default function AdminBusinesses() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getSalons()
      // Map API data to component data structure
      const mapped = (data || []).map(b => ({
        ...b,
        status: b.is_approved ? 'active' : 'pending',
        categories: b.categories || ['Hair', 'Nails'] // Mocking categories if not provided by backend
      }))
      setBusinesses(mapped)
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (salonId, isApproved) => {
    try {
      await adminApi.approveSalon(salonId, isApproved)
      fetchBusinesses()
    } catch (error) {
      console.error('Failed to update salon status:', error)
    }
  }

  let filteredBusinesses = businesses
  if (search) {
    const q = search.toLowerCase()
    filteredBusinesses = filteredBusinesses.filter(b => 
      (b.name || '').toLowerCase().includes(q) || 
      (b.city || '').toLowerCase().includes(q)
    )
  }

  if (statusFilter !== 'all') {
    filteredBusinesses = filteredBusinesses.filter(b => b.status === statusFilter)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Partner Businesses</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Approve, monitor, and manage salons, barbershops, and beauty studios on the platform.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <SearchBar 
            value={search} 
            onChange={setSearch} 
            placeholder="Search businesses or locations..." 
            className="w-full sm:max-w-md" 
          />
          <div className="flex items-center gap-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50/50 dark:bg-surface-900/50 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium">Business Name</th>
                <th className="p-4 font-medium">Location</th>
                <th className="p-4 font-medium">Categories</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 pr-6 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-surface-500">
                    Loading businesses...
                  </td>
                </tr>
              ) : filteredBusinesses.length > 0 ? (
                filteredBusinesses.map((business) => (
                  <tr key={business.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                          {business.cover_image_url ? (
                            <img src={business.cover_image_url} alt={business.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-surface-400 text-xs font-bold">{(business.name || 'B').charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <Link to={`/business/${business.id}`} className="font-bold text-surface-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 group">
                            {business.name} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          <p className="text-xs text-surface-500 font-medium">ID: {business.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-surface-600 dark:text-surface-300">
                      <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-surface-400" /> {business.city || 'Unknown'}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {business.categories.slice(0,2).map(cat => (
                          <span key={cat} className="px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-[10px] font-bold text-surface-600 dark:text-surface-300 uppercase tracking-wider">
                            {cat.replace('cat-', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={
                        business.status === 'active' ? 'success' : 
                        business.status === 'pending' ? 'warning' : 'error'
                      }>
                        {business.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {business.status === 'pending' && (
                          <>
                            <button onClick={() => handleApproval(business.id, true)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors" title="Approve">
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleApproval(business.id, false)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Reject">
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={async () => {
                            if (window.confirm("Are you sure you want to ban this business owner?")) {
                                try {
                                    await adminApi.blockUser(business.owner_id, true)
                                    alert("Owner has been banned successfully")
                                } catch (e) {
                                    alert("Failed to ban owner")
                                }
                            }
                          }}
                          className="p-2 rounded-lg text-surface-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" 
                          title="Ban Owner"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-surface-500">
                    No businesses found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredBusinesses.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-surface-200 dark:border-surface-800 flex justify-center">
            <Pagination currentPage={page} totalPages={Math.ceil(filteredBusinesses.length / 10) || 1} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}
