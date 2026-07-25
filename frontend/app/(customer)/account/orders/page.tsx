'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/hooks/redux';
import { fetchUserOrdersApi } from '@/features/checkout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ShoppingBag, Eye, Calendar, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function OrdersPage() {
  const router = useRouter();
  const { accessToken } = useAppSelector((state) => state.auth);

  const [orders, setOrders] = React.useState<any[]>([]);
  const [totalOrders, setTotalOrders] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');

  React.useEffect(() => {
    if (!accessToken) {
      toast.error('Please log in to view your orders.');
      router.push('/auth/login?redirect=/account/orders');
      return;
    }

    async function loadOrders() {
      try {
        setLoading(true);
        const res = await fetchUserOrdersApi(page, 10);
        const data = res.data;
        setOrders(data.results || data.docs || []);
        setTotalOrders(data.totalResults || data.totalDocs || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load order history.');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [accessToken, page, router]);

  const filteredOrders = React.useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter((order) => order.status === activeTab);
  }, [orders, activeTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'processing':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'shipped':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
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
      <div className="mx-auto max-w-5xl space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Order History</h1>
            <p className="text-sm text-muted-foreground mt-1">Track and manage your online purchases and receipts.</p>
          </div>
          <Link href="/shop">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-6 py-5 rounded-xl flex items-center gap-1.5">
              <ShoppingBag className="h-4.5 w-4.5" /> Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-border pb-4 select-none">
          {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                activeTab === tab
                  ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/10'
                  : 'bg-background border-border text-muted-foreground hover:bg-muted/15 hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-background border border-border rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm space-y-4">
            <div className="bg-muted p-4 rounded-full inline-block text-muted-foreground">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">No Orders Found</h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'all'
                  ? "You haven't placed any orders yet."
                  : `You have no ${activeTab} orders at the moment.`}
              </p>
            </div>
            {activeTab !== 'all' && (
              <Button onClick={() => setActiveTab('all')} variant="outline" className="border-border rounded-xl">
                Show All Orders
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order._id} className="border-border bg-background hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Order Code
                      </span>
                      <h4 className="text-sm font-extrabold text-foreground">
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                        order.paymentDetails.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}>
                        Payment: {order.paymentDetails.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-semibold">
                    <div className="space-y-1.5">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" /> Date Placed
                      </span>
                      <p className="text-foreground font-bold">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-muted-foreground" /> Total Price
                      </span>
                      <p className="text-base font-extrabold text-foreground">
                        ₹{order.total}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-muted-foreground">
                        Shipping Address
                      </span>
                      <p className="text-foreground truncate font-bold">
                        {order.shippingAddress.fullName}, {order.shippingAddress.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">
                      Contains {order.items.reduce((sum: number, i: any) => sum + i.quantity, 0)} item(s)
                    </p>
                    <Link href={`/account/orders/${order._id}`}>
                      <Button variant="outline" className="border-border rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-muted/15">
                        <Eye className="h-3.5 w-3.5" /> View Details
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
