'use client';

import * as React from 'react';
import { Coins, CheckCircle2 } from 'lucide-react';

export default function AdminCurrencyPage() {
  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: '1.00', isDefault: true },
    { code: 'USD', symbol: '$', name: 'US Dollar', rate: '83.50', isDefault: false },
    { code: 'EUR', symbol: '€', name: 'Euro', rate: '91.20', isDefault: false },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rate: '22.75', isDefault: false },
  ];

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Currency & Exchange Rates</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Configure multi-currency conversion multipliers for international reseller billing.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">Code</th>
              <th className="py-3.5 px-4">Symbol</th>
              <th className="py-3.5 px-4">Currency Name</th>
              <th className="py-3.5 px-4">Exchange Rate (to INR)</th>
              <th className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
            {currencies.map((c) => (
              <tr key={c.code} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-extrabold text-[#00a65a]">{c.code}</td>
                <td className="py-3.5 px-4 font-bold text-slate-800">{c.symbol}</td>
                <td className="py-3.5 px-4 font-medium text-slate-800">{c.name}</td>
                <td className="py-3.5 px-4 font-bold text-slate-800">{c.rate}</td>
                <td className="py-3.5 px-4 text-right">
                  {c.isDefault ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Primary Base
                    </span>
                  ) : (
                    <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded transition-colors">
                      Edit Rate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
