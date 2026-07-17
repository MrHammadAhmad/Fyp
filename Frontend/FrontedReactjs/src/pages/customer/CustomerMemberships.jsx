import React, { useEffect, useState } from 'react'
import { Crown, Calendar, Info, Loader2 } from 'lucide-react'
import { membershipApi } from '../../api/services/membershipApi'
import showToast from '../../components/ui/Toast'
import ConfirmModal from '../../components/ui/ConfirmModal'

export default function CustomerMemberships() {
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelConfirm, setCancelConfirm] = useState({ isOpen: false, membershipId: null })

  const fetchMyMemberships = async () => {
    try {
      setLoading(true)
      const data = await membershipApi.getMyMemberships()
      setMemberships(data)
    } catch (err) {
      console.error(err)
      showToast.error('Failed to load your memberships.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyMemberships()
  }, [])

  const confirmCancel = async () => {
    if (!cancelConfirm.membershipId) return;
    try {
      await membershipApi.cancelMembership(cancelConfirm.membershipId);
      showToast.success('Membership deactivated');
      fetchMyMemberships();
    } catch (err) {
      showToast.error('Failed to deactivate membership');
    }
  }

  const handleCancel = (id) => {
    setCancelConfirm({ isOpen: true, membershipId: id })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">My Memberships</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">View and manage your active salon memberships.</p>
      </div>

      {memberships.length === 0 ? (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 mx-auto mb-4">
            <Crown className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">No Active Memberships</h3>
          <p className="text-sm text-surface-500 max-w-sm mx-auto">
            You don't have any active memberships right now. Visit a salon's page to explore and subscribe to their membership plans.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memberships.map((mem) => {
            const plan = mem.membership_details || {}
            const salon = mem.salon_details || {}
            const perksList = plan.perks ? plan.perks.split(',').map(p => p.trim()) : []

            return (
              <div key={mem.id} className="bg-white dark:bg-surface-900 rounded-2xl border border-brand-200 dark:border-brand-900/30 overflow-hidden shadow-sm flex flex-col">
                <div className="p-6 border-b border-surface-100 dark:border-surface-800 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-surface-900 relative">
                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
                    <Crown className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-1">{plan.name || 'Membership'}</h3>
                  <p className="text-sm font-medium text-brand-600 dark:text-brand-400">@ {salon.name || 'Salon'}</p>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Included Perks:</h4>
                  <ul className="space-y-2 mb-6 flex-1">
                    {perksList.map((perk, i) => (
                      <li key={i} className="text-sm text-surface-600 dark:text-surface-400 flex items-start gap-2">
                        <span className="text-brand-500 mt-0.5">•</span> {perk}
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t border-surface-100 dark:border-surface-800 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                      <Calendar className="w-4 h-4 text-surface-400" />
                      <span>Valid until: <strong className="text-surface-900 dark:text-white">{new Date(mem.end_date).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-auto">
                    <button 
                      onClick={() => handleCancel(mem.id)}
                      className="w-full py-2 text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      <ConfirmModal
        isOpen={cancelConfirm.isOpen}
        onClose={() => setCancelConfirm({ isOpen: false, membershipId: null })}
        onConfirm={confirmCancel}
        title="Deactivate Membership"
        message="Are you sure you want to deactivate this membership?"
        confirmText="Deactivate"
        isDestructive
      />
    </div>
  )
}
