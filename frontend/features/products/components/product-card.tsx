'use client';

import Link from 'next/link';
import Image from 'next/image';
import { IProduct } from '../types/product.types';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addToCart } from '@/features/cart';
import { api } from '@/services/axios';
import { toast } from 'sonner';
import { useState } from 'react';
import { ProductQuickView } from './product-quick-view';

interface ProductCardProps {
  product: IProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const [wishlisted, setWishlisted] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const cheapestVariant = product.variants?.reduce(
    (min, v) => (v.price < min ? v.price : min),
    product.variants[0]?.price || 0
  );
  const activeVariant = product.variants?.find((v) => v.isActive && v.stock > 0) || product.variants?.[0];
  const originalPrice = product.variants[0]?.compareAtPrice;
  const primaryImage = product.images?.[0] || '/images/placeholder.jpg';
  const discount =
    originalPrice && originalPrice > cheapestVariant
      ? Math.round(((originalPrice - cheapestVariant) / originalPrice) * 100)
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !accessToken) {
      toast.error('Please log in to add items to your cart.');
      window.location.href = '/auth/login';
      return;
    }
    if (!activeVariant) {
      toast.error('This product is currently out of stock.');
      return;
    }
    setCartLoading(true);
    dispatch(addToCart({ product, variant: activeVariant, quantity: 1 }));
    toast.success('Added to cart!', {
      description: product.name,
    });
    setTimeout(() => setCartLoading(false), 600);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !accessToken) {
      toast.error('Please log in to save items to your wishlist.');
      window.location.href = '/auth/login';
      return;
    }
    const pId = product._id || (product as any).id;
    if (!pId) {
      toast.error('Invalid product item.');
      return;
    }
    try {
      if (user && accessToken) {
        await api.post('/wishlist', { productId: pId });
      }
    } catch (err: any) {
      // Continue to local storage fallback
    } finally {
      try {
        const stored = localStorage.getItem('sanab_local_wishlist');
        const list = stored ? JSON.parse(stored) : [];
        if (!list.some((item: any) => item._id === pId)) {
          list.push(product);
          localStorage.setItem('sanab_local_wishlist', JSON.stringify(list));
        }
      } catch (e) {}
      setWishlisted(true);
      toast.success('Saved to wishlist!');
    }
  };

  return (
    <Link href={`/shop/${product.slug}`} className="block h-full">
      <Card className="group overflow-hidden rounded-2xl border-border bg-background/50 hover:bg-background transition-all duration-300 hover:shadow-xl relative flex flex-col h-full cursor-pointer">

        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted/20">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />

          {/* Anti-Tarnish Badge (PRAO Feature) */}
          {(product.tags?.includes('anti-tarnish') || product.brand === 'PRAO Paris' || product.name.toLowerCase().includes('anti-tarnish')) && (
            <div className="absolute left-3 top-3 z-10 bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1 border border-amber-300">
              <span>✨</span> Anti-Tarnish
            </div>
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <div className={`absolute top-3 ${product.tags?.includes('anti-tarnish') || product.brand === 'PRAO Paris' ? 'left-28' : 'left-3'} bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md z-10`}>
              -{discount}%
            </div>
          )}

          {/* Wishlist Button - Default Normal & Filled When Wishlisted */}
          <div className="absolute right-3 top-3 z-20">
            <button
              onClick={handleWishlist}
              title={wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              className={`p-2.5 rounded-full transition-all duration-200 active:scale-90 shadow-sm ${
                wishlisted
                  ? 'bg-rose-500 text-white shadow-rose-500/30 scale-105 border border-rose-500'
                  : 'bg-white/90 text-slate-700 hover:text-rose-500 hover:bg-white backdrop-blur-md border border-slate-200/80 hover:shadow-md'
              }`}
            >
              <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-current text-white' : 'fill-none'}`} />
            </button>
          </div>


          {/* Add to Cart bar on bottom hover */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            <button
              onClick={handleAddToCart}
              disabled={!activeVariant || cartLoading}
              className={`w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                !activeVariant
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold'
              }`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {cartLoading ? 'Adding...' : !activeVariant ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Info */}
        <CardContent className="flex flex-col flex-1 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-amber-600">{product.brand}</span>
            <span className="bg-muted px-2 py-0.5 rounded-full capitalize">{product.type}</span>
          </div>

          <h3 className="font-bold text-foreground group-hover:text-amber-500 transition-colors text-sm line-clamp-2 min-h-[2.5rem] leading-snug">
            {product.name}
          </h3>

          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.round(product.ratingsAverage || 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30 fill-none'}`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({product.ratingsQuantity || 0})</span>
          </div>

          <div className="pt-1 flex items-baseline gap-2 mt-auto">
            <span className="text-base font-extrabold text-foreground">₹{cheapestVariant?.toLocaleString('en-IN')}</span>
            {originalPrice && originalPrice > cheapestVariant && (
              <span className="text-xs text-muted-foreground line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
        </CardContent>

      </Card>
    </Link>
  );
}


