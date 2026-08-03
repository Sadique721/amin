'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ZoomIn,
} from 'lucide-react';
import { IProduct } from '../types/product.types';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addToCart } from '@/features/cart';
import { api } from '@/services/axios';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductQuickViewProps {
  product: IProduct | null;
  onClose: () => void;
}

export function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((s) => s.auth);

  const [currentImage, setCurrentImage] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // Reset on product change
  useEffect(() => {
    setCurrentImage(0);
    setSelectedVariantIdx(0);
    setQuantity(1);
    setWishlisted(false);
  }, [product?._id]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  if (!product) return null;

  const images = product.images?.length ? product.images : ['/images/placeholder.jpg'];
  const variants = product.variants || [];
  const selectedVariant = variants[selectedVariantIdx] || variants[0];
  const price = selectedVariant?.price ?? 0;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const discount = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;
  const inStock = !selectedVariant || (selectedVariant.stock ?? 0) > 0;
  const isAntiTarnish = product.tags?.includes('anti-tarnish') || product.brand === 'PRAO Paris';

  const handleAddToCart = () => {
    if (!user || !accessToken) {
      toast.error('Please log in to add items to your cart.');
      window.location.href = '/auth/login';
      return;
    }
    if (!selectedVariant) { toast.error('Select a variant first.'); return; }
    if (!inStock) { toast.error('Out of stock'); return; }
    setCartLoading(true);
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart({ product, variant: selectedVariant, quantity: 1 }));
    }
    toast.success(`${product.name} added to cart!`, { description: `Qty: ${quantity}` });
    setTimeout(() => setCartLoading(false), 600);
  };

  const handleWishlist = async () => {
    if (!user || !accessToken) {
      toast.error('Please log in to save items to your wishlist.');
      window.location.href = '/auth/login';
      return;
    }
    try {
      await api.post('/wishlist', { productId: product._id });
    } catch {}
    try {
      const stored = localStorage.getItem('sanab_local_wishlist');
      const list = stored ? JSON.parse(stored) : [];
      if (!list.some((item: any) => item._id === product._id)) {
        list.push(product);
        localStorage.setItem('sanab_local_wishlist', JSON.stringify(list));
      }
    } catch {}
    setWishlisted(true);
    toast.success('Saved to wishlist!');
  };


  const handleShare = () => {
    const url = `${window.location.origin}/shop/${product.slug}`;
    navigator.clipboard?.writeText(url).then(() => toast.success('Link copied!')).catch(() => {});
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-8"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      {/* Modal panel */}
      <div
        className="relative w-full max-w-4xl bg-background rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'quickview-in 0.25s cubic-bezier(0.22,1,0.36,1)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-muted transition-colors backdrop-blur-sm shadow-md"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* ─── Left: Image Gallery ─── */}
            <div className="relative bg-muted/10">
              {/* Main image */}
              <div className="relative aspect-square overflow-hidden group">
                <Image
                  src={images[currentImage]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
                {/* Badges */}
                {isAntiTarnish && (
                  <div className="absolute left-3 top-3 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                    ✨ Anti-Tarnish
                  </div>
                )}
                {discount > 0 && (
                  <div className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
                    -{discount}%
                  </div>
                )}
                {/* Image nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage((p) => (p - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted backdrop-blur-sm z-10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentImage((p) => (p + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted backdrop-blur-sm z-10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-none">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={cn(
                        'h-14 w-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all',
                        i === currentImage ? 'border-amber-500 scale-105' : 'border-border opacity-60 hover:opacity-100'
                      )}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ─── Right: Product Info ─── */}
            <div className="p-6 sm:p-8 flex flex-col gap-5 overflow-y-auto">
              {/* Brand + Type */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-extrabold text-amber-600 uppercase tracking-widest">{product.brand || 'SANAB'}</span>
                <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full capitalize">{product.type}</span>
                {isAntiTarnish && (
                  <span className="bg-amber-500/10 text-amber-600 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">PRAO Collection</span>
                )}
              </div>

              {/* Name */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground leading-snug font-serif">
                {product.name}
              </h2>

              {/* Stars */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(product.ratingsAverage ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20 fill-none'}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {product.ratingsAverage?.toFixed(1)} ({product.ratingsQuantity} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-foreground">₹{price.toLocaleString('en-IN')}</span>
                {compareAtPrice && compareAtPrice > price && (
                  <span className="text-base text-muted-foreground line-through">₹{compareAtPrice.toLocaleString('en-IN')}</span>
                )}
                {discount > 0 && (
                  <span className="text-sm font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">{discount}% OFF</span>
                )}
              </div>

              <div className="h-px bg-border" />

              {/* Variants */}
              {variants.length > 1 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Select Variant</label>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v, i) => {
                      const hasStock = (v.stock ?? 0) > 0;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedVariantIdx(i)}
                          disabled={!hasStock}
                          className={cn(
                            'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                            selectedVariantIdx === i
                              ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md'
                              : hasStock
                                ? 'border-border hover:border-amber-500 text-foreground'
                                : 'border-border text-muted-foreground/40 line-through cursor-not-allowed'
                          )}
                        >
                          {(v as any).size || (v as any).color || `Option ${i + 1}`}
                          {!hasStock && ' (OOS)'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Qty</label>
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-muted transition-colors text-sm font-bold"
                  >−</button>
                  <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min((selectedVariant?.stock ?? 99), q + 1))}
                    className="px-3 py-2 hover:bg-muted transition-colors text-sm font-bold"
                  >+</button>
                </div>
                {selectedVariant?.stock !== undefined && (
                  <span className="text-[11px] text-muted-foreground">{selectedVariant.stock} in stock</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || cartLoading}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all',
                    inStock
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:opacity-90 shadow-lg shadow-amber-500/20'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cartLoading ? 'Adding...' : !inStock ? 'Out of Stock' : `Add ${quantity > 1 ? `(${quantity}) ` : ''}to Cart`}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleWishlist}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border font-semibold text-sm transition-all',
                      wishlisted
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'border-border hover:border-rose-500 hover:text-rose-500 hover:bg-rose-500/5'
                    )}
                  >
                    <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
                    {wishlisted ? 'Wishlisted' : 'Wishlist'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-border hover:border-amber-500 hover:text-amber-500 font-semibold text-sm transition-all"
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                </div>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Truck, label: 'Free Delivery' },
                  { icon: ShieldCheck, label: 'BIS Certified' },
                  { icon: RefreshCw, label: '14-Day Return' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/20 text-center">
                    <Icon className="h-4 w-4 text-amber-500" />
                    <span className="text-[10px] font-semibold text-muted-foreground leading-tight">{label}</span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold bg-muted/30 text-muted-foreground px-2 py-0.5 rounded-full capitalize">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* View Full Detail CTA */}
              <Link
                href={`/shop/${product.slug}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-bold text-sm transition-all group"
              >
                View Full Product Details <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes quickview-in {
          from { opacity: 0; transform: scale(0.95) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
