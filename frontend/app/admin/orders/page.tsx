'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/hooks/redux';
import { fetchAdminOrdersApi, updateOrderStatusAdminApi } from '@/features/checkout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ShoppingBag, Eye, Calendar, CreditCard, ChevronLeft, ChevronRight, User, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  React.useEffect(() => {
    if (!accessToken || user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/login?redirect=/admin/orders');
      return;
    }

    async function loadOrders() {
      try {
        setLoading(true);
        const res = await fetchAdminOrdersApi(page, 10, statusFilter);
        const data = res.data;
        setOrders(data.docs || []);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load store orders.');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [accessToken, user, page, statusFilter, router]);

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
      <div className="min-h-screen bg-muted/10 flex items-center justify-center p-6">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <Link href="/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-500 mb-2 select-none transition-colors">
              <ChevronLeft className="h-4 w-4" /> Admin Console
            </Link>
            <h1 className="text-3xl font-extrabold text-foreground">Manage Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">Review customer orders, update delivery steps, and payments.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-border pb-4 select-none">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                statusFilter === tab
                  ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/10'
                  : 'bg-background border-border text-muted-foreground hover:bg-muted/15 hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="bg-background border border-border rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm space-y-4">
            <div className="bg-muted p-4 rounded-full inline-block text-muted-foreground">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">No Orders Found</h3>
              <p className="text-sm text-muted-foreground">
                There are no orders matching this filter query.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order._id} className="border-border bg-background hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Order Hash</span>
                      <h4 className="text-sm font-extrabold text-foreground">
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Status:</span>
                        <Select
                          disabled={updatingId === order._id}
                          value={order.status}
                          onValueChange={(val: any) => handleStatusUpdate(order._id, val, order.paymentDetails.status)}
                        >
                          <SelectTrigger className="w-[130px] h-9 rounded-xl border-border focus:ring-amber-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Payment:</span>
                        <Select
                          disabled={updatingId === order._id}
                          value={order.paymentDetails.status}
                          onValueChange={(val: any) => handleStatusUpdate(order._id, order.status, val)}
                        >
                          <SelectTrigger className="w-[120px] h-9 rounded-xl border-border focus:ring-amber-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-xs font-semibold">
                    <div className="space-y-1">
                      <span className="text-muted-foreground flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Buyer</span>
                      <p className="text-foreground font-bold">{order.user?.name || 'Customer'}</p>
                      <p className="text-muted-foreground text-[10px]">{order.user?.email || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Ordered On</span>
                      <p className="text-foreground font-bold">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Total Price</span>
                      <p className="text-base font-extrabold text-foreground">₹{order.total}</p>
                      <p className="text-[9px] text-muted-foreground capitalize font-bold">Method: {order.paymentDetails.method}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Destination</span>
                      <p className="text-foreground truncate font-bold">{order.shippingAddress.fullName}</p>
                      <p className="text-muted-foreground text-[10px] truncate">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <p className="text-[10px] text-muted-foreground font-bold">
                      Contains {order.items.reduce((sum: number, i: any) => sum + i.quantity, 0)} item(s) • Coupon: {order.coupon ? 'Yes' : 'No'}
                    </p>
                    <Link href={`/account/orders/${order._id}`}>
                      <Button variant="outline" size="sm" className="border-border rounded-xl text-[10px] font-bold flex items-center gap-1 hover:bg-muted/15">
                        <Eye className="h-3.5 w-3.5" /> Inspect Order Details
                      </Button>
                    </Link>
                  </div>

                </CardContent>
              </Card>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-border rounded-xl h-10 w-10 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-bold text-muted-foreground px-3 select-none">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-border rounded-xl h-10 w-10 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
