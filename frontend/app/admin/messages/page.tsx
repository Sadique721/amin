'use client';

import * as React from 'react';
import { MessageSquare, User, Send } from 'lucide-react';

export default function AdminMessagesPage() {
  const tickets = [
    { id: '1', user: 'GenTechPro', subject: 'Samsung KG Unlock Code Delay', status: 'Open', date: '31-07-2025' },
    { id: '2', user: 'UnlockMaster', subject: 'Credit Recharge via UPI', status: 'Pending', date: '31-07-2025' },
    { id: '3', user: 'AndroidGuru', subject: 'Xiaomi API Connection Issue', status: 'Closed', date: '30-07-2025' },
  ];

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Support Messages & Tickets</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Communicate directly with customer accounts and service resellers.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Subject</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{t.user}</span>
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-800">{t.subject}</td>
                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                    t.status === 'Open' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-500">{t.date}</td>
                <td className="py-3.5 px-4 text-right">
                  <button className="px-3 py-1 bg-[#00a65a] text-white text-xs font-bold rounded hover:bg-[#008d4c] transition-colors flex items-center gap-1 ml-auto">
                    <Send className="w-3 h-3" /> Reply
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
