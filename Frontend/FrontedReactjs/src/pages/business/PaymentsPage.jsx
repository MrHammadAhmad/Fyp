import React, { useState, useEffect, useMemo } from 'react'
import { CreditCard, ArrowDownRight, ArrowUpRight, DollarSign, Loader2, X, AlertCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import { formatPrice, formatDate } from '../../utils/helpers'
import { bookingApi } from '../../api/services/bookingApi'
import { payoutApi } from '../../api/services/payoutApi'
import { businessApi } from '../../api/services/businessApi'
import { useBusinessRefreshStore } from '../../store/businessRefreshStore'
import showToast from '../../components/ui/Toast'
import * as Dialog from '@radix-ui/react-dialog'

export default function PaymentsPage() {
  const [salonId, setSalonId] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [manualCharges, setManualCharges] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [payoutAccount, setPayoutAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Modal states
  const [isEditBankModalOpen, setIsEditBankModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false)
  const [confirmPaymentId, setConfirmPaymentId] = useState(null)

  // Bank form
  const [bankForm, setBankForm] = useState({ bank_name: 'Chase Bank', account_last4: '8899', routing_last4: '1122' })

  // Withdraw form
  const [withdrawAmount, setWithdrawAmount] = useState('')

  // Charge form
  const [chargeForm, setChargeForm] = useState({ customer_name: '', amount: '', description: 'Manual Charge' })

  const refreshKey = useBusinessRefreshStore((s) => s.refreshKey)

  // Load everything from real API on mount
  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true)
        const salon = await businessApi.getMySalon()
        if (!salon?.id) return
        const sid = salon.id
        setSalonId(sid)

        const [appts, charges, wds, account] = await Promise.all([
          bookingApi.getMyBookings().catch(() => []),
          payoutApi.getCharges(sid).catch(() => []),
          payoutApi.getWithdrawals(sid).catch(() => []),
          payoutApi.getAccount(sid).catch(() => null)
        ])

        setAppointments(appts || [])
        setManualCharges(charges || [])
        setWithdrawals(wds || [])
        setPayoutAccount(account || null)

        // Pre-fill bank form if account exists
        if (account) {
          setBankForm({
            bank_name: account.bank_name,
            account_last4: account.account_last4,
            routing_last4: account.routing_last4
          })
        }
      } catch (err) {
        console.error(err)
        showToast.error('Failed to load payment data.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [refreshKey])

  // ── Merge all transactions for display ──────────────────────────
  const transactions = useMemo(() => {
    // Appointment-based transactions
    const apptTx = appointments
      .filter(a => a.payment_status === 'paid' || a.payment_status === 'unpaid')
      .map(a => ({
        id: a.id,
        ref: `APT-${a.id.substring(0, 8).toUpperCase()}`,
        customer: a.customer_name || 'Customer',
        date: a.date,
        method: a.booking_type === 'online' ? 'Online / Card' : 'Walk-in / Cash',
        amount: parseFloat(a.price || 0),
        status: a.payment_status === 'paid' ? 'paid' : 'pending',
        type: 'appointment'
      }))

    // Manual charges from DB
    const chargeTx = manualCharges.map(c => ({
      id: c.id,
      ref: `CHG-${c.id.substring(0, 6).toUpperCase()}`,
      customer: c.customer_name,
      date: c.created_at,
      method: 'Card Payment',
      amount: parseFloat(c.amount),
      status: c.status,
      type: 'charge'
    }))

    // Withdrawals from DB (shown as negative/debit)
    const withdrawTx = withdrawals.map(w => ({
      id: w.id,
      ref: `WITH-${w.id.substring(0, 6).toUpperCase()}`,
      customer: 'Withdrawal to Bank',
      date: w.created_at,
      method: 'ACH Transfer',
      amount: -parseFloat(w.amount),
      status: 'paid',
      type: 'withdrawal'
    }))

    return [...apptTx, ...chargeTx, ...withdrawTx]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [appointments, manualCharges, withdrawals])

  // ── KPI Calculations ──────────────────────────────────────────
  const totalRevenue = useMemo(() => {
    const paid = transactions
      .filter(t => t.status === 'paid' && t.amount > 0)
      .reduce((s, t) => s + t.amount, 0)
    const withdrawn = withdrawals.reduce((s, w) => s + parseFloat(w.amount), 0)
    return Math.max(0, paid - withdrawn)
  }, [transactions, withdrawals])

  const pendingRevenue = useMemo(() =>
    transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0)
  , [transactions])

  // ── Save Bank Account ────────────────────────────────────────
  const handleSaveBank = async (e) => {
    e.preventDefault()
    if (!bankForm.bank_name.trim() || bankForm.account_last4.length < 4 || bankForm.routing_last4.length < 4) {
      return showToast.error('Please fill in all bank details correctly.')
    }
    setSubmitting(true)
    try {
      if (payoutAccount?.id) {
        // Update existing
        const updated = await payoutApi.updateAccount(payoutAccount.id, bankForm)
        setPayoutAccount(updated)
      } else {
        // Create new
        const created = await payoutApi.saveAccount({ salon_id: salonId, ...bankForm })
        setPayoutAccount(created)
      }
      showToast.success('Payout bank account saved to database!')
      setIsEditBankModalOpen(false)
    } catch (err) {
      console.error(err)
      showToast.error('Failed to save bank details.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Withdraw ─────────────────────────────────────────────────
  const handleWithdraw = async (e) => {
    e.preventDefault()
    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) return showToast.error('Please enter a valid withdrawal amount.')
    if (amount > totalRevenue) return showToast.error('Amount exceeds available revenue.')
    if (!payoutAccount?.id) return showToast.error('Please set a payout bank account first.')

    setSubmitting(true)
    try {
      const wd = await payoutApi.createWithdrawal({
        salon_id: salonId,
        amount,
        payout_account_id: payoutAccount.id
      })
      setWithdrawals(prev => [wd, ...prev])
      showToast.success(`Successfully transferred ${formatPrice(amount)} to ${payoutAccount.bank_name}!`)
      setWithdrawAmount('')
      setIsWithdrawModalOpen(false)
    } catch (err) {
      console.error(err)
      showToast.error('Failed to process withdrawal.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Charge Card ──────────────────────────────────────────────
  const handleChargeCard = async (e) => {
    e.preventDefault()
    if (!chargeForm.customer_name.trim()) return showToast.error('Please enter customer name.')
    const amount = parseFloat(chargeForm.amount)
    if (isNaN(amount) || amount <= 0) return showToast.error('Please enter a valid amount.')

    setSubmitting(true)
    try {
      const charge = await payoutApi.createCharge({
        salon_id: salonId,
        customer_name: chargeForm.customer_name.trim(),
        description: chargeForm.description || 'Manual Charge',
        amount
      })
      setManualCharges(prev => [charge, ...prev])
      showToast.success('Card charged and saved to database!')
      setChargeForm({ customer_name: '', amount: '', description: 'Manual Charge' })
      setIsChargeModalOpen(false)
    } catch (err) {
      console.error(err)
      showToast.error('Failed to charge card.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Mark pending appointment as collected ────────────────────
  const handleSettlePayment = async () => {
    if (confirmPaymentId) {
      try {
        await bookingApi.updateStatus(confirmPaymentId, { payment_status: 'paid' })
        setAppointments(prev =>
          prev.map(a => a.id === confirmPaymentId ? { ...a, payment_status: 'paid' } : a)
        )
        showToast.success('Payment marked as collected!')
      } catch (err) {
        showToast.error('Failed to update payment status.')
      } finally {
        setConfirmPaymentId(null)
      }
    }
  }

  const displayBank = payoutAccount || { bank_name: 'Chase Bank', account_last4: '––––', routing_last4: '––––' }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Payments & Payouts</h1>
          <p className="text-surface-500">Manage your revenue, transactions, and bank payouts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Card */}
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-6 shadow-sm">
          <p className="text-surface-500 text-sm mb-1">Total Available Revenue (Paid)</p>
          <h2 className="text-3xl font-extrabold text-surface-900 dark:text-white mb-4">
            {loading ? '—' : formatPrice(totalRevenue)}
          </h2>
          <Button fullWidth variant="primary" onClick={() => setIsWithdrawModalOpen(true)}>
            Withdraw
          </Button>
        </div>

        {/* Pending Card */}
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-6 shadow-sm">
          <p className="text-surface-500 text-sm mb-1">Pending Revenue</p>
          <h2 className="text-3xl font-extrabold text-amber-500 mb-4">
            {loading ? '—' : formatPrice(pendingRevenue)}
          </h2>
          <p className="text-xs text-surface-400">Awaiting payment collection from walk-in clients</p>
        </div>

      </div>

      {/* Transaction Table */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-surface-200 dark:border-surface-800">
          <h3 className="font-bold text-surface-900 dark:text-white">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50/50 dark:bg-surface-900/50 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  <th className="p-4 pl-6 font-medium">Transaction</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Method</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 pr-6 text-right font-medium">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-sm">
                {transactions.length > 0 ? transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.amount < 0 ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : tx.status === 'paid' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400'
                        }`}>
                          {tx.amount < 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-surface-900 dark:text-white">{tx.ref}</p>
                          <p className="text-xs text-surface-500 capitalize">{tx.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-surface-600 dark:text-surface-300 font-medium">{tx.customer}</td>
                    <td className="p-4 text-surface-600 dark:text-surface-300">{formatDate(tx.date)}</td>
                    <td className="p-4 text-surface-600 dark:text-surface-300">{tx.method}</td>
                    <td className={`p-4 font-bold ${tx.amount < 0 ? 'text-red-500' : 'text-surface-900 dark:text-white'}`}>
                      {formatPrice(Math.abs(tx.amount))}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {tx.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">PENDING</span>
                          <button onClick={() => setConfirmPaymentId(tx.id)} className="text-xs font-bold text-brand-600 hover:underline">Collect</button>
                        </div>
                      ) : (
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          tx.amount < 0 ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                          {tx.amount < 0 ? 'TRANSFERRED' : 'PAID'}
                        </span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-surface-500">No transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Bank Modal */}
      <Dialog.Root open={isEditBankModalOpen} onOpenChange={setIsEditBankModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-surface-900 rounded-3xl p-6 w-[90vw] max-w-md shadow-xl z-50 focus:outline-none border border-surface-100 dark:border-surface-800">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-bold text-surface-900 dark:text-white">
                {payoutAccount ? 'Edit Payout Details' : 'Add Payout Account'}
              </Dialog.Title>
              <Dialog.Close className="text-surface-400 hover:text-surface-600"><X size={20} /></Dialog.Close>
            </div>
            <form onSubmit={handleSaveBank} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Bank Name</label>
                <input type="text" value={bankForm.bank_name} onChange={e => setBankForm({...bankForm, bank_name: e.target.value})}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                  placeholder="Chase Bank" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Account Last 4</label>
                  <input type="text" maxLength="4" value={bankForm.account_last4} onChange={e => setBankForm({...bankForm, account_last4: e.target.value.replace(/\D/g, '')})}
                    className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                    placeholder="8899" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Routing Last 4</label>
                  <input type="text" maxLength="4" value={bankForm.routing_last4} onChange={e => setBankForm({...bankForm, routing_last4: e.target.value.replace(/\D/g, '')})}
                    className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                    placeholder="1122" required />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-800 mt-6">
                <Dialog.Close asChild><Button variant="outline" type="button">Cancel</Button></Dialog.Close>
                <Button variant="brand" type="submit" disabled={submitting}>
                  {submitting ? <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Saving...</span> : 'Save Details'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Withdraw Modal */}
      <Dialog.Root open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-surface-900 rounded-3xl p-6 w-[90vw] max-w-sm shadow-xl z-50 focus:outline-none border border-surface-100 dark:border-surface-800 text-center">
            <div className="flex justify-end">
              <Dialog.Close className="text-surface-400 hover:text-surface-600"><X size={20} /></Dialog.Close>
            </div>
            <div className="py-4">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <Dialog.Title className="text-xl font-bold text-surface-900 dark:text-white mb-2">Set Account first</Dialog.Title>
              <p className="text-sm text-surface-500">Please set up a payout bank account before withdrawing funds.</p>
            </div>
            <div className="pt-4 mt-2">
              <Dialog.Close asChild><Button fullWidth variant="primary">Understood</Button></Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Charge Card Modal */}
      <Dialog.Root open={isChargeModalOpen} onOpenChange={setIsChargeModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-surface-900 rounded-3xl p-6 w-[90vw] max-w-md shadow-xl z-50 focus:outline-none border border-surface-100 dark:border-surface-800">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-bold text-surface-900 dark:text-white">Charge Card</Dialog.Title>
              <Dialog.Close className="text-surface-400 hover:text-surface-600"><X size={20} /></Dialog.Close>
            </div>
            <form onSubmit={handleChargeCard} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Customer Name</label>
                <input type="text" value={chargeForm.customer_name} onChange={e => setChargeForm({...chargeForm, customer_name: e.target.value})}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                  placeholder="e.g. John Doe" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Description</label>
                <input type="text" value={chargeForm.description} onChange={e => setChargeForm({...chargeForm, description: e.target.value})}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                  placeholder="e.g. Styling & Wash" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Amount ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
                  <input type="number" min="1" step="0.01" value={chargeForm.amount} onChange={e => setChargeForm({...chargeForm, amount: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                    placeholder="0.00" required />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-800 mt-6">
                <Dialog.Close asChild><Button variant="outline" type="button">Cancel</Button></Dialog.Close>
                <Button variant="brand" type="submit" disabled={submitting}>
                  {submitting ? <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Charging...</span> : 'Charge Card'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {/* Confirm Payment Modal */}
      <Dialog.Root open={!!confirmPaymentId} onOpenChange={(open) => !open && setConfirmPaymentId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-surface-900 rounded-3xl p-6 w-[90vw] max-w-sm shadow-xl z-50 focus:outline-none border border-surface-100 dark:border-surface-800 text-center">
            <div className="py-2">
              <Dialog.Title className="text-xl font-bold text-surface-900 dark:text-white mb-2">Mark as PAID/Collected?</Dialog.Title>
              <p className="text-sm text-surface-500 mb-6">Are you sure you want to mark this transaction as collected?</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmPaymentId(null)}>Cancel</Button>
                <Button variant="primary" className="flex-1" onClick={handleSettlePayment}>Confirm</Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
