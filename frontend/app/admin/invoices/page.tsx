'use client';

import * as React from 'react';
import { fetchAdminOrdersApi } from '@/features/checkout';
import { Receipt, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminInvoicesPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

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
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Tax & GST Invoices</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Generate and download tax compliant customer receipt statements.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice No</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Total Billed</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {orders.length > 0 ? (
                orders.map((ord) => {
                  const invNo = `INV-${ord._id?.substring(0, 8).toUpperCase()}`;
                  const customer = ord.shippingAddress?.fullName || ord.user?.name || 'Customer';
                  const amount = ord.total ?? ord.totalAmount ?? 0;
                  const isPaid = (ord.paymentDetails?.status || ord.paymentStatus) === 'paid' || (ord.paymentDetails?.status || ord.paymentStatus) === 'completed';

                  return (
                    <tr key={ord._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-xs text-[#00a65a]">{invNo}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{customer}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-800">₹{amount.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {isPaid ? 'PAID' : 'PENDING'}
                        </span>
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
                          onClick={() => window.print()}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> PDF
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No invoice statements found in store database.
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
