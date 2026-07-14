'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchOrderByIdApi } from '@/features/checkout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Calendar, MapPin, CreditCard, RefreshCw, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!orderId) {
      router.push('/shop');
      return;
    }

    async function getOrderDetails(id: string) {
      try {
        setLoading(true);
        const res = await fetchOrderByIdApi(id);
        setOrder(res.data);
      } catch {
        // error handling
      } finally {
        setLoading(false);
      }
    }

    getOrderDetails(orderId);
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/10 flex items-center justify-center p-6">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-muted/10 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-background border border-border p-10 rounded-3xl max-w-md shadow-xl space-y-6">
          <h2 className="text-2xl font-extrabold text-foreground">Order Not Found</h2>
          <p className="text-sm text-muted-foreground">
            We could not retrieve the details of your order. Please check your order history.
          </p>
          <Link href="/shop" className="block">
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 rounded-2xl">
              Go to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        
        <div className="text-center space-y-4">
          <div className="bg-emerald-500/10 p-5 rounded-full inline-block text-emerald-600">
            <CheckCircle className="h-16 w-16" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-foreground">Thank You for Your Order!</h1>
            <p className="text-sm text-muted-foreground">
              Your order <span className="font-bold text-foreground">#{order._id.substring(order._id.length - 8).toUpperCase()}</span> has been placed.
            </p>
          </div>
        </div>

        <Card className="border-border bg-background rounded-2xl shadow-sm overflow-hidden">
          <CardContent className="p-6 sm:p-10 space-y-8">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-border pb-6">
              
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Order Date
                </span>
                <p className="text-sm font-bold text-foreground">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" /> Payment Method
                </span>
                <p className="text-sm font-bold text-foreground uppercase">
                  {order.paymentDetails.method === 'razorpay' ? 'Razorpay (Online)' : 'COD (Cash on Delivery)'}
                  <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    order.paymentDetails.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {order.paymentDetails.status}
                  </span>
                </p>
              </div>

            </div>

            <div className="border-b border-border pb-6 space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Shipping Address
              </span>
              <div className="text-sm font-semibold text-foreground space-y-0.5">
                <p className="font-bold">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                </p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5" /> Items Purchased
              </span>
              
              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm font-semibold py-1">
                    <div>
                      <h4 className="text-foreground font-bold">{item.product?.name || 'Product'}</h4>
                      <p className="text-xs text-muted-foreground">
                        {Object.entries(item.variant.attributes).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                      </p>
                      <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <span className="text-foreground">₹{item.variant.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-3.5 text-sm font-semibold max-w-sm ml-auto">
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
                <span className="text-base font-extrabold text-foreground">Total Paid</span>
                <span className="text-xl font-black text-foreground">₹{order.total}</span>
              </div>
            </div>

          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop">
            <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-6 px-8 rounded-2xl shadow-lg shadow-amber-500/15">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/account/orders">
            <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-muted font-extrabold py-6 px-8 rounded-2xl flex items-center justify-center gap-1.5">
              View Order History <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
