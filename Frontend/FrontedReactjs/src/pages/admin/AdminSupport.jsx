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

  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')

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

  const handleUpdateStatus = async (ticketId, newStatus, reply = null) => {
    try {
      toast.loading(reply ? 'Sending reply...' : `Marking ticket as ${newStatus}...`, { id: 'update-ticket' })
      await adminApi.updateSupportTicket(ticketId, newStatus, reply)
      toast.success(reply ? 'Reply sent successfully!' : `Ticket marked as ${newStatus}`, { id: 'update-ticket' })
      setSelectedTicket(null)
      setReplyMessage('')
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
                          leftIcon={<MessageSquare className="w-4 h-4" />}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          View & Reply
                        </Button>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            leftIcon={<Reply className="w-4 h-4" />}
                            onClick={() => handleUpdateStatus(ticket.id, 'open')}
                          >
                            Re-open
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-surface-200 dark:border-surface-800 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between sticky top-0 bg-white dark:bg-surface-900">
              <div>
                <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-500" />
                  Ticket Details
                </h2>
                <p className="text-xs text-surface-500 font-mono mt-1">ID: {selectedTicket.id}</p>
              </div>
              <button onClick={() => { setSelectedTicket(null); setReplyMessage(''); }} className="p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800">
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="space-y-4">
                <div className="bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl border border-surface-200 dark:border-surface-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-surface-900 dark:text-white">{selectedTicket.name}</p>
                      <p className="text-sm text-surface-500">{selectedTicket.email}</p>
                    </div>
                    <span className="text-xs text-surface-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(selectedTicket.created_at).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-surface-900 dark:text-white mt-4 mb-2">{selectedTicket.subject}</h4>
                  <p className="text-surface-700 dark:text-surface-300 text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                {selectedTicket.admin_reply && (
                  <div className="bg-brand-50 dark:bg-brand-900/10 p-4 rounded-xl border border-brand-100 dark:border-brand-900/30 ml-8">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-brand-900 dark:text-brand-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Admin Reply
                      </p>
                    </div>
                    <p className="text-brand-800 dark:text-brand-300 text-sm whitespace-pre-wrap">{selectedTicket.admin_reply}</p>
                  </div>
                )}
              </div>
              
              {selectedTicket.status === 'open' && (
                <div className="space-y-2 mt-6">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Your Reply</label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm outline-none resize-none text-surface-900 dark:text-white"
                    placeholder="Type your response to the user here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-surface-200 dark:border-surface-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-surface-900">
              <Button variant="outline" onClick={() => { setSelectedTicket(null); setReplyMessage(''); }}>
                Close
              </Button>
              {selectedTicket.status === 'open' && (
                <Button 
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved', replyMessage)}
                  disabled={!replyMessage.trim()}
                  leftIcon={<Reply className="w-4 h-4" />}
                >
                  Send Reply & Resolve
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
