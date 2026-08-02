'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchProductBySlugApi, IProduct, IVariant, VariantSelector } from '@/features/products';
import { addToCart } from '@/features/cart';
import { ZoomGallery } from '@/components/ui/zoom-gallery';
import { Button } from '@/components/ui/button';
import {
  RefreshCw, Star, ShoppingCart, ShieldCheck, Truck, RefreshCcw,
  PackageSearch, Heart, Zap, ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/axios';

export default function ShopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const { slug } = resolvedParams;

  // ─── All hooks MUST be declared unconditionally (Rules of Hooks) ───
  const [product, setProduct] = React.useState<IProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = React.useState<IVariant | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [wishlistLoading, setWishlistLoading] = React.useState(false);
  const [addedToWishlist, setAddedToWishlist] = React.useState(false);

  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  // ─── All images from product + selected variant ───────────────────
  const allImages = React.useMemo(() => {
    if (!product) return ['/images/placeholder.jpg'];
    const list = [...(product.images || [])];
    if (selectedVariant?.images) {
      selectedVariant.images.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : ['/images/placeholder.jpg'];
  }, [product, selectedVariant]);

  const isOutOfStock = React.useMemo(
    () => !selectedVariant || selectedVariant.stock <= 0,
    [selectedVariant]
  );

  const discount = React.useMemo(() => {
    if (!selectedVariant?.compareAtPrice || selectedVariant.compareAtPrice <= selectedVariant.price) return 0;
    return Math.round(((selectedVariant.compareAtPrice - selectedVariant.price) / selectedVariant.compareAtPrice) * 100);
  }, [selectedVariant]);

  // ─── Load product from API ─────────────────────────────────────────
  React.useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchProductBySlugApi(slug);
        const data = response.data;
        setProduct(data);
        if (data?.variants?.length > 0) {
          const firstActive = data.variants.find((v: IVariant) => v.isActive && v.stock > 0) || data.variants[0];
          setSelectedVariant(firstActive);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  // ─── Add to Cart ──────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    dispatch(addToCart({ product, variant: selectedVariant, quantity }));
    toast.success(`Added to cart!`, {
      description: `${product.name} × ${quantity} — ₹${(selectedVariant.price * quantity).toLocaleString('en-IN')}`,
    });
  };

  // ─── Buy Now ──────────────────────────────────────────────────────
  const handleBuyNow = () => {
    if (!product || !selectedVariant) return;
    dispatch(addToCart({ product, variant: selectedVariant, quantity }));
    toast.success('Redirecting to checkout...');
    // Navigate to checkout
    window.location.href = '/checkout';
  };

  // ─── Add to Wishlist ──────────────────────────────────────────────
  const handleAddToWishlist = async () => {
    if (!user || !accessToken) {
      toast.error('Please log in to save items to your wishlist.', {
        action: { label: 'Log In', onClick: () => window.location.href = '/auth/login' },
      });
      return;
    }
    if (!product) return;
    const targetId = product._id || (product as any).id;
    setWishlistLoading(true);
    try {
      if (user && accessToken) {
        await api.post('/wishlist', { productId: targetId });
      }
    } catch (err: any) {
      // Continue to local storage fallback
    } finally {
      try {
        const stored = localStorage.getItem('sanab_local_wishlist');
        const list = stored ? JSON.parse(stored) : [];
        if (!list.some((item: any) => item._id === targetId)) {
          list.push(product);
          localStorage.setItem('sanab_local_wishlist', JSON.stringify(list));
        }
      } catch (e) {}
      setAddedToWishlist(true);
      toast.success(`"${product.name}" added to wishlist!`);
      setWishlistLoading(false);
    }
  };

  // ─── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 animate-spin text-amber-500" />
          <p className="text-sm text-muted-foreground font-semibold tracking-widest uppercase">Loading Product...</p>
        </div>
      </div>
    );
  }

  // ─── Error / not found state ──────────────────────────────────────
  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <PackageSearch className="h-20 w-20 text-muted-foreground/30 mb-6" />
        <h2 className="text-3xl font-extrabold text-foreground">Product Not Found</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          The product you are looking for does not exist or has been removed.
        </p>
        <Link href="/shop" className="mt-6 inline-flex items-center gap-2 text-amber-500 font-bold hover:underline text-sm">
          <ChevronLeft className="h-4 w-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  // ─── Product detail render ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/10 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 bg-background border border-border rounded-3xl p-6 md:p-10 shadow-xl">

          {/* Gallery */}
          <div>
            <ZoomGallery images={allImages} />
          </div>

          {/* Info & CTA */}
          <div className="space-y-6 flex flex-col">
            {/* Brand + Type Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full">
                {product.brand}
              </span>
              <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full capitalize">
                {product.type}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(product.ratingsAverage ?? 0) ? 'fill-current' : 'stroke-current fill-none opacity-40'}`} />
                ))}
              </div>
              <span className="text-sm font-bold">{(product.ratingsAverage ?? 0).toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({product.ratingsQuantity ?? 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-foreground">
                  ₹{selectedVariant?.price?.toLocaleString('en-IN')}
                </span>
                {selectedVariant?.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
                  <span className="text-lg text-muted-foreground line-through font-semibold">
                    ₹{selectedVariant.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-sm font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    {discount}% OFF
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Inclusive of all taxes. Free shipping above ₹999.</p>
            </div>

            {/* Description */}
            <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-amber-500/40 pl-4">
              {product.description}
            </p>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && selectedVariant && (
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onVariantSelect={setSelectedVariant}
              />
            )}

            {/* Stock indicator */}
            {selectedVariant && !isOutOfStock && selectedVariant.stock <= 10 && (
              <p className="text-xs text-rose-500 font-bold">
                ⚡ Only {selectedVariant.stock} left in stock!
              </p>
            )}

            {/* Quantity + Actions */}
            <div className="space-y-3 pt-2 mt-auto">
              {!isOutOfStock && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qty:</span>
                  <div className="flex items-center border border-border rounded-xl bg-muted/20">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 font-bold hover:bg-muted/50 rounded-l-xl text-lg select-none transition-colors"
                    >−</button>
                    <span className="px-5 font-extrabold text-base w-12 text-center select-none">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedVariant!.stock, quantity + 1))}
                      className="px-4 py-2 font-bold hover:bg-muted/50 rounded-r-xl text-lg select-none transition-colors"
                    >+</button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-6 rounded-2xl font-bold text-base shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                </Button>

                <Button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`flex-1 py-6 rounded-2xl font-bold text-base shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'hidden'
                      : 'bg-foreground text-background hover:bg-foreground/80 shadow-foreground/10'
                  }`}
                >
                  <Zap className="h-5 w-5" />
                  Buy Now
                </Button>
              </div>

              <Button
                onClick={handleAddToWishlist}
                disabled={wishlistLoading || addedToWishlist}
                variant="outline"
                className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                  addedToWishlist
                    ? 'border-rose-500 text-rose-500 bg-rose-500/10'
                    : 'hover:border-rose-400 hover:text-rose-400 hover:bg-rose-500/5'
                }`}
              >
                <Heart className={`h-5 w-5 ${addedToWishlist ? 'fill-current' : ''}`} />
                {wishlistLoading ? 'Saving...' : addedToWishlist ? 'Saved to Wishlist ♥' : 'Add to Wishlist'}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border text-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="bg-amber-500/10 p-2.5 rounded-full text-amber-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-foreground">100% Genuine</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="bg-amber-500/10 p-2.5 rounded-full text-amber-600">
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-foreground">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="bg-amber-500/10 p-2.5 rounded-full text-amber-600">
                  <RefreshCcw className="h-5 w-5" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-foreground">7-Day Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="bg-background border border-border rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-extrabold text-foreground">Specifications & Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-3xl divide-y divide-border/50">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="flex justify-between py-3 text-sm font-semibold">
                  <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-foreground">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Link
                key={tag}
                href={`/shop?search=${tag}`}
                className="text-xs font-semibold bg-muted/40 hover:bg-amber-500/10 hover:text-amber-500 px-3 py-1 rounded-full transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
