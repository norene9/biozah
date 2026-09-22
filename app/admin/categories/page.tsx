'"use client"';

import React from 'react';

export default function CategoriesPage() {
  const categories = [
    { name: 'Skincare', count: 12 },
    { name: 'Makeup', count: 6 },
    { name: 'Haircare', count: 4 },
    { name: 'Fragrance', count: 2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-stone-900">Categories Management</h3>
          <p className="text-xs text-stone-500">Organize items into customer collections</p>
        </div>
        <button className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">
          + Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div key={c.name} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center justify-between">
            <div>
              <h4 className="font-bold text-stone-900 text-sm">{c.name}</h4>
              <p className="text-xs text-stone-400 mt-1">{c.count} items in catalog</p>
            </div>
            <span className="text-xs bg-brand-50 text-brand-700 font-semibold px-2.5 py-1 rounded-lg">Active</span>
          </div>
        ))}
      </div>
    </div>
  );
}
