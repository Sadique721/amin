'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchOrderByIdApi } from '@/features/checkout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronLeft, MapPin, CreditCard, Calendar, ShoppingBag, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!orderId) {
      router.push('/account/orders');
      return;
    }

    async function getOrderDetails() {
      try {
        setLoading(true);
        const res = await fetchOrderByIdApi(orderId);
        setOrder(res.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load order details.');
        router.push('/account/orders');
      } finally {
        setLoading(false);
      }
    }

    getOrderDetails();
  }, [orderId, router]);

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/10 flex items-center justify-center p-6">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!order) return null;

  const steps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        
        <div>
          <Link href="/account/orders" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-500 mb-2 select-none transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to Orders
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground">Order Details</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Order <span className="font-bold text-foreground">#{order._id.substring(order._id.length - 8).toUpperCase()}</span> placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border capitalize self-start sm:self-auto ${
              order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            }`}>
              {order.status}
            </span>
          </div>
        </div>

        {order.status !== 'cancelled' && (
          <Card className="border-border bg-background p-6 rounded-2xl shadow-sm">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-4 relative select-none">
                
                <div className="absolute top-1/2 left-[12%] right-[12%] h-[2px] bg-border -translate-y-1/2 hidden sm:block z-0" />
                <div
                  className="absolute top-1/2 left-[12%] h-[2px] bg-amber-500 -translate-y-1/2 hidden sm:block z-0 transition-all duration-500"
                  style={{ width: `${(currentStepIndex / 3) * 76}%` }}
                />

                {steps.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isActive = index === currentStepIndex;
                  return (
                    <div key={step} className="flex sm:flex-col items-center gap-4 sm:gap-2 z-10 w-full sm:w-auto relative">
                      <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                        isCompleted
                          ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/15'
                          : isActive
                          ? 'border-amber-500 bg-background text-amber-500 ring-4 ring-amber-500/10'
                          : 'border-border bg-background text-muted-foreground'
                      }`}>
                        {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                      </div>
                      <div className="text-left sm:text-center">
                        <span className={`text-xs font-bold block ${isActive ? 'text-amber-500' : 'text-foreground'}`}>
                          {step}
                        </span>
                        {isActive && (
                          <span className="text-[10px] text-muted-foreground block capitalize font-semibold mt-0.5">
                            {order.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <Card className="border-border bg-background p-6 rounded-2xl shadow-sm space-y-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border pb-3">
              <MapPin className="h-4 w-4" /> Shipping Address
            </span>
            <div className="text-xs font-semibold text-foreground space-y-1">
              <p className="font-bold text-sm">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
              <p className="pt-2 text-muted-foreground">Phone: {order.shippingAddress.phone}</p>
            </div>
          </Card>

          <Card className="border-border bg-background p-6 rounded-2xl shadow-sm space-y-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border pb-3">
              <CreditCard className="h-4 w-4" /> Payment Details
            </span>
            <div className="text-xs font-semibold text-foreground space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-bold uppercase">{order.paymentDetails.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold capitalize ${
                  order.paymentDetails.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {order.paymentDetails.status}
                </span>
              </div>
              {order.paymentDetails.razorpayPaymentId && (
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{order.paymentDetails.razorpayPaymentId}</span>
                </div>
              )}
            </div>
          </Card>

        </div>

        <Card className="border-border bg-background p-6 rounded-2xl shadow-sm space-y-6">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border pb-3">
            <ShoppingBag className="h-4 w-4" /> Order Items
          </span>

          <div className="divide-y divide-border">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center py-4 first:pt-0 last:pb-0 font-semibold text-xs">
                <div>
                  <h4 className="text-sm font-bold text-foreground">{item.product?.name || 'Product'}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    SKU: {item.variant.sku}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {Object.entries(item.variant.attributes).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                  </p>
                  <p className="text-[10px] text-foreground font-bold mt-1">
                    ₹{item.variant.price} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-foreground">
                  ₹{item.variant.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-6 space-y-3.5 text-xs font-semibold max-w-sm ml-auto">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-3.5">
              <span className="text-sm font-extrabold text-foreground">Total Paid</span>
              <span className="text-base font-black text-foreground">₹{order.total}</span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
