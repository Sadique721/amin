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
      toast.error('Log in to save to wishlist', {
        action: { label: 'Log In', onClick: () => (window.location.href = '/auth/login') },
      });
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

          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute left-3 top-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-md">
              -{discount}%
            </div>
          )}

          {/* Quick action buttons (appear on hover) */}
          <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
            <button
              onClick={handleWishlist}
              title="Add to Wishlist"
              className={`p-2 rounded-full shadow-lg text-white transition-all duration-200 active:scale-90 ${
                wishlisted
                  ? 'bg-rose-500'
                  : 'bg-background/80 text-foreground hover:bg-rose-500 hover:text-white backdrop-blur-sm'
              }`}
            >
              <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Add to Cart bar on bottom hover */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={!activeVariant || cartLoading}
              className={`w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                !activeVariant
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
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
                className={`h-3 w-3 ${i < Math.round(product.ratingsAverage) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30 fill-none'}`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({product.ratingsQuantity})</span>
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
