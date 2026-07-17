import React from 'react'
import { Megaphone, Mail, MessageSquare, Percent, ArrowRight } from 'lucide-react'
import Button from '../../components/ui/Button'

export default function MarketingPage() {
  const campaigns = []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Marketing Campaigns</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Reach clients via email, SMS, and targeted promotions.</p>
        </div>
        <Button leftIcon={<Megaphone className="w-4 h-4" />}>New Campaign</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="w-12 h-12 bg-[#405742] text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#405742]/25 group-hover:scale-110 transition-transform">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">Email Marketing</h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">Send newsletters and announcements to your client base.</p>
          <div className="flex items-center text-sm font-semibold text-[#405742] dark:text-[#5a7a62]">
            Create Email <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="w-12 h-12 bg-[#405742] text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#405742]/25 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">SMS Blasts</h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">High-open-rate text messages for last minute openings.</p>
          <div className="flex items-center text-sm font-semibold text-[#405742] dark:text-[#5a7a62]">
            Create SMS <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="w-12 h-12 bg-[#405742] text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#405742]/25 group-hover:scale-110 transition-transform">
            <Percent className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">Discounts & Promos</h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">Generate custom promo codes for checkout.</p>
          <div className="flex items-center text-sm font-semibold text-[#405742] dark:text-[#5a7a62]">
            Create Promo <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm mt-8">
        <div className="p-6 border-b border-surface-200 dark:border-surface-800">
          <h3 className="font-bold text-surface-900 dark:text-white">Recent Campaigns</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50/50 dark:bg-surface-900/50 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium">Campaign Name</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium text-center">Sent</th>
                <th className="p-4 font-medium text-center">Opens</th>
                <th className="p-4 font-medium text-center">Clicks</th>
                <th className="p-4 pr-6 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-sm">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                  <td className="p-4 pl-6 font-bold text-surface-900 dark:text-white">
                    {camp.name}
                  </td>
                  <td className="p-4 text-surface-600 dark:text-surface-300">
                    {camp.type}
                  </td>
                  <td className="p-4 text-center font-medium text-surface-900 dark:text-white">
                    {camp.sent}
                  </td>
                  <td className="p-4 text-center font-medium text-surface-900 dark:text-white">
                    {camp.opens}
                  </td>
                  <td className="p-4 text-center font-medium text-surface-900 dark:text-white">
                    {camp.clicks}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase ${
                      camp.status === 'active' ? 'bg-[#405742]/10 text-[#405742] dark:bg-[#405742]/15 dark:text-[#5a7a62]' : 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400'
                    }`}>
                      {camp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
