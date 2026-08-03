'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux';
import { fetchAdminOrdersApi, updateOrderStatusAdminApi } from '@/features/checkout';
import {
  RefreshCw, ShoppingBag, ChevronLeft, ChevronRight,
  User, TrendingUp, Clock, CheckCircle2, XCircle, Truck,
  Package, Sparkles, BarChart3, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  pending:    { label: 'Pending',    color: '#f59e0b', bg: 'bg-amber-50',   border: 'border-amber-200',  icon: Clock },
  processing: { label: 'Processing', color: '#3b82f6', bg: 'bg-blue-50',   border: 'border-blue-200',   icon: Package },
  shipped:    { label: 'Shipped',    color: '#8b5cf6', bg: 'bg-purple-50',  border: 'border-purple-200', icon: Truck },
  delivered:  { label: 'Delivered',  color: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-200',icon: CheckCircle2 },
  cancelled:  { label: 'Cancelled',  color: '#ef4444', bg: 'bg-rose-50',    border: 'border-rose-200',   icon: XCircle },
};

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  const [orders, setOrders] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalOrders, setTotalOrders] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  React.useEffect(() => {
    if (!mounted) return;

    let currentToken = accessToken;
    let currentUser = user;
    if (typeof window !== 'undefined' && (!currentToken || !currentUser)) {
      try {
        const storedUser = localStorage.getItem('sanab_user');
        const storedToken = localStorage.getItem('sanab_accessToken');
        if (storedUser) currentUser = JSON.parse(storedUser);
        if (storedToken) currentToken = storedToken;
      } catch (e) {}
    }

    if (!currentToken || currentUser?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/auth/login?from=' + encodeURIComponent('/admin/orders'));
      return;
    }

    async function loadOrders() {
      try {
        setLoading(true);
        const res = await fetchAdminOrdersApi(page, 10, statusFilter);
        const data = res.data;
        setOrders(data.results || data.docs || []);
        setTotalPages(data.totalPages || 1);
        setTotalOrders(data.totalResults || data.total || (data.results || data.docs || []).length);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load store orders.');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [mounted, accessToken, user, page, statusFilter, router]);

  const handleStatusUpdate = async (orderId: string, status: any) => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatusAdminApi(orderId, status);
      toast.success('Order status updated!');
      setOrders((prev) =>
        prev.map((o) => o._id === orderId ? { ...o, status } : o)
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Analytics computed from loaded orders
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach(o => {
      const s = o.status || 'pending';
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [orders]);

  const pieData = Object.entries(statusCounts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: STATUS_CONFIG[k]?.label || k, value: v }));

  const barData = orders.slice(0, 8).map(o => ({
    name: `#${(o._id || '').substring(0, 6).toUpperCase()}`,
    amount: o.total ?? o.totalAmount ?? 0,
  }));

  const totalRevenue = orders.reduce((s, o) => s + (o.total ?? o.totalAmount ?? 0), 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700">
          <p className="font-bold mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }}>₹{p.value?.toLocaleString('en-IN')}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Order Management <Sparkles className="w-5 h-5 text-[#00a65a] animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">Inspect purchases, dispatch items, and track live order status.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-[#00a65a]/10 text-[#00a65a] border border-[#00a65a]/20 px-3 py-1.5 rounded-lg">
            {totalOrders} Total Orders
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => { setStatusFilter(key); setPage(1); }}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer text-left group ${
                statusFilter === key
                  ? `${cfg.bg} ${cfg.border} shadow-md scale-[1.02]`
                  : 'bg-white border-slate-200 hover:shadow-md hover:scale-[1.01]'
              }`}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: cfg.color + '20' }}
              >
                <Icon className="w-4 h-4" style={{ color: cfg.color }} />
              </div>
              <div>
                <p className="text-lg font-black text-slate-800">{statusCounts[key]}</p>
                <p className="text-[10px] font-semibold text-slate-500">{cfg.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Bar Chart - Revenue per order */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[#00a65a]" />
            <h3 className="text-sm font-bold text-slate-700">Order Revenue (Recent)</h3>
            <span className="ml-auto text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">₹{totalRevenue.toLocaleString('en-IN')}</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#00a65a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Order status distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#00a65a]" />
            <h3 className="text-sm font-bold text-slate-700">Status Breakdown</h3>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '10px', fontWeight: 600 }}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-500 mr-1">Filter:</span>
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => { setStatusFilter(st); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
              statusFilter === st
                ? 'bg-[#00a65a] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st === 'all' ? 'All Orders' : st}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-[#00a65a]" />
              <p className="text-xs text-slate-500 font-medium">Loading orders...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Order</th>
                  <th className="py-4 px-5">Customer</th>
                  <th className="py-4 px-5">Amount</th>
                  <th className="py-4 px-5">Payment</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Date</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {orders.length > 0 ? (
                  orders.map((ord) => {
                    const cfg = STATUS_CONFIG[ord.status] || STATUS_CONFIG.pending;
                    const Icon = cfg.icon;
                    return (
                      <tr key={ord._id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="py-4 px-5">
                          <span className="font-bold text-[#00a65a] font-mono text-xs">
                            #{(ord.orderNumber || ord._id?.substring(0, 10) || 'ORD').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00a65a]/20 to-[#00a65a]/10 flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-[#00a65a]" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-xs leading-tight">
                                {ord.user?.name || ord.shippingAddress?.fullName || 'Customer'}
                              </p>
                              <p className="text-[10px] text-slate-400">{ord.user?.email || ord.shippingAddress?.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-black text-slate-900 text-sm">
                            ₹{(ord.total ?? ord.totalAmount ?? 0).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="space-y-0.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              ['paid', 'completed'].includes(ord.paymentDetails?.status || ord.paymentStatus)
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {ord.paymentDetails?.status || ord.paymentStatus || 'pending'}
                            </span>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {ord.paymentDetails?.method === 'authorize_net' || ord.paymentDetails?.method === 'card'
                                ? 'Authorize.Net'
                                : ord.paymentDetails?.method === 'cod'
                                ? 'Cash on Delivery'
                                : 'Razorpay'}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <select
                            value={ord.status || 'pending'}
                            onChange={(e) => handleStatusUpdate(ord._id, e.target.value)}
                            disabled={updatingId === ord._id}
                            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00a65a]/40 ${cfg.bg} ${cfg.border}`}
                            style={{ color: cfg.color }}
                          >
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-5 text-xs text-slate-400 font-medium">
                          {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => router.push(`/account/orders/${ord._id}`)}
                            className="px-3 py-1.5 bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-bold rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <ShoppingBag className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400 font-medium text-sm">No orders found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs">
            <span className="text-slate-400 font-medium">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white transition-colors disabled:opacity-40 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white transition-colors disabled:opacity-40 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
