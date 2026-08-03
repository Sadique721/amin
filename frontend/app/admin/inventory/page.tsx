'use client';

import * as React from 'react';
import { Package, Plus, AlertTriangle, CheckCircle2, TrendingUp, BarChart3, Sparkles, Archive } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell
} from 'recharts';

const inventoryItems = [
  { id: '1', sku: 'SKU-DJ-001',  name: 'Royal Diamond Solitaire Ring',        stock: 28,  minStock: 10,  category: 'Diamond Jewellery', value: 145000 },
  { id: '2', sku: 'SKU-GN-002',  name: 'Pure Gold Kundan Necklace Set',       stock: 14,  minStock: 8,   category: 'Gold Jewellery',    value: 214034 },
  { id: '3', sku: 'SKU-LC-003',  name: 'Velvet Matte Luxury Lipstick Set',    stock: 142, minStock: 30,  category: 'Cosmetics',         value: 4500 },
  { id: '4', sku: 'SKU-PE-004',  name: 'PRAO Anti-Tarnish Earrings Pack',    stock: 89,  minStock: 20,  category: 'PRAO Collection',   value: 8999 },
  { id: '5', sku: 'SKU-CH-005',  name: 'Crystal Hoop Drop Earrings',         stock: 6,   minStock: 15,  category: 'Diamond Jewellery', value: 34000 },
  { id: '6', sku: 'SKU-SK-006',  name: 'Botanical Brightening Serum 30ml',   stock: 210, minStock: 40,  category: 'Skincare',          value: 2299 },
  { id: '7', sku: 'SKU-BR-007',  name: 'BIS Certified Gold Bangle Pair',     stock: 19,  minStock: 10,  category: 'Gold Jewellery',    value: 98000 },
  { id: '8', sku: 'SKU-FK-008',  name: 'SANAB Franchise Kit (Premium)',      stock: 4,   minStock: 5,   category: 'Franchise',         value: 500000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700">
        <p className="font-bold mb-1">{label}</p>
        <p className="text-[#00a65a]">Stock: {payload[0]?.value} units</p>
      </div>
    );
  }
  return null;
};

export default function AdminInventoryPage() {
  const totalItems = inventoryItems.reduce((s, i) => s + i.stock, 0);
  const lowStockItems = inventoryItems.filter(i => i.stock <= i.minStock);
  const totalValue = inventoryItems.reduce((s, i) => s + (i.stock * i.value), 0);
  const inStockCount = inventoryItems.filter(i => i.stock > i.minStock).length;

  const barData = inventoryItems.map(i => ({
    name: i.sku.split('-')[1],
    stock: i.stock,
    low: i.stock <= i.minStock,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Inventory Management <Sparkles className="w-5 h-5 text-[#00a65a] animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">Track stock levels, values, and reorder thresholds across all product lines.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#00a65a] hover:bg-[#008d4c] text-white rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer">
          <Plus className="w-4 h-4" />
          Add Stock Item
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Units', value: totalItems.toLocaleString(), icon: Archive, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'In Stock SKUs', value: inStockCount, icon: CheckCircle2, color: '#10b981', bg: '#f0fdf4' },
          { label: 'Low Stock Alerts', value: lowStockItems.length, icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Inventory Value', value: `₹${(totalValue / 100000).toFixed(1)}L`, icon: TrendingUp, color: '#8b5cf6', bg: '#f5f3ff' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[#00a65a]" />
            <h3 className="text-sm font-bold text-slate-700">Stock Level per SKU</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
                {barData.map((d, i) => (
                  <Cell key={i} fill={d.low ? '#ef4444' : '#00a65a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#00a65a] inline-block" /><span className="text-[11px] text-slate-500">Adequate</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /><span className="text-[11px] text-slate-500">Low Stock</span></div>
          </div>
        </div>

        {/* Low Stock Alert Panel */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-700">Low Stock Alerts</h3>
            <span className="ml-auto text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{lowStockItems.length}</span>
          </div>
          {lowStockItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-xs text-slate-500 font-medium">All stock levels are adequate!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockItems.map(item => (
                <div key={item.id} className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{item.name}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-amber-600 font-semibold">{item.sku}</span>
                    <span className="text-xs font-black text-red-600">{item.stock}/{item.minStock} units</span>
                  </div>
                  <div className="mt-2 h-1 bg-amber-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, (item.stock / item.minStock) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Package className="w-4 h-4 text-[#00a65a]" />
          <h3 className="text-sm font-bold text-slate-700">Full Inventory Register</h3>
          <span className="ml-auto text-xs text-slate-400 font-medium">{inventoryItems.length} SKUs</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-5">SKU</th>
                <th className="py-4 px-5">Product Name</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Stock</th>
                <th className="py-4 px-5">Unit Value</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {inventoryItems.map(item => {
                const isLow = item.stock <= item.minStock;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-xs text-[#00a65a]">{item.sku}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="font-semibold text-slate-800 text-xs">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">{item.stock}</span>
                        <span className="text-[10px] text-slate-400">/ {item.minStock} min</span>
                      </div>
                      <div className="mt-1 w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-[#00a65a]'}`}
                          style={{ width: `${Math.min(100, (item.stock / (item.minStock * 3)) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-700 text-sm">₹{item.value.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        isLow
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isLow ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button className="px-3 py-1.5 bg-slate-100 hover:bg-[#00a65a] hover:text-white text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer border border-slate-200 hover:border-[#00a65a]">
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
