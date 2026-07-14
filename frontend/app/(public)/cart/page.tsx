'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
  clearCart
} from '@/features/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, Trash2, Tag, RefreshCw, X, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, coupon, discountAmount, loading, couponError } = useAppSelector((state) => state.cart);
  
  const [couponCode, setCouponCode] = React.useState('');

  const subtotal = React.useMemo(() => {
    return items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  }, [items]);

  const total = React.useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    dispatch(applyCoupon({ code: couponCode, subtotal }))
      .unwrap()
      .then((res) => {
        toast.success(`Coupon "${res.coupon.code}" applied successfully!`);
        setCouponCode('');
      })
      .catch((err) => {
        toast.error(err || 'Failed to apply coupon');
      });
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.info('Coupon code removed');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-muted/10 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-background border border-border p-10 rounded-3xl max-w-md shadow-xl space-y-6">
          <div className="bg-amber-500/10 p-5 rounded-full inline-block text-amber-600">
            <ShoppingBag className="h-16 w-16 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground">Your shopping bag is empty</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore our fine jewellery collections and luxury cosmetic formulations to add items to your bag.
            </p>
          </div>
          <Link href="/shop" className="block">
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 rounded-2xl shadow-lg shadow-amber-500/15">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Shopping Bag</h1>
            <p className="text-sm text-muted-foreground mt-1">Review your selections and checkout when you are ready.</p>
          </div>
          <Button variant="ghost" onClick={() => dispatch(clearCart())} className="text-muted-foreground hover:text-rose-500 hover:bg-rose-50/10">
            Clear Bag
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const primaryImage = item.variant.images?.[0] || item.product.images?.[0] || '/images/placeholder.jpg';
              return (
                <Card key={item.variant.sku} className="overflow-hidden border-border bg-background hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-center">
                    
                    <div className="relative aspect-square h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-xl bg-muted/20 border border-border">
                      <Image
                        src={primaryImage}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{item.product.brand}</span>
                        <button
                          onClick={() => dispatch(removeFromCart(item.variant.sku))}
                          className="text-muted-foreground hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <h3 className="font-bold text-foreground text-sm sm:text-base truncate hover:text-amber-500">
                        <Link href={`/shop/${item.product.slug}`}>{item.product.name}</Link>
                      </h3>
                      
                      <p className="text-xs text-muted-foreground font-semibold flex gap-2 flex-wrap">
                        {Object.entries(item.variant.attributes).map(([key, val]) => (
                          <span key={key} className="bg-muted px-2 py-0.5 rounded-md capitalize">
                            {key}: {val}
                          </span>
                        ))}
                      </p>

                      <div className="pt-2 flex items-center justify-between gap-4">
                        <span className="font-extrabold text-foreground">₹{item.variant.price}</span>
                        
                        <div className="flex items-center border border-border rounded-lg bg-muted/10">
                          <button
                            onClick={() => dispatch(updateQuantity({ sku: item.variant.sku, quantity: item.quantity - 1 }))}
                            className="px-2 py-1 font-bold hover:bg-muted/50 rounded-l-lg text-sm select-none"
                          >
                            -
                          </button>
                          <span className="px-3 font-extrabold text-sm w-8 text-center select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => dispatch(updateQuantity({ sku: item.variant.sku, quantity: item.quantity + 1 }))}
                            className="px-2 py-1 font-bold hover:bg-muted/50 rounded-r-lg text-sm select-none"
                          >
                            +
                          </button>
                        </div>
                      </div>

                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border bg-background p-6 space-y-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-extrabold text-foreground">Order Summary</h2>
              
              <div className="space-y-3.5 border-b border-border pb-6 text-sm font-semibold">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-emerald-500 font-bold">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-base font-extrabold text-foreground">Total</span>
                <span className="text-2xl font-black text-foreground">₹{total}</span>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Promo Coupon</h4>
                
                {coupon ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Tag className="h-4 w-4" />
                      <span className="text-sm font-bold uppercase">{coupon.code} Applied</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="focus-visible:ring-amber-500 text-sm font-semibold uppercase"
                    />
                    <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white font-bold">
                      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </form>
                )}

                {couponError && (
                  <p className="text-xs text-rose-500 font-semibold">{couponError}</p>
                )}
              </div>

              <Link href="/checkout" className="block pt-2">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-6 rounded-2xl shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
