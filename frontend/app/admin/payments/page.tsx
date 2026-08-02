'use client';

import * as React from 'react';
import { fetchAdminOrdersApi } from '@/features/checkout';
import { CreditCard, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPaymentsPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-[#00a65a]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Payment Logs & Gateways</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Track online transactions, deposits, and payment gateway health.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Gateway</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {orders.length > 0 ? (
                orders.map((ord) => {
                  const txnId = ord.paymentDetails?.transactionId || ord.paymentDetails?.razorpayPaymentId || `TXN_${ord._id?.substring(0, 8).toUpperCase()}`;
                  const customer = ord.shippingAddress?.fullName || ord.user?.name || 'Customer';
                  const method = ord.paymentDetails?.method === 'authorize_net' || ord.paymentDetails?.method === 'card'
                    ? 'Card (Authorize.net)'
                    : ord.paymentDetails?.method === 'cod'
                    ? 'COD (Cash On Delivery)'
                    : ord.paymentDetails?.method || 'Razorpay';
                  const amount = ord.total ?? ord.totalAmount ?? 0;
                  const isPaid = (ord.paymentDetails?.status || ord.paymentStatus) === 'paid' || (ord.paymentDetails?.status || ord.paymentStatus) === 'completed';

                  return (
                    <tr key={ord._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#00a65a]">{txnId}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{customer}</td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">{method}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-800">₹{amount.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {isPaid ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-amber-600" />}
                          {ord.paymentDetails?.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                        {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No payment logs found in store database.
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
