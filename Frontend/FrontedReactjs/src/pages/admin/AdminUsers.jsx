import React, { useState, useEffect } from 'react'
import { Filter, MoreHorizontal, Mail, Ban, ShieldCheck } from 'lucide-react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import Avatar from '../../components/ui/Avatar'
import { formatDate } from '../../utils/helpers'
import { adminApi } from '../../api/services/adminApi'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState('all')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDropdownId, setOpenDropdownId] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getUsers()
      setUsers(data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBlock = async (userId, isBlocked) => {
    try {
      await adminApi.blockUser(userId, !isBlocked)
      fetchUsers()
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
  }

  let filteredUsers = users
  if (search) {
    const q = search.toLowerCase()
    filteredUsers = filteredUsers.filter(u => 
      (u.name || '').toLowerCase().includes(q) || 
      (u.email || '').toLowerCase().includes(q)
    )
  }
  
  if (roleFilter !== 'all') {
    filteredUsers = filteredUsers.filter(u => (u.role || 'customer') === roleFilter)
  }

  const ITEMS_PER_PAGE = 10;
  const paginatedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Users</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Manage all registered users and their roles.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:max-w-md">
            <SearchBar value={search} onChange={setSearch} placeholder="Search users by name or email..." />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-40 appearance-none bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="owner">Business Owners</option>
                <option value="admin">Admins</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-50 dark:bg-surface-800/50 text-surface-500 dark:text-surface-400">
              <tr>
                <th className="p-4 pl-6 font-medium">User</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 pr-6 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
                  </td>
                </tr>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.profile_image} fallback={user.name || 'User'} className="w-10 h-10" />
                        <div>
                          <p className="font-semibold text-surface-900 dark:text-white">{user.name}</p>
                          <div className="flex items-center text-surface-500 text-xs mt-0.5">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge 
                        className={
                        (user.role || 'customer') === 'admin' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        (user.role || 'customer') === 'owner' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' :
                        'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300'
                        }
                      >
                        {(user.role || 'customer') === 'admin' && <ShieldCheck className="w-3 h-3 mr-1" />}
                        {(user.role || 'customer') === 'owner' ? 'BUSINESS OWNER' : (user.role || 'customer').replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={user.is_blocked ? 'danger' : 'success'}>
                        {user.is_blocked ? 'Banned' : 'Active'}
                      </Badge>
                    </td>
                    <td className="p-4 text-surface-600 dark:text-surface-400">
                      {user.created_at ? formatDate(user.created_at) : 'N/A'}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(user.role || 'customer') !== 'admin' && (
                          !user.is_blocked ? (
                            <button onClick={() => handleToggleBlock(user.id, user.is_blocked)} className="p-2 rounded-lg text-surface-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Ban User">
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => handleToggleBlock(user.id, user.is_blocked)} className="p-2 rounded-lg text-surface-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors" title="Unban User">
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-surface-500">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-surface-200 dark:border-surface-800 flex justify-center">
            <Pagination currentPage={page} totalPages={Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}
