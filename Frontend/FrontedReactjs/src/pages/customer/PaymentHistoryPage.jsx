import React, { useState } from 'react'
import { Receipt, Search, Filter, Download, ArrowUpRight } from 'lucide-react'
import Button from '../../components/ui/Button'
import * as Dialog from '@radix-ui/react-dialog'

const MOCK_PAYMENTS = [
  { id: 'TRX-10293', date: '2026-10-15', amount: 85.00, method: 'Credit Card', status: 'verified', salon: 'Elegant Style Salon', service: 'Hair Coloring' },
  { id: 'TRX-10292', date: '2026-09-28', amount: 45.00, method: 'Cash on Service', status: 'pending', salon: 'The Grooming Lounge', service: 'Men Haircut' },
  { id: 'TRX-10291', date: '2026-08-14', amount: 120.00, method: 'Credit Card', status: 'failed', salon: 'Luxe Skin Care', service: 'Deep Cleansing Facial' },
  { id: 'TRX-10290', date: '2026-07-02', amount: 35.00, method: 'Wallet', status: 'verified', salon: 'Elegant Style Salon', service: 'Blow Dry' },
]

export default function PaymentHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTx, setSelectedTx] = useState(null)

  const filteredPayments = MOCK_PAYMENTS.filter(p => 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.salon.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.service.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Verified</span>
      case 'pending':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</span>
      case 'failed':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Failed</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <Receipt className="text-brand-500" />
            Payment History
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            View your past transactions and download receipts.
          </p>
        </div>
        <Button variant="outline" leftIcon={<Download size={18} />}>
          Export PDF
        </Button>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 overflow-hidden">
        <div className="p-4 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, salon or service..."
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
                <th className="py-3 px-4 font-medium">Transaction ID</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Details</th>
                <th className="py-3 px-4 font-medium">Method</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(tx => (
                <tr key={tx.id} className="border-b border-surface-100 dark:border-surface-800/50 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="py-4 px-4 font-medium text-surface-900 dark:text-white">{tx.id}</td>
                  <td className="py-4 px-4 text-surface-600 dark:text-surface-400">{tx.date}</td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-surface-900 dark:text-white">{tx.salon}</p>
                    <p className="text-xs text-surface-500">{tx.service}</p>
                  </td>
                  <td className="py-4 px-4 text-surface-600 dark:text-surface-400">{tx.method}</td>
                  <td className="py-4 px-4 font-bold text-surface-900 dark:text-white">${tx.amount.toFixed(2)}</td>
                  <td className="py-4 px-4">{getStatusBadge(tx.status)}</td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => setSelectedTx(tx)}
                      className="p-2 text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20 rounded-lg transition-colors inline-flex"
                      title="View Details"
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-surface-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <Dialog.Root open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-surface-900 rounded-3xl p-6 w-[90vw] max-w-md shadow-xl z-50 focus:outline-none">
            {selectedTx && (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Dialog.Title className="text-xl font-bold text-surface-900 dark:text-white">
                      Transaction Details
                    </Dialog.Title>
                    <p className="text-sm text-surface-500">{selectedTx.id}</p>
                  </div>
                  {getStatusBadge(selectedTx.status)}
                </div>

                <div className="space-y-4 bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl border border-surface-200 dark:border-surface-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Date</span>
                    <span className="font-medium text-surface-900 dark:text-white">{selectedTx.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Salon</span>
                    <span className="font-medium text-surface-900 dark:text-white">{selectedTx.salon}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Service</span>
                    <span className="font-medium text-surface-900 dark:text-white">{selectedTx.service}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Payment Method</span>
                    <span className="font-medium text-surface-900 dark:text-white">{selectedTx.method}</span>
                  </div>
                  <div className="pt-4 mt-2 border-t border-surface-200 dark:border-surface-700 flex justify-between">
                    <span className="font-bold text-surface-900 dark:text-white">Total Amount</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">${selectedTx.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedTx(null)}>Close</Button>
                  <Button variant="primary" className="flex-1" leftIcon={<Download size={18} />}>Download Receipt</Button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  )
}
