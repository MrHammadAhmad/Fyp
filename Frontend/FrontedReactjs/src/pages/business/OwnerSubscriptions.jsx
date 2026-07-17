import React, { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import Button from '../../components/ui/Button'
import { formatPrice } from '../../utils/helpers'
import { adminApi } from '../../api/services/adminApi'
import toast from 'react-hot-toast'

export default function OwnerSubscriptions() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getSubscriptions()
      setPlans(data)
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
      toast.error('Failed to load subscription plans')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = (planId, planName) => {
    setSelectedPlan(planId)
    toast.success(`Subscribed to ${planName} plan successfully!`)
  }

  const handleCancel = () => {
    setSelectedPlan(null)
    toast.success('Subscription cancelled.')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Subscription Plans</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Choose the best plan for your salon business.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
          <p className="text-surface-500">No subscription plans available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => {
            const isSelected = selectedPlan === plan.id;
            
            return (
              <div 
                key={plan.id} 
                className={`bg-white dark:bg-surface-900 border rounded-2xl p-6 shadow-sm flex flex-col transition-all hover:shadow-md ${
                  isSelected 
                    ? 'border-brand-500 ring-2 ring-brand-500/20' 
                    : 'border-surface-200 dark:border-surface-800'
                }`}
              >
                <div className="mb-6 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2 flex items-center gap-2">
                      {plan.name}
                      {isSelected && (
                        <span className="bg-brand-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-surface-900 dark:text-white">{formatPrice(plan.price)}</span>
                      <span className="text-surface-500">/{plan.interval}</span>
                    </div>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features?.map((feature, i) => (
                    <li key={i} className="text-sm text-surface-600 dark:text-surface-300 flex items-start gap-2">
                      <Check className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-surface-100 dark:border-surface-800 mt-auto space-y-3">
                  {isSelected ? (
                    <>
                      <Button 
                        className="w-full bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700 border-none"
                        disabled
                      >
                        Current Plan
                      </Button>
                      <Button 
                        variant="danger"
                        className="w-full bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 border-none" 
                        onClick={handleCancel}
                      >
                        Cancel Subscription
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleSubscribe(plan.id, plan.name)}
                      disabled={selectedPlan !== null}
                    >
                      Subscribe to {plan.name}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
