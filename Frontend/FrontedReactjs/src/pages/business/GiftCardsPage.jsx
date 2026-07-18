import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Gift, Copy, MoreHorizontal, X, DollarSign, Loader2, Check, RefreshCw } from 'lucide-react'
import Button from '../../components/ui/Button'
import { formatPrice, formatDate } from '../../utils/helpers'
import * as Dialog from '@radix-ui/react-dialog'
import showToast from '../../components/ui/Toast'
import ConfirmModal from '../../components/ui/ConfirmModal'

export default function GiftCardsPage() {
  const [giftCards, setGiftCards] = useState([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false)
  
  // Add Gift Card Form State
  const [newCard, setNewCard] = useState({
    purchaser: '',
    balance: '',
    code: ''
  })

  // Redeem Form State
  const [selectedCard, setSelectedCard] = useState(null)
  const [redeemAmount, setRedeemAmount] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [actionConfirm, setActionConfirm] = useState({ isOpen: false, cardId: null, actionType: null })

  // Load plans from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('salon_gift_cards')
    if (saved) {
      try {
        setGiftCards(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse gift cards', e)
      }
    } else {
      const defaults = [
        {
          id: 'gift-1',
          code: 'GIFT-A8B9-X2F4',
          purchaser: 'Alice Johnson',
          date: new Date().toISOString(),
          balance: 75.00,
          originalBalance: 100.00,
          status: 'active',
          redeemedThisMonth: 25.00
        },
        {
          id: 'gift-2',
          code: 'GIFT-H3N1-K8P9',
          purchaser: 'Bob Smith',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          balance: 50.00,
          originalBalance: 50.00,
          status: 'active',
          redeemedThisMonth: 0.00
        }
      ]
      setGiftCards(defaults)
      localStorage.setItem('salon_gift_cards', JSON.stringify(defaults))
    }
  }, [])

  // Save helper
  const saveToStorage = (updated) => {
    setGiftCards(updated)
    localStorage.setItem('salon_gift_cards', JSON.stringify(updated))
  }

  // Generate a random gift card code
  const generateGiftCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let part1 = ''
    let part2 = ''
    for (let i = 0; i < 4; i++) {
      part1 += chars.charAt(Math.floor(Math.random() * chars.length))
      part2 += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `GIFT-${part1}-${part2}`
  }

  // Open add modal and generate a code
  const handleOpenAddModal = () => {
    setNewCard({
      purchaser: '',
      balance: '',
      code: generateGiftCode()
    })
    setIsAddModalOpen(true)
  }

  // Copy code to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    showToast.success('Code copied to clipboard!')
  }

  // Create Gift Card
  const handleCreateGiftCard = (e) => {
    e.preventDefault()
    if (!newCard.purchaser.trim()) {
      showToast.error('Please enter purchaser name.')
      return
    }
    if (newCard.balance === '' || isNaN(newCard.balance) || parseFloat(newCard.balance) <= 0) {
      showToast.error('Please enter a valid balance.')
      return
    }

    setSubmitting(true)

    const created = {
      id: `gift-${Date.now()}`,
      code: newCard.code,
      purchaser: newCard.purchaser.trim(),
      date: new Date().toISOString(),
      balance: parseFloat(newCard.balance),
      originalBalance: parseFloat(newCard.balance),
      status: 'active',
      redeemedThisMonth: 0.00
    }

    const updated = [created, ...giftCards]
    saveToStorage(updated)
    showToast.success('Gift card issued successfully!')
    setIsAddModalOpen(false)
    setSubmitting(false)
  }

  // Open Redeem Modal
  const handleOpenRedeemModal = (card) => {
    setSelectedCard(card)
    setRedeemAmount('')
    setIsRedeemModalOpen(true)
    setMenuOpenId(null)
  }

  // Redeem Gift Card Balance
  const handleRedeem = (e) => {
    e.preventDefault()
    if (!selectedCard) return
    const amount = parseFloat(redeemAmount)
    if (isNaN(amount) || amount <= 0) {
      showToast.error('Please enter a valid amount.')
      return
    }
    if (amount > selectedCard.balance) {
      showToast.error(`Deduction amount exceeds current card balance (${formatPrice(selectedCard.balance)}).`)
      return
    }

    const updated = giftCards.map(card => {
      if (card.id === selectedCard.id) {
        const nextBalance = card.balance - amount
        return {
          ...card,
          balance: nextBalance,
          redeemedThisMonth: (card.redeemedThisMonth || 0) + amount,
          status: nextBalance <= 0 ? 'fully_redeemed' : 'active'
        }
      }
      return card
    })

    saveToStorage(updated)
    showToast.success('Amount redeemed successfully!')
    setIsRedeemModalOpen(false)
  }

  // Void Gift Card
  const handleVoidCard = (id) => {
    setActionConfirm({ isOpen: true, cardId: id, actionType: 'void' })
  }

  // Delete Gift Card record
  const handleDeleteCard = (id) => {
    setActionConfirm({ isOpen: true, cardId: id, actionType: 'delete' })
  }

  const confirmAction = () => {
    if (!actionConfirm.cardId) return

    if (actionConfirm.actionType === 'void') {
      const updated = giftCards.map(card => {
        if (card.id === actionConfirm.cardId) {
          return { ...card, status: 'voided' }
        }
        return card
      })
      saveToStorage(updated)
      showToast.success('Gift card has been voided.')
      setMenuOpenId(null)
    } else if (actionConfirm.actionType === 'delete') {
      const updated = giftCards.filter(card => card.id !== actionConfirm.cardId)
      saveToStorage(updated)
      showToast.success('Gift card record deleted.')
      setMenuOpenId(null)
    }
  }

  // Dynamic KPI Stats
  const kpis = useMemo(() => {
    let totalOutstanding = 0
    let totalRedeemedMonth = 0
    let cardsSoldMonth = 0

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    giftCards.forEach(card => {
      if (card.status === 'active') {
        totalOutstanding += card.balance
      }
      
      const cardDate = new Date(card.date)
      if (cardDate.getMonth() === currentMonth && cardDate.getFullYear() === currentYear) {
        cardsSoldMonth += 1
      }
      totalRedeemedMonth += (card.redeemedThisMonth || 0)
    })

    return {
      outstanding: totalOutstanding,
      redeemed: totalRedeemedMonth,
      soldCount: cardsSoldMonth
    }
  }, [giftCards])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Gift Cards</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Manage digital gift cards and track redemptions.</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAddModal}>Issue Gift Card</Button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#405742] rounded-3xl p-6 text-white shadow-lg shadow-[#405742]/25">
          <Gift className="w-8 h-8 opacity-80 mb-4" />
          <p className="text-white/80 text-sm mb-1">Total Outstanding Balance</p>
          <h2 className="text-3xl font-extrabold">{formatPrice(kpis.outstanding)}</h2>
        </div>
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-6 shadow-sm">
          <p className="text-surface-500 text-sm mb-1">Cards Issued This Month</p>
          <h2 className="text-3xl font-extrabold text-surface-900 dark:text-white">{kpis.soldCount}</h2>
        </div>
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-6 shadow-sm">
          <p className="text-surface-500 text-sm mb-1">Total Redeemed (All Time)</p>
          <h2 className="text-3xl font-extrabold text-surface-900 dark:text-white">{formatPrice(kpis.redeemed)}</h2>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-surface-200 dark:border-surface-800">
          <h3 className="font-bold text-surface-900 dark:text-white">Recent Sales & Redemptions</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50/50 dark:bg-surface-900/50 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium">Card Code</th>
                <th className="p-4 font-medium">Purchaser</th>
                <th className="p-4 font-medium">Date Issued</th>
                <th className="p-4 font-medium">Current Balance</th>
                <th className="p-4 font-medium">Original Value</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 pr-6 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-sm">
              {giftCards.length > 0 ? (
                giftCards.map((card) => (
                  <tr key={card.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-surface-900 dark:text-white">{card.code}</span>
                        <button 
                          onClick={() => handleCopyCode(card.code)}
                          className="text-surface-400 hover:text-brand-600 transition-colors" 
                          title="Copy code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-surface-600 dark:text-surface-300">
                      {card.purchaser}
                    </td>
                    <td className="p-4 text-surface-600 dark:text-surface-300">
                      {formatDate(card.date)}
                    </td>
                    <td className="p-4 font-bold text-surface-900 dark:text-white">
                      {formatPrice(card.balance)}
                    </td>
                    <td className="p-4 text-surface-500">
                      {formatPrice(card.originalBalance)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                        card.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : card.status === 'fully_redeemed'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {card.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right relative">
                      <button 
                        onClick={() => setMenuOpenId(menuOpenId === card.id ? null : card.id)}
                        className="p-2 rounded-lg text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>

                      {menuOpenId === card.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                          <div className="absolute right-6 top-12 w-48 bg-white dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl shadow-lg z-25 py-2">
                            {card.status === 'active' && (
                              <button 
                                onClick={() => handleOpenRedeemModal(card)}
                                className="w-full text-left px-4 py-2 hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300 font-medium transition-colors"
                              >
                                Redeem Balance
                              </button>
                            )}
                            {card.status === 'active' && (
                              <button 
                                onClick={() => handleVoidCard(card.id)}
                                className="w-full text-left px-4 py-2 hover:bg-surface-50 dark:hover:bg-surface-800 text-red-600 dark:text-red-400 font-medium transition-colors"
                              >
                                Void / Cancel
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteCard(card.id)}
                              className="w-full text-left px-4 py-2 hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-500 hover:text-red-500 font-medium transition-colors"
                            >
                              Delete Record
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-surface-500">
                    No gift cards issued yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Radix Dialog for Issue Gift Card */}
      <Dialog.Root open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-surface-900 rounded-3xl p-6 w-[90vw] max-w-md shadow-xl z-50 focus:outline-none border border-surface-100 dark:border-surface-800">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-bold text-surface-900 dark:text-white">
                Issue Digital Gift Card
              </Dialog.Title>
              <Dialog.Close className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200">
                <X size={20} />
              </Dialog.Close>
            </div>
            
            <form onSubmit={handleCreateGiftCard} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Gift Card Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCard.code}
                    disabled
                    className="w-full px-4 py-2 bg-surface-100 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 rounded-xl outline-none font-mono font-bold dark:text-white cursor-not-allowed"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setNewCard({...newCard, code: generateGiftCode()})}
                    title="Generate new code"
                  >
                    <RefreshCw size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Purchaser Name</label>
                <input 
                  type="text" 
                  value={newCard.purchaser}
                  onChange={(e) => setNewCard({...newCard, purchaser: e.target.value})}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                  placeholder="e.g. Alice Cooper"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Gift Value (Rs)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
                  <input 
                    type="number" 
                    min="5"
                    step="5"
                    value={newCard.balance}
                    onChange={(e) => setNewCard({...newCard, balance: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                    placeholder="100.00"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-800 mt-6">
                <Dialog.Close asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button variant="brand" type="submit" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Issuing...
                    </span>
                  ) : 'Issue Card'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Radix Dialog for Redeem Balance */}
      <Dialog.Root open={isRedeemModalOpen} onOpenChange={setIsRedeemModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-surface-900 rounded-3xl p-6 w-[90vw] max-w-md shadow-xl z-50 focus:outline-none border border-surface-100 dark:border-surface-800">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-bold text-surface-900 dark:text-white">
                Redeem Gift Card Balance
              </Dialog.Title>
              <Dialog.Close className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200">
                <X size={20} />
              </Dialog.Close>
            </div>
            
            {selectedCard && (
              <form onSubmit={handleRedeem} className="space-y-4">
                <div className="p-4 bg-surface-50 dark:bg-surface-850 rounded-xl space-y-2 border border-surface-100 dark:border-surface-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Code:</span>
                    <span className="font-mono font-bold dark:text-white">{selectedCard.code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Purchaser:</span>
                    <span className="font-semibold dark:text-white">{selectedCard.purchaser}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Current Balance:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(selectedCard.balance)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Amount to Redeem (Rs)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
                    <input 
                      type="number" 
                      min="0.01"
                      max={selectedCard.balance}
                      step="0.01"
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
                      placeholder="Enter amount to deduct"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-800 mt-6">
                  <Dialog.Close asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Dialog.Close>
                  <Button variant="brand" type="submit">
                    Deduct Balance
                  </Button>
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmModal
        isOpen={actionConfirm.isOpen}
        onClose={() => setActionConfirm({ isOpen: false, cardId: null, actionType: null })}
        onConfirm={confirmAction}
        title={actionConfirm.actionType === 'void' ? "Void Gift Card" : "Delete Gift Card Record"}
        message={actionConfirm.actionType === 'void' 
          ? "Are you sure you want to void this gift card? Voiding will freeze its balance."
          : "Are you sure you want to delete this record? This action is permanent."}
        confirmText={actionConfirm.actionType === 'void' ? "Void Card" : "Delete Record"}
        isDestructive
      />
    </div>
  )
}
