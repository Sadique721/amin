'use client';

import * as React from 'react';
import { Wrench, Plus, Search, CheckCircle2, Sliders } from 'lucide-react';

export default function AdminServicesPage() {
  const services = [
    { id: '1', name: 'Samsung KG Unlock', provider: 'GSM Server', price: '₹2,500.00', status: 'Active', category: 'Unlock' },
    { id: '2', name: 'Xiaomi Bootloader Unlock', provider: 'Mi API', price: '₹1,800.00', status: 'Active', category: 'Bootloader' },
    { id: '3', name: 'Oppo IMEI Repair', provider: 'Oppo Server', price: '₹3,200.00', status: 'Active', category: 'IMEI' },
    { id: '4', name: 'OnePlus FRP Remove', provider: 'FRP Tool', price: '₹900.00', status: 'Active', category: 'FRP' },
    { id: '5', name: 'Realme IMEI Repair', provider: 'Realme Direct', price: '₹3,000.00', status: 'Active', category: 'IMEI' },
    { id: '6', name: 'Unlock Tool Activation (1 Year)', provider: 'UnlockTool Official', price: '₹4,500.00', status: 'Active', category: 'License' },
    { id: '7', name: 'iCloud Bypass (Full)', provider: 'iRemove Tools', price: '₹2,700.00', status: 'Active', category: 'Bypass' },
    { id: '8', name: 'CPU / eMMC Reprogramming', provider: 'EasyJTAG', price: '₹2,200.00', status: 'Active', category: 'Hardware' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Active Services</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage digital unlocking, activation, and repair services.</p>
        </div>

        <button className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5 transition-colors cursor-pointer shrink-0">
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Service Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">API Provider</th>
                <th className="py-3.5 px-4">Price (INR)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {services.map((srv) => (
                <tr key={srv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#00a65a]" />
                    <span>{srv.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">{srv.category}</td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">{srv.provider}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{srv.price}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded transition-colors">
                      Configure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
