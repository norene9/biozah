"use client";

import React, { useState } from 'react';

export default function ProductsPage() {
  const [products] = useState([
    { id: '1', name: 'Rosewater Hydrating Face Mist', category: 'Skincare', price: 28.0, stock: 45, status: 'In Stock' },
    { id: '2', name: 'Velvet Matte Lipstick (Plum Velvet)', category: 'Makeup', price: 24.5, stock: 8, status: 'Low Stock' },
    { id: '3', name: 'Elysian Orchid Eau de Parfum', category: 'Fragrance', price: 95.0, stock: 0, status: 'Out of Stock' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-stone-900">Products Management</h3>
          <p className="text-xs text-stone-500">Manage catalog inventory, prices, and availability</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">
          + Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100 text-stone-400 font-semibold uppercase">
              <th className="py-3.5 px-6">Product</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4">Stock</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-stone-50/80">
                <td className="py-3.5 px-6 font-semibold text-stone-800">{p.name}</td>
                <td className="py-3.5 px-4">{p.category}</td>
                <td className="py-3.5 px-4 font-bold text-stone-900">${p.price.toFixed(2)}</td>
                <td className="py-3.5 px-4">{p.stock} units</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}