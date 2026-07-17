import React, { useState } from 'react'
import { Users, Shield, Save, Search, UserCheck } from 'lucide-react'
import Button from '../../components/ui/Button'

// Mock data for roles
const MOCK_USERS = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'business_owner' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'customer' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'customer' },
]

export default function RoleManagementInterface() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [searchTerm, setSearchTerm] = useState('')

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  const handleSave = () => {
    // Mock save
    alert('Roles updated successfully!')
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <Shield className="text-brand-500" />
            Role Management
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Manage user access levels and permissions across the platform.
          </p>
        </div>
        <Button onClick={handleSave} leftIcon={<Save size={18} />}>
          Save Changes
        </Button>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800 text-surface-500 dark:text-surface-400 text-sm">
                <th className="py-3 px-4 font-medium">User</th>
                <th className="py-3 px-4 font-medium">Email</th>
                <th className="py-3 px-4 font-medium">Current Role</th>
                <th className="py-3 px-4 font-medium">Assign Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-surface-100 dark:border-surface-800/50 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                        <Users size={16} className="text-surface-600 dark:text-surface-400" />
                      </div>
                      <span className="font-medium text-surface-900 dark:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-surface-600 dark:text-surface-400">
                    {user.email}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      user.role === 'business_owner' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <select 
                      className="bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full p-2.5"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="customer">Customer</option>
                      <option value="business_owner">Salon Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-surface-500">
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
