'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { clearCart } from '@/features/cart';
import { createOrderApi, verifyCodPaymentApi } from '@/features/checkout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Truck, RefreshCw, ChevronLeft, ShieldCheck, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/axios';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, coupon, discountAmount } = useAppSelector((state) => state.cart);
  const { user, accessToken } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = React.useState(false);
  const [shippingAddress, setShippingAddress] = React.useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = React.useState<'authorize_net' | 'cod'>('cod');
  // Both COD and Authorize.net card are always available (OR operator)

  // Authorize.net card fields
  const [cardNumber, setCardNumber] = React.useState('');
  const [cardExpiry, setCardExpiry] = React.useState('');  // MM/YY
  const [cardCvv, setCardCvv] = React.useState('');
  const [cardName, setCardName] = React.useState('');

  React.useEffect(() => {
    if (!accessToken) {
      toast.error('Please log in to proceed with checkout.');
      router.push(`/auth/login?redirect=/checkout`);
    } else if (items.length === 0) {
      toast.warning('Your shopping bag is empty.');
      router.push('/cart');
    }
  }, [accessToken, items, router]);

  const subtotal = React.useMemo(() => {
    return items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  }, [items]);

  const total = React.useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  // No auto-selection — user freely chooses COD or Authorize.net card payment

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const formatCardNumber = (val: string) => {
    return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const { fullName, addressLine1, city, state, postalCode, phone } = shippingAddress;
    if (!fullName || !addressLine1 || !city || !state || !postalCode || !phone) {
      toast.error('Please fill in all required shipping address fields.');
      return;
    }

    if (paymentMethod === 'authorize_net') {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        toast.error('Please enter all card details.');
        return;
      }
    }

    setLoading(true);

    try {
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.product._id,
          sku: item.variant.sku,
          quantity: item.quantity,
          price: item.variant.price,
        })),
        shippingAddress,
        couponCode: coupon?.code,
        paymentMethod,
        total,
      };

      const response = await createOrderApi(orderPayload);
      const order = response.data;

      if (paymentMethod === 'cod') {
        // COD verification
        try {
          await verifyCodPaymentApi(order._id);
        } catch {}
        dispatch(clearCart());
        toast.success('🎉 Order placed successfully! Pay on delivery.');
        router.push(`/checkout/success?orderId=${order._id}`);
        return;
      }

      if (paymentMethod === 'authorize_net') {
        // Format expiry: MM/YY → YYYY-MM for Authorize.net
        const [mm, yy] = cardExpiry.split('/');
        const expirationDate = `20${yy?.trim()}-${mm?.trim().padStart(2, '0')}`;

        const nameParts = cardName.trim().split(' ');
        const firstName = nameParts[0] || fullName.split(' ')[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || fullName.split(' ').slice(1).join(' ') || 'User';

        const chargeRes = await api.post('/payments/authorize/charge', {
          amount: total,
          cardNumber: cardNumber.replace(/\s/g, ''),
          expirationDate,
          cardCode: cardCvv,
          firstName,
          lastName,
          email: user?.email,
          orderId: order._id,
          description: `Sanab Order ${order._id}`,
        });

        if (chargeRes.data?.success && chargeRes.data?.data?.transactionId) {
          dispatch(clearCart());
          toast.success(`✅ Payment successful! Transaction ID: ${chargeRes.data.data.transactionId}`);
          router.push(`/checkout/success?orderId=${order._id}`);
        } else {
          throw new Error(chargeRes.data?.message || 'Card payment failed');
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'An error occurred placing your order.');
      setLoading(false);
    }
  };

  if (!accessToken || items.length === 0) {
    return (
      <div className="min-h-screen bg-muted/10 flex items-center justify-center p-6">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <Link href="/cart" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-500 mb-2 select-none transition-colors">
              <ChevronLeft className="h-4 w-4" /> Back to Bag
            </Link>
            <h1 className="text-3xl font-extrabold text-foreground">Checkout</h1>
            <p className="text-sm text-muted-foreground mt-1">Complete your delivery address and choose payment method.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              
              <Card className="border-border bg-background p-6 rounded-2xl shadow-sm">
                <CardContent className="p-0 space-y-6">
                  <h3 className="text-lg font-bold text-foreground border-b border-border pb-3">1. Shipping Address</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="fullName" className="text-xs font-bold text-muted-foreground">Full Name *</label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={shippingAddress.fullName}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                        className="focus-visible:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="text-xs font-bold text-muted-foreground">Phone Number *</label>
                      <Input
                        id="phone"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+91 XXXXX XXXXX"
                        className="focus-visible:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="addressLine1" className="text-xs font-bold text-muted-foreground">Address Line 1 *</label>
                    <Input
                      id="addressLine1"
                      name="addressLine1"
                      value={shippingAddress.addressLine1}
                      onChange={handleInputChange}
                      required
                      placeholder="Flat, House no., Building, Company, Apartment"
                      className="focus-visible:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="addressLine2" className="text-xs font-bold text-muted-foreground">Address Line 2 (Optional)</label>
                    <Input
                      id="addressLine2"
                      name="addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={handleInputChange}
                      placeholder="Area, Street, Sector, Village"
                      className="focus-visible:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                      <label htmlFor="city" className="text-xs font-bold text-muted-foreground">City *</label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        required
                        placeholder="Mumbai"
                        className="focus-visible:ring-amber-500"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                      <label htmlFor="state" className="text-xs font-bold text-muted-foreground">State *</label>
                      <Input
                        id="state"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        required
                        placeholder="Maharashtra"
                        className="focus-visible:ring-amber-500"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                      <label htmlFor="postalCode" className="text-xs font-bold text-muted-foreground">Postal Code *</label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={handleInputChange}
                        required
                        placeholder="400001"
                        className="focus-visible:ring-amber-500"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                      <label htmlFor="country" className="text-xs font-bold text-muted-foreground">Country *</label>
                      <Input
                        id="country"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleInputChange}
                        required
                        placeholder="India"
                        className="focus-visible:ring-amber-500"
                      />
                    </div>
                  </div>

                </CardContent>
              </Card>

              <Card className="border-border bg-background p-6 rounded-2xl shadow-sm">
                <CardContent className="p-0 space-y-6">
                  <h3 className="text-lg font-bold text-foreground border-b border-border pb-3">2. Payment Method</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Authorize.net Card Payment */}
                    <div
                      onClick={() => setPaymentMethod('authorize_net')}
                      className={`border rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all ${
                        paymentMethod === 'authorize_net'
                          ? 'border-amber-500 bg-amber-500/5 shadow-inner'
                          : 'border-border bg-background hover:bg-muted/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-full ${paymentMethod === 'authorize_net' ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-sm text-foreground">Card Payment</h4>
                          <p className="text-[10px] text-muted-foreground font-semibold">Authorize.net — Visa/MC</p>
                          <p className="text-[9px] text-emerald-600 font-bold mt-0.5">✓ Secure online payment</p>
                        </div>
                      </div>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${paymentMethod === 'authorize_net' ? 'border-amber-500 bg-amber-500' : 'border-muted-foreground'}`}>
                        {paymentMethod === 'authorize_net' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* COD */}
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`border rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-amber-500 bg-amber-500/5 shadow-inner'
                          : 'border-border bg-background hover:bg-muted/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-full ${paymentMethod === 'cod' ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          <Truck className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-sm text-foreground">COD</h4>
                          <p className="text-[10px] text-muted-foreground font-semibold">Pay cash on delivery</p>
                        </div>
                      </div>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-amber-500 bg-amber-500' : 'border-muted-foreground'}`}>
                        {paymentMethod === 'cod' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                  </div>

                  {/* Authorize.net Card Form */}
                  {paymentMethod === 'authorize_net' && (
                    <div className="mt-4 space-y-4 border border-amber-500/20 rounded-xl p-4 bg-amber-500/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-bold text-amber-700">Secure Card Entry — Powered by Authorize.net</span>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground">Cardholder Name *</label>
                        <Input
                          id="cardName"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Name on card"
                          className="focus-visible:ring-amber-500"
                          required={paymentMethod === 'authorize_net'}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground">Card Number *</label>
                        <Input
                          id="cardNumber"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="4111 1111 1111 1111"
                          maxLength={19}
                          inputMode="numeric"
                          className="focus-visible:ring-amber-500 font-mono tracking-widest"
                          required={paymentMethod === 'authorize_net'}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Expiry (MM/YY) *</label>
                          <Input
                            id="cardExpiry"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                            placeholder="MM/YY"
                            maxLength={5}
                            inputMode="numeric"
                            className="focus-visible:ring-amber-500"
                            required={paymentMethod === 'authorize_net'}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">CVV *</label>
                          <Input
                            id="cardCvv"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="123"
                            maxLength={4}
                            inputMode="numeric"
                            type="password"
                            className="focus-visible:ring-amber-500"
                            required={paymentMethod === 'authorize_net'}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        🔒 Test card: <span className="font-mono font-bold">4111 1111 1111 1111</span> | Exp: <span className="font-mono font-bold">12/26</span> | CVV: <span className="font-mono font-bold">123</span>
                      </p>
                    </div>
                  )}

                </CardContent>
              </Card>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-6 rounded-2xl shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 select-none active:scale-95 transition-transform"
              >
                {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : `Place Order (₹${total})`}
              </Button>

            </form>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border bg-background p-6 rounded-2xl shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-foreground">Bag Review</h3>
              
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1 border-b border-border pb-6">
                {items.map((item) => {
                  const imageSrc = item.variant.images?.[0] || item.product.images?.[0] || '/images/placeholder.jpg';
                  return (
                    <div key={item.variant.sku} className="flex gap-3 items-center">
                      <div className="relative aspect-square h-14 w-14 overflow-hidden rounded-lg bg-muted border border-border">
                        <Image src={imageSrc} alt={item.product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-foreground truncate">{item.product.name}</h4>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {Object.entries(item.variant.attributes).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                        </p>
                        <p className="text-[10px] text-foreground font-bold mt-0.5">
                          ₹{item.variant.price} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 text-xs font-semibold border-b border-border pb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-emerald-500 font-bold">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-foreground">Total</span>
                <span className="text-xl font-black text-foreground">₹{total}</span>
              </div>

              <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/20 text-[10px] text-blue-700 font-semibold">
                💳 Pay with card via <strong>Authorize.net</strong> or choose <strong>Cash on Delivery</strong> — your choice!
              </div>

              <div className="bg-amber-500/5 p-4 rounded-xl flex items-start gap-3 border border-amber-500/10">
                <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h5 className="font-bold text-[11px] text-amber-600">Secure Transactions</h5>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Payments are encrypted securely using bank-grade safety layers.
                  </p>
                </div>
              </div>

            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
