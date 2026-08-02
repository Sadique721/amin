'use client';

import * as React from 'react';
import { Package, Plus, CheckCircle2 } from 'lucide-react';

export default function AdminInventoryPage() {
  const inventoryItems = [
    { id: '1', sku: 'SKU-UT-01', name: 'UnlockTool 1 Year License Keys', stock: 142, status: 'In Stock', minStock: 20 },
    { id: '2', smu: 'SKU-KG-02', name: 'Samsung KG Credits Bundle', stock: 550, status: 'In Stock', minStock: 100 },
    { id: '3', sku: 'SKU-IR-03', name: 'iRemove Bypass Authorization Token', stock: 89, status: 'In Stock', minStock: 15 },
    { id: '4', sku: 'SKU-MI-04', name: 'Xiaomi Authorized Service Token', stock: 12, status: 'Low Stock', minStock: 25 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Digital Inventory</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Track license tokens, activation keys, and credit balances.</p>
        </div>

        <button className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5 transition-colors cursor-pointer shrink-0">
          <Plus className="w-4 h-4" />
          <span>Add Stock Token</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">SKU / Ref</th>
              <th className="py-3.5 px-4">Item Name</th>
              <th className="py-3.5 px-4">Available Quantity</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
            {inventoryItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-[#00a65a]">{item.sku}</td>
                <td className="py-3.5 px-4 font-medium text-slate-800 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span>{item.name}</span>
                </td>
                <td className="py-3.5 px-4 font-extrabold text-slate-800">{item.stock} units</td>
                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold ${
                    item.stock > item.minStock
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded transition-colors">
                    Manage Stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
