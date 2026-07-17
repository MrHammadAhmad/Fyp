import React, { useState, useEffect } from 'react'
import { MessageSquare, Filter, Search, Reply, CheckCircle2, Clock } from 'lucide-react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import SearchBar from '../../components/common/SearchBar'
import { adminApi } from '../../api/services/adminApi'
import toast from 'react-hot-toast'

export default function AdminSupport() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('open')
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [filter])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getSupportTickets(filter)
      setTickets(data)
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
      toast.error('Failed to load support tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      toast.loading(`Marking ticket as ${newStatus}...`, { id: 'update-ticket' })
      await adminApi.updateSupportTicket(ticketId, newStatus)
      toast.success(`Ticket marked as ${newStatus}`, { id: 'update-ticket' })
      fetchTickets() // Refresh the list
    } catch (error) {
      console.error('Failed to update ticket status:', error)
      toast.error('Failed to update ticket status', { id: 'update-ticket' })
    }
  }

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(search.toLowerCase()) || 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Support Tickets</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Handle inquiries from users and businesses.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <SearchBar 
            value={search} 
            onChange={setSearch} 
            placeholder="Search tickets by subject, name or email..." 
            className="w-full sm:max-w-md" 
          />
          <div className="flex items-center gap-3">
            <select 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-500"
            >
              <option value="all">All Tickets</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50/50 dark:bg-surface-900/50 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium">Ticket ID & Subject</th>
                <th className="p-4 font-medium">Sender</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date Created</th>
                <th className="p-4 pr-6 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-surface-500">Loading tickets...</td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-surface-500">No tickets found.</td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-surface-900 dark:text-white mb-0.5">{ticket.subject}</p>
                      <p className="text-xs font-mono text-surface-500">{ticket.id.substring(0, 8)}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-surface-900 dark:text-white">{ticket.name}</p>
                      <span className="text-xs text-surface-500">{ticket.email}</span>
                    </td>
                    <td className="p-4">
                      <Badge variant={ticket.status === 'open' ? 'warning' : 'success'}>
                        {ticket.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 text-surface-600 dark:text-surface-400">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="w-3.5 h-3.5" /> {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {ticket.status === 'open' ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          onClick={() => handleUpdateStatus(ticket.id, 'resolved')}
                        >
                          Mark Resolved
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          leftIcon={<Reply className="w-4 h-4" />}
                          onClick={() => handleUpdateStatus(ticket.id, 'open')}
                        >
                          Re-open
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
