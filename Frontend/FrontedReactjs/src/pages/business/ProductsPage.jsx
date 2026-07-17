import React, { useState } from 'react'
import { Plus, MoreHorizontal, Edit, Trash2, Search, Filter, Package } from 'lucide-react'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/common/SearchBar'
import { formatPrice } from '../../utils/helpers'

export default function ProductsPage() {
  const [search, setSearch] = useState('')

  // Mock Products
  const products = []

  const filteredProducts = search 
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))
    : products

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Products Inventory</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Manage retail products, stock levels, and brands.</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>Add Product</Button>
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <SearchBar 
            value={search} 
            onChange={setSearch} 
            placeholder="Search products by name or brand..." 
            className="w-full sm:max-w-md" 
          />

        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50/50 dark:bg-surface-900/50 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium">Product Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 pr-6 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-sm">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-surface-900 dark:text-white mb-0.5">{product.name}</p>
                          <p className="text-xs text-surface-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-surface-600 dark:text-surface-300">
                      {product.category}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          product.status === 'in-stock' ? 'bg-emerald-500' : 
                          product.status === 'low-stock' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        <span className={`font-semibold ${
                          product.status === 'out-of-stock' ? 'text-red-600 dark:text-red-400' : 'text-surface-900 dark:text-white'
                        }`}>
                          {product.stock}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-surface-900 dark:text-white">
                      {formatPrice(product.price)}
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg text-surface-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Remove">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-surface-500">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
