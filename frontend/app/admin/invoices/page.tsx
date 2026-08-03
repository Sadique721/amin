'use client';

import * as React from 'react';
import { fetchAdminOrdersApi } from '@/features/checkout';
import {
  Receipt, Download, RefreshCw, CheckCircle2, AlertCircle,
  Sparkles, TrendingUp, IndianRupee, FileText, Printer,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700">
        <p className="font-bold mb-1">{label}</p>
        <p className="text-[#00a65a]">₹{payload[0]?.value?.toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

export default function AdminInvoicesPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'paid' | 'pending'>('all');
  const [downloading, setDownloading] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadInvoices() {
      try {
        setLoading(true);
        const res = await fetchAdminOrdersApi(1, 50, 'all');
        const data = res.data;
        setOrders(data.results || data.docs || []);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load invoices.');
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  const totalBilled = orders.reduce((s, o) => s + (o.total ?? o.totalAmount ?? 0), 0);
  const paidCount = orders.filter(o => ['paid', 'completed'].includes(o.paymentDetails?.status || o.paymentStatus || '')).length;
  const pendingCount = orders.length - paidCount;
  const paidRevenue = orders
    .filter(o => ['paid', 'completed'].includes(o.paymentDetails?.status || o.paymentStatus || ''))
    .reduce((s, o) => s + (o.total ?? o.totalAmount ?? 0), 0);

  const barData = orders.slice(0, 8).map((o, i) => ({
    name: `INV-${i + 1}`,
    amount: o.total ?? o.totalAmount ?? 0,
    paid: ['paid', 'completed'].includes(o.paymentDetails?.status || o.paymentStatus || ''),
  }));

  const filtered = orders.filter(o => {
    if (filter === 'all') return true;
    const isPaid = ['paid', 'completed'].includes(o.paymentDetails?.status || o.paymentStatus || '');
    return filter === 'paid' ? isPaid : !isPaid;
  });

  const handleDownload = (invNo: string) => {
    setDownloading(invNo);
    setTimeout(() => {
      window.print();
      setDownloading(null);
      toast.success(`Invoice ${invNo} ready for print/export!`);
    }, 600);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-9 w-9 animate-spin text-[#00a65a]" />
          <p className="text-sm text-slate-500 font-medium">Loading invoice registry…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Tax & GST Invoices <Sparkles className="w-5 h-5 text-[#00a65a] animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">Generate and download GST-compliant customer invoice statements.</p>
        </div>
        <span className="px-3 py-1.5 rounded-lg bg-[#00a65a]/10 border border-[#00a65a]/20 text-[#00a65a] text-xs font-black">
          {orders.length} Invoices
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Billed',   value: `₹${(totalBilled / 100000).toFixed(1)}L`,    icon: IndianRupee,   color: '#00a65a', bg: '#f0fdf4' },
          { label: 'Collected',      value: `₹${(paidRevenue / 100000).toFixed(1)}L`,    icon: TrendingUp,    color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Paid',           value: paidCount,                                    icon: CheckCircle2,  color: '#10b981', bg: '#f0fdf4' },
          { label: 'Pending',        value: pendingCount,                                 icon: AlertCircle,   color: '#f59e0b', bg: '#fffbeb' },
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

      {/* Revenue Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-[#00a65a]" />
          <h3 className="text-sm font-bold text-slate-700">Invoice Amount Distribution</h3>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#00a65a] inline-block" /><span className="text-[11px] text-slate-500">Paid</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /><span className="text-[11px] text-slate-500">Pending</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {barData.map((d, i) => (
                <Cell key={i} fill={d.paid ? '#00a65a' : '#f59e0b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00a65a]" />
            <h3 className="text-sm font-bold text-slate-700">Invoice Register</h3>
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'paid', 'pending'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-[#00a65a] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-5">Invoice No</th>
                <th className="py-4 px-5">Customer</th>
                <th className="py-4 px-5">Item(s)</th>
                <th className="py-4 px-5">Amount</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.length > 0 ? (
                filtered.map((ord, idx) => {
                  const invNo = `INV-${ord._id?.substring(0, 8).toUpperCase() || String(idx + 1).padStart(4, '0')}`;
                  const customer = ord.shippingAddress?.fullName || ord.user?.name || 'Customer';
                  const amount = ord.total ?? ord.totalAmount ?? 0;
                  const isPaid = ['paid', 'completed'].includes(ord.paymentDetails?.status || ord.paymentStatus || '');
                  const items = ord.items?.length || 1;
                  return (
                    <tr key={ord._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-xs text-[#00a65a]">{invNo}</td>
                      <td className="py-4 px-5 font-semibold text-slate-800 text-xs">{customer}</td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {items} item{items > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-black text-slate-900">₹{amount.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          isPaid ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {isPaid ? 'PAID' : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-[11px] text-slate-400 font-medium">
                        {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownload(invNo)}
                            disabled={downloading === invNo}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00a65a] text-white hover:bg-[#008d4c] transition-all shadow-sm cursor-pointer disabled:opacity-60"
                          >
                            {downloading === invNo
                              ? <RefreshCw className="w-3 h-3 animate-spin" />
                              : <Download className="w-3 h-3" />}
                            PDF
                          </button>
                          <button
                            onClick={() => { window.print(); toast.success('Printing…'); }}
                            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Receipt className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium text-sm">No invoices found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
