import React, { useState, useEffect } from 'react'
import { Plus, X, MessageSquare, Clock, CheckCircle2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { supportApi } from '../../api/services/supportApi'
import { useAuthStore } from '../../store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/helpers'

export default function CustomerSupport() {
  const { user } = useAuthStore()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  })

  const [selectedTicket, setSelectedTicket] = useState(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const data = await supportApi.getMyTickets()
      setTickets(data)
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
      toast.error('Failed to load your support tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Subject and message are required')
      return
    }

    try {
      toast.loading('Submitting ticket...', { id: 'submit-ticket' })
      await supportApi.createTicket({
        name: user?.name || 'Customer',
        email: user?.email || '',
        subject: formData.subject,
        message: formData.message
      })
      toast.success('Ticket submitted successfully', { id: 'submit-ticket' })
      setIsModalOpen(false)
      setFormData({ subject: '', message: '' })
      fetchTickets()
    } catch (error) {
      console.error('Failed to submit ticket:', error)
      toast.error('Failed to submit ticket', { id: 'submit-ticket' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Support & Inquiries</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Need help? Submit a ticket and our team will get back to you.</p>
        </div>
        <Button 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          New Ticket
        </Button>
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-50 dark:bg-surface-800/50 text-surface-500 dark:text-surface-400">
              <tr>
                <th className="p-4 pl-6 font-medium">Ticket ID & Subject</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date Created</th>
                <th className="p-4 pr-6 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-surface-500">You haven't submitted any tickets yet.</td>
                </tr>
              ) : (
                tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-surface-900 dark:text-white">{ticket.subject}</span>
                        <span className="text-xs text-surface-500 truncate max-w-xs">{ticket.message}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={ticket.status === 'open' ? 'warning' : 'success'}>
                        {ticket.status === 'open' ? (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Open</span>
                        ) : (
                          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Resolved</span>
                        )}
                      </Badge>
                    </td>
                    <td className="p-4 text-surface-600 dark:text-surface-400">
                      {ticket.created_at ? formatDate(ticket.created_at) : 'N/A'}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(ticket)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-surface-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-surface-200 dark:border-surface-800 flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between sticky top-0 bg-white dark:bg-surface-900">
                <div>
                  <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-brand-500" />
                    Ticket Details
                  </h2>
                  <p className="text-xs text-surface-500 font-mono mt-1">ID: {selectedTicket.id}</p>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                <div className="space-y-4">
                  <div className="bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl border border-surface-200 dark:border-surface-700/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-surface-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(selectedTicket.created_at).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-surface-900 dark:text-white mt-1 mb-2">{selectedTicket.subject}</h4>
                    <p className="text-surface-700 dark:text-surface-300 text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                  </div>

                  {selectedTicket.admin_reply && (
                    <div className="bg-brand-50 dark:bg-brand-900/10 p-4 rounded-xl border border-brand-100 dark:border-brand-900/30 ml-8">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-brand-900 dark:text-brand-400 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Support Team Reply
                        </p>
                      </div>
                      <p className="text-brand-800 dark:text-brand-300 text-sm whitespace-pre-wrap">{selectedTicket.admin_reply}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-surface-200 dark:border-surface-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-surface-900">
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-surface-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-surface-200 dark:border-surface-800"
            >
              <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-500" />
                  Submit a Ticket
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-2 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    placeholder="Briefly describe your issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Message</label>
                  <textarea 
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-2 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                    placeholder="Provide details about your inquiry..."
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Submit Ticket</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
