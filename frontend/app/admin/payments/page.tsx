'use client';

import * as React from 'react';
import { fetchAdminOrdersApi } from '@/features/checkout';
import {
  CreditCard, CheckCircle2, RefreshCw, AlertCircle,
  TrendingUp, Wallet, Banknote, Sparkles, BarChart3, ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const GATEWAY_CONFIG: Record<string, { label: string; color: string; shortColor: string }> = {
  razorpay:      { label: 'Razorpay',         color: '#3b82f6', shortColor: '#bfdbfe' },
  authorize_net: { label: 'Authorize.Net',     color: '#8b5cf6', shortColor: '#ede9fe' },
  card:          { label: 'Card (Auth.Net)',    color: '#8b5cf6', shortColor: '#ede9fe' },
  cod:           { label: 'Cash on Delivery',  color: '#10b981', shortColor: '#d1fae5' },
};

function getGatewayInfo(method: string) {
  return GATEWAY_CONFIG[method] || { label: method || 'Unknown', color: '#94a3b8', shortColor: '#f1f5f9' };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.fill || p.color }}>
            {p.name}: {p.name === 'Amount' ? `₹${p.value?.toLocaleString('en-IN')}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminPaymentsPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'paid' | 'pending'>('all');

  React.useEffect(() => {
    async function loadPayments() {
      try {
        setLoading(true);
        const res = await fetchAdminOrdersApi(1, 50, 'all');
        const data = res.data;
        setOrders(data.results || data.docs || []);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load payment logs.');
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  // Compute gateway analytics
  const gatewayStats = React.useMemo(() => {
    const stats: Record<string, { count: number; amount: number }> = {};
    orders.forEach(o => {
      const method = o.paymentDetails?.method || 'razorpay';
      if (!stats[method]) stats[method] = { count: 0, amount: 0 };
      stats[method].count++;
      stats[method].amount += o.total ?? o.totalAmount ?? 0;
    });
    return Object.entries(stats).map(([method, v]) => ({
      method,
      ...getGatewayInfo(method),
      count: v.count,
      amount: v.amount,
    }));
  }, [orders]);

  const totalRevenue = orders.reduce((s, o) => s + (o.total ?? o.totalAmount ?? 0), 0);
  const paidCount = orders.filter(o => ['paid', 'completed'].includes(o.paymentDetails?.status || o.paymentStatus || '')).length;
  const pendingCount = orders.length - paidCount;

  const barChartData = gatewayStats.map(g => ({
    name: g.label.length > 14 ? g.label.substring(0, 14) + '…' : g.label,
    Amount: g.amount,
    Orders: g.count,
    fill: g.color,
  }));

  const pieData = [
    { name: 'Paid', value: paidCount, color: '#10b981' },
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // Daily volume sparkline (last 7 days)
  const dailyData = React.useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })] = 0;
    }
    orders.forEach(o => {
      const d = new Date(o.createdAt || Date.now());
      const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      if (days[key] !== undefined) days[key] += o.total ?? o.totalAmount ?? 0;
    });
    return Object.entries(days).map(([date, amount]) => ({ date, amount }));
  }, [orders]);

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    const isPaid = ['paid', 'completed'].includes(o.paymentDetails?.status || o.paymentStatus || '');
    return filter === 'paid' ? isPaid : !isPaid;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-9 w-9 animate-spin text-[#00a65a]" />
          <p className="text-sm text-slate-500 font-medium">Loading payment gateway data…</p>
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
            Payment Logs & Gateways <Sparkles className="w-5 h-5 text-[#00a65a] animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">Multi-gateway transaction health, revenue flow, and payment analytics.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#00a65a]/10 border border-[#00a65a]/20 text-[#00a65a] text-xs font-black">
            ₹{totalRevenue.toLocaleString('en-IN')} Total
          </span>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#00a65a]/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-[#00a65a]" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-800">₹{totalRevenue.toLocaleString('en-IN')}</p>
            <p className="text-[11px] font-semibold text-slate-500">Total Revenue</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-800">{paidCount}</p>
            <p className="text-[11px] font-semibold text-slate-500">Paid Transactions</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-800">{pendingCount}</p>
            <p className="text-[11px] font-semibold text-slate-500">Pending</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-800">{gatewayStats.length}</p>
            <p className="text-[11px] font-semibold text-slate-500">Active Gateways</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Area Chart - Daily Volume */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#00a65a]" />
            <h3 className="text-sm font-bold text-slate-700">7-Day Revenue Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="payGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00a65a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00a65a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" name="Amount" stroke="#00a65a" fill="url(#payGradient)" strokeWidth={2} dot={{ fill: '#00a65a', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie - Paid vs Pending */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[#00a65a]" />
            <h3 className="text-sm font-bold text-slate-700">Payment Status</h3>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Gateway Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gatewayStats.map((g, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: g.shortColor }}>
                <CreditCard className="w-5 h-5" style={{ color: g.color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{g.label}</p>
                <p className="text-[10px] text-slate-400 font-medium">{g.count} transactions</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 ml-auto" />
            </div>
            <p className="text-2xl font-black text-slate-900">₹{g.amount.toLocaleString('en-IN')}</p>
            <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${totalRevenue > 0 ? (g.amount / totalRevenue) * 100 : 0}%`, backgroundColor: g.color }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
              {totalRevenue > 0 ? ((g.amount / totalRevenue) * 100).toFixed(1) : 0}% of total revenue
            </p>
          </div>
        ))}
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-700">Transaction Log</h3>
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
                <th className="py-4 px-5">Transaction ID</th>
                <th className="py-4 px-5">Customer</th>
                <th className="py-4 px-5">Gateway</th>
                <th className="py-4 px-5">Amount</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => {
                  const txnId = ord.paymentDetails?.transactionId || ord.paymentDetails?.razorpayPaymentId || `TXN_${(ord._id || '').substring(0, 8).toUpperCase()}`;
                  const method = ord.paymentDetails?.method || 'razorpay';
                  const gwInfo = getGatewayInfo(method);
                  const isPaid = ['paid', 'completed'].includes(ord.paymentDetails?.status || ord.paymentStatus || '');
                  return (
                    <tr key={ord._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-xs text-[#00a65a]">{txnId}</td>
                      <td className="py-4 px-5 font-semibold text-slate-800 text-xs">
                        {ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold"
                          style={{ backgroundColor: gwInfo.shortColor, color: gwInfo.color }}
                        >
                          <CreditCard className="w-3 h-3" />
                          {gwInfo.label}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-black text-slate-900">
                        ₹{(ord.total ?? ord.totalAmount ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${
                          isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {ord.paymentDetails?.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-xs text-slate-400 font-medium">
                        {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Banknote className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium text-sm">No payment logs found.</p>
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
