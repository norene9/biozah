'"use client"';

import React from 'react';

export default function OrdersPage() {
  const orders = [
    { id: 'ORD-8821', customer: 'Sophia Chen', date: '2026-10-24', total: 110.00, status: 'Pending' },
    { id: 'ORD-8822', customer: 'Marcus Vance', date: '2026-10-24', total: 100.00, status: 'Shipped' },
    { id: 'ORD-8823', customer: 'Amara Miller', date: '2026-10-23', total: 29.50, status: 'Delivered' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-stone-900">Customer Orders Table</h3>
        <p className="text-xs text-stone-500">Track purchase fulfillments and payments</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100 text-stone-400 font-semibold uppercase">
              <th className="py-3.5 px-6">Order ID</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Total</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-stone-50/80">
                <td className="py-3.5 px-6 font-semibold text-stone-800">{o.id}</td>
                <td className="py-3.5 px-4">{o.customer}</td>
                <td className="py-3.5 px-4 text-stone-400">{o.date}</td>
                <td className="py-3.5 px-4 font-bold text-stone-900">${o.total.toFixed(2)}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    {o.status}
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