'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/hooks/redux';
import { fetchAdminOrdersApi, updateOrderStatusAdminApi } from '@/features/checkout';
import { RefreshCw, ShoppingBag, Calendar, CreditCard, ChevronLeft, ChevronRight, User, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  const [orders, setOrders] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load store orders.');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [mounted, accessToken, user, page, statusFilter, router]);

  const handleStatusUpdate = async (orderId: string, status: any, paymentStatus?: any) => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatusAdminApi(orderId, status, paymentStatus);
      toast.success('Order status updated successfully!');
      
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                status,
                paymentDetails: paymentStatus ? { ...o.paymentDetails, status: paymentStatus } : o.paymentDetails,
              }
            : o
        )
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-[#00a65a]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title & Filter Bar */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Order Management</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Inspect incoming customer purchases and update dispatch status.</p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#00a65a] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {orders.length > 0 ? (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="py-3.5 px-4 font-semibold text-[#00a65a]">
                      #{ord._id?.substring(0, 10) || ord.orderNumber || 'ORD-100'}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span>{ord.user?.name || ord.shippingAddress?.fullName || 'Customer'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      ₹{(ord.total ?? ord.totalAmount ?? 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          (ord.paymentDetails?.status || ord.paymentStatus) === 'paid' || (ord.paymentDetails?.status || ord.paymentStatus) === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {ord.paymentDetails?.status || ord.paymentStatus || 'pending'}
                        </span>
                        <p className="text-[11px] font-bold text-slate-500">
                          {ord.paymentDetails?.method === 'authorize_net' || ord.paymentDetails?.method === 'card'
                            ? 'Card (Authorize.net)'
                            : ord.paymentDetails?.method === 'cod'
                            ? 'COD (Cash)'
                            : ord.paymentDetails?.method || 'Card'}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={ord.status || 'pending'}
                        onChange={(e) => handleStatusUpdate(ord._id, e.target.value)}
                        disabled={updatingId === ord._id}
                        className="text-xs font-semibold px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 focus:border-[#00a65a] focus:outline-none cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                      {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => router.push(`/account/orders/${ord._id}`)}
                        className="px-3 py-1 bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-bold rounded transition-colors shadow-2xs cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No orders found in store database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-xs">
            <span className="text-slate-500 font-medium">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-40"
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
