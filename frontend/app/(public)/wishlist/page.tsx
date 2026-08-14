'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addToCart } from '@/features/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/services/axios';
import { Heart, Trash2, ShoppingBag, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ProductItem {
  _id: string;
  name: string;
  brand: string;
  slug: string;
  images: string[];
  type: 'jewellery' | 'cosmetics';
  variants: Array<{
    sku: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    attributes: Record<string, string | number>;
    images?: string[];
    isActive: boolean;
  }>;
}

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  
  const [products, setProducts] = React.useState<ProductItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  // Fetch Wishlist items
  const fetchWishlist = React.useCallback(async () => {
    let apiProducts: ProductItem[] = [];
    if (user && accessToken) {
      try {
        const response = await api.get('/wishlist');
        const payload = response.data?.data || response.data;
        const rawProducts = Array.isArray(payload) ? payload : (payload?.products || []);
        apiProducts = rawProducts.filter((p: any) => p && typeof p === 'object' && (p._id || p.id));
      } catch (err: any) {
        if (err.response?.status !== 401) {
          console.error('Failed to load wishlist from server:', err);
        }
      }
    }

    // Merge with local storage fallback
    let localProducts: ProductItem[] = [];
    try {
      const stored = localStorage.getItem('amin_local_wishlist');
      if (stored) {
        localProducts = JSON.parse(stored);
      }
    } catch (e) {}

    const combinedMap = new Map<string, ProductItem>();
    apiProducts.forEach((p) => combinedMap.set(p._id, p));
    localProducts.forEach((p) => {
      if (p && p._id && !combinedMap.has(p._id)) {
        combinedMap.set(p._id, p);
      }
    });

    setProducts(Array.from(combinedMap.values()));
    setLoading(false);
  }, [user, accessToken]);

  React.useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Remove item from wishlist
  const handleRemove = async (productId: string) => {
    setActionLoading(productId);
    try {
      if (user && accessToken) {
        await api.delete(`/wishlist/${productId}`);
      }
    } catch (err: any) {
      // Ignore API failure and proceed to update state
    } finally {
      setProducts((prev) => {
        const updated = prev.filter((p) => p._id !== productId);
        try {
          localStorage.setItem('amin_local_wishlist', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      toast.success('Item removed from wishlist');
      setActionLoading(null);
    }
  };

  // Add item to cart
  const handleAddToBag = (product: ProductItem) => {
    const defaultVariant = product.variants.find((v) => v.isActive && v.stock > 0) || product.variants.find((v) => v.isActive) || product.variants[0];
    
    if (!defaultVariant) {
      toast.error('This product is currently out of stock.');
      return;
    }

    dispatch(
      addToCart({
        product: product as any,
        variant: defaultVariant as any,
        quantity: 1,
      })
    );
    toast.success(`Added "${product.name}" to shopping bag!`);
  };

  // Not logged in UI
  if (!user) {
    return (
      <div className="min-h-screen bg-muted/10 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-background border border-border p-10 rounded-3xl max-w-md shadow-2xl space-y-6">
          <div className="bg-amber-500/10 p-5 rounded-full inline-block text-amber-600 animate-pulse">
            <Heart className="h-16 w-16 fill-current" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Your Wishlist awaits</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Log in to view saved luxury jewellery collections and cosmetic formulations.
            </p>
          </div>
          <Link href="/auth/login" className="block">
            <Button className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-white font-bold py-6 rounded-2xl shadow-lg shadow-amber-500/10 cursor-pointer">
              Log In Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen bg-muted/10 flex flex-col items-center justify-center p-6">
        <RefreshCw className="h-10 w-10 text-amber-500 animate-spin" />
        <p className="text-xs text-muted-foreground mt-4 font-bold tracking-widest uppercase">Loading your collections...</p>
      </div>
    );
  }

  // Empty state UI
  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-muted/10 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-background border border-border p-10 rounded-3xl max-w-md shadow-2xl space-y-6">
          <div className="bg-amber-500/10 p-5 rounded-full inline-block text-amber-600">
            <Heart className="h-16 w-16" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Your Wishlist is empty</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore our catalogue to add items to your wishlist and checkout when you are ready.
            </p>
          </div>
          <Link href="/shop" className="block">
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 rounded-2xl shadow-lg shadow-amber-500/10 cursor-pointer">
              Explore Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Page Header */}
        <div className="border-b border-border pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
              My Wishlist <Heart className="h-6 w-6 text-rose-500 fill-current" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Saved luxury items and favourites ready for purchase.</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const primaryImage = product.images?.[0] || '/images/placeholder.jpg';
            const defaultVariant = product.variants.find((v) => v.isActive && v.stock > 0) || product.variants.find((v) => v.isActive) || product.variants[0];
            const isOutOfStock = !defaultVariant || defaultVariant.stock <= 0;

            return (
              <Card key={product._id} className="overflow-hidden border-border bg-background hover:shadow-xl transition-all duration-300 flex flex-col group hover:border-amber-500/30">
                <div className="relative aspect-square overflow-hidden bg-muted/20 border-b border-border">
                  <Image
                    src={primaryImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(product._id)}
                    disabled={actionLoading === product._id}
                    className="absolute top-3 right-3 bg-background/80 hover:bg-rose-500 hover:text-white p-2.5 rounded-full border border-border transition-all duration-200 cursor-pointer shadow-sm text-muted-foreground"
                    title="Remove from Wishlist"
                  >
                    {actionLoading === product._id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>

                  {/* Out of Stock Label */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-destructive/10 border border-destructive/20 text-destructive text-xs uppercase font-extrabold px-3 py-1.5 rounded-lg tracking-wider">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <CardContent className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">{product.brand}</span>
                    <h3 className="font-extrabold text-foreground text-base line-clamp-1 group-hover:text-amber-500 transition-colors">
                      <Link href={`/shop/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <span className="text-xs text-muted-foreground capitalize font-medium">{product.type}</span>
                  </div>

                  <div className="pt-2 flex flex-col gap-3">
                    <div className="flex items-baseline justify-between">
                      <span className="font-black text-lg text-foreground">
                        {defaultVariant ? `₹${defaultVariant.price}` : 'Price Unavailable'}
                      </span>
                      {defaultVariant?.compareAtPrice && defaultVariant.compareAtPrice > defaultVariant.price && (
                        <span className="text-xs text-muted-foreground line-through font-semibold">
                          ₹{defaultVariant.compareAtPrice}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => handleAddToBag(product)}
                      disabled={isOutOfStock}
                      className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-white font-bold gap-2 py-5 rounded-xl cursor-pointer shadow-md shadow-amber-500/5"
                    >
                      <ShoppingBag className="h-4 w-4" /> Add to Bag
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </div>
  );
}
