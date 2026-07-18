import React, { useState, useEffect } from 'react'
import { Wallet as WalletIcon, CreditCard, ArrowUpRight, ArrowDownRight, Plus, Loader2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import { formatPrice, formatDate } from '../../utils/helpers'
import { paymentApi } from '../../api/services/paymentApi'
import PromptModal from '../../components/ui/PromptModal'
import toast from 'react-hot-toast'

export default function Wallet() {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [], loyaltyPoints: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isTopUping, setIsTopUping] = useState(false)
  const [isTopUpPromptOpen, setIsTopUpPromptOpen] = useState(false)

  const fetchWalletData = async () => {
    try {
      setIsLoading(true)
      const data = await paymentApi.getWalletBalance()
      setWallet(data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load wallet data.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWalletData()
  }, [])

  const handleAddFunds = () => {
    setIsTopUpPromptOpen(true)
  }

  const processTopUp = async (amountStr) => {
    if (!amountStr) return
    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive number.")
      return
    }

    try {
      setIsTopUping(true)
      await paymentApi.processPayment({ amount })
      toast.success("Wallet topped up successfully!")
      
      // Reload wallet details
      const updated = await paymentApi.getWalletBalance()
      setWallet(updated)
    } catch (error) {
      console.error(error)
      toast.error("Failed to top up wallet.")
    } finally {
      setIsTopUping(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#405742] w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Wallet & Payments</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">Manage your payment methods and view history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#405742] rounded-3xl p-6 text-white shadow-lg shadow-[#405742]/25">
            <div className="flex items-center gap-2 mb-8 opacity-80">
              <WalletIcon className="w-5 h-5" />
              <span className="font-medium text-sm">Personalized AI Balance</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-8">Rs. {wallet.balance.toFixed(2)}</h2>
            <Button 
              variant="white" 
              fullWidth 
              leftIcon={isTopUping ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
              onClick={handleAddFunds}
              disabled={isTopUping}
            >
              {isTopUping ? 'Processing...' : 'Add Funds'}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">
            <h3 className="font-bold text-surface-900 dark:text-white mb-6">Recent Transactions</h3>
            
            <div className="space-y-4">
              {wallet.transactions.length > 0 ? (
                wallet.transactions.map(tx => (
                  <div key={tx.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'payment' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                      'bg-[#405742]/10 dark:bg-[#405742]/15 text-[#405742] dark:text-[#5a7a62]'
                    }`}>
                      {tx.type === 'payment' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{tx.title}</p>
                      <p className="text-xs text-surface-500 truncate">{tx.business || 'Beauty Personalized AI System'} • {formatDate(tx.date)}</p>
                    </div>
                    <span className={`font-bold ${
                      tx.type === 'payment' ? 'text-surface-900 dark:text-white' : 'text-[#405742] dark:text-[#5a7a62]'
                    }`}>
                      {tx.type === 'payment' ? '-' : '+'}{formatPrice(tx.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-surface-500 py-4 text-center">No transactions found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <PromptModal
        isOpen={isTopUpPromptOpen}
        onClose={() => setIsTopUpPromptOpen(false)}
        onSubmit={processTopUp}
        title="Top Up Wallet"
        message="Enter amount to top up (Rs):"
        defaultValue="50.00"
      />
    </div>
  )
}
