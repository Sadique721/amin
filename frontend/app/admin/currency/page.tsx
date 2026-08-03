'use client';

import * as React from 'react';
import { Coins, CheckCircle2, TrendingUp, RefreshCw, Edit2, Save, X, Sparkles, Globe } from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';

const INITIAL_CURRENCIES = [
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee',   rate: 1.00,  isDefault: true,  flag: '🇮🇳', trend: +0 },
  { code: 'USD', symbol: '$',   name: 'US Dollar',       rate: 83.50, isDefault: false, flag: '🇺🇸', trend: +0.3 },
  { code: 'EUR', symbol: '€',   name: 'Euro',            rate: 91.20, isDefault: false, flag: '🇪🇺', trend: -0.5 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham',      rate: 22.75, isDefault: false, flag: '🇦🇪', trend: +0.1 },
  { code: 'GBP', symbol: '£',   name: 'British Pound',   rate: 106.80,isDefault: false, flag: '🇬🇧', trend: -0.2 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700">
        <p className="font-bold mb-1">{label}</p>
        <p className="text-[#00a65a]">₹{payload[0]?.value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function AdminCurrencyPage() {
  const [currencies, setCurrencies] = React.useState(INITIAL_CURRENCIES);
  const [editingCode, setEditingCode] = React.useState<string | null>(null);
  const [editRate, setEditRate] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Exchange rates refreshed!');
    }, 800);
  };

  const startEdit = (code: string, rate: number) => {
    setEditingCode(code);
    setEditRate(String(rate));
  };

  const saveEdit = (code: string) => {
    const num = parseFloat(editRate);
    if (isNaN(num) || num <= 0) { toast.error('Invalid rate'); return; }
    setCurrencies(prev => prev.map(c => c.code === code ? { ...c, rate: num } : c));
    setEditingCode(null);
    toast.success(`${code} rate updated to ₹${num}`);
  };

  const barData = currencies.map(c => ({
    name: c.code,
    rate: c.rate,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Currency & Exchange Rates <Sparkles className="w-5 h-5 text-[#00a65a] animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">Configure multi-currency conversion multipliers for international billing.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm text-xs font-bold text-slate-600 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#00a65a]' : ''}`} />
          Refresh Rates
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Base Currency',   value: 'INR (₹)',          icon: Coins,       color: '#00a65a', bg: '#f0fdf4' },
          { label: 'Currencies',      value: currencies.length,  icon: Globe,       color: '#3b82f6', bg: '#eff6ff' },
          { label: 'USD Rate',        value: '₹83.50',           icon: TrendingUp,  color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'AED Rate',        value: '₹22.75',           icon: TrendingUp,  color: '#f59e0b', bg: '#fffbeb' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900">{s.value}</p>
                  <p className="text-[11px] font-semibold text-slate-500">{s.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[#00a65a]" />
          <h3 className="text-sm font-bold text-slate-700">Exchange Rate vs INR (₹1 = X INR)</h3>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
              {barData.map((_, i) => (
                <Cell key={i} fill={i === 0 ? '#00a65a' : `hsl(${200 + i * 30}, 70%, 55%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Currency Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Coins className="w-4 h-4 text-[#00a65a]" />
          <h3 className="text-sm font-bold text-slate-700">Exchange Rate Register</h3>
          <span className="ml-auto text-xs text-slate-400 font-medium">{currencies.length} currencies</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-5">Code</th>
                <th className="py-4 px-5">Currency</th>
                <th className="py-4 px-5">Exchange Rate (1 unit = ? INR)</th>
                <th className="py-4 px-5">24h Change</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currencies.map(c => (
                <tr key={c.code} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{c.flag}</span>
                      <span className="font-black text-sm text-[#00a65a]">{c.code}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{c.symbol}</p>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    {editingCode === c.code ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editRate}
                          onChange={e => setEditRate(e.target.value)}
                          className="w-24 px-2 py-1.5 text-sm rounded-lg border border-[#00a65a] focus:outline-none focus:ring-2 focus:ring-[#00a65a]/30 font-bold"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span className="font-black text-slate-900 text-sm">₹{c.rate.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`text-xs font-bold flex items-center gap-1 ${c.trend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {c.trend >= 0 ? '▲' : '▼'} {Math.abs(c.trend).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center">
                    {c.isDefault ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Base
                      </span>
                    ) : (
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-right">
                    {!c.isDefault && (
                      editingCode === c.code ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => saveEdit(c.code)}
                            className="p-1.5 rounded-lg bg-[#00a65a] text-white hover:bg-[#008d4c] transition-all cursor-pointer shadow-sm"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingCode(null)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(c.code, c.rate)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-all cursor-pointer border border-slate-200 hover:border-blue-200"
                        >
                          <Edit2 className="w-3 h-3" /> Edit Rate
                        </button>
                      )
                    )}
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
