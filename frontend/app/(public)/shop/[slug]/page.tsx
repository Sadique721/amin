'use client';

import * as React from 'react';
import { useAppDispatch } from '@/hooks/redux';
import { fetchProductBySlugApi, IProduct, IVariant, VariantSelector } from '@/features/products';
import { addToCart } from '@/features/cart';
import { ZoomGallery } from '@/components/ui/zoom-gallery';
import { Button } from '@/components/ui/button';
import { RefreshCw, Star, ShoppingCart, ShieldCheck, Truck, RefreshCcw, PackageSearch } from 'lucide-react';
import { toast } from 'sonner';

export default function ShopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const { slug } = resolvedParams;

  const [product, setProduct] = React.useState<IProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = React.useState<IVariant | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const response = await fetchProductBySlugApi(slug);
        setProduct(response.data);
        if (response.data?.variants?.length > 0) {
          setSelectedVariant(response.data.variants[0]);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    dispatch(addToCart({ product, variant: selectedVariant, quantity }));
    toast.success(`Added ${product.name} to cart!`, {
      description: `Quantity: ${quantity} • Price: ₹${selectedVariant.price * quantity}`,
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <PackageSearch className="h-16 w-16 text-muted-foreground/50 mb-4 animate-pulse" />
        <h2 className="text-2xl font-extrabold text-foreground">Product Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1">The product page you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  const allImages = React.useMemo(() => {
    const list = [...(product.images || [])];
    if (selectedVariant?.images) {
      selectedVariant.images.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : ['/images/placeholder.jpg'];
  }, [product, selectedVariant]);

  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl bg-background border border-border rounded-3xl p-6 md:p-10 shadow-xl space-y-12">
        
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          
          <div>
            <ZoomGallery images={allImages} />
          </div>

          <div className="space-y-6 flex flex-col">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full">
                {product.brand}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-2.5">
                <div className="flex items-center text-amber-400">
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <span className="text-sm font-bold">{product.ratingsAverage}</span>
                <span className="text-xs text-muted-foreground">({product.ratingsQuantity} verified customer reviews)</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-foreground">₹{selectedVariant?.price}</span>
                {selectedVariant?.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
                  <span className="text-lg text-muted-foreground line-through font-semibold">
                    ₹{selectedVariant.compareAtPrice}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Inclusive of all local taxes.</p>
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed">
              {product.description}
            </p>

            {selectedVariant && (
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onVariantSelect={setSelectedVariant}
              />
            )}

            <div className="space-y-4 pt-4 mt-auto">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {!isOutOfStock && (
                  <div className="flex items-center border border-border rounded-xl bg-muted/20">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2.5 font-bold hover:bg-muted/50 rounded-l-xl text-lg select-none"
                    >
                      -
                    </button>
                    <span className="px-6 font-extrabold text-base w-12 text-center select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                      className="px-4 py-2.5 font-bold hover:bg-muted/50 rounded-r-xl text-lg select-none"
                    >
                      +
                    </button>
                  </div>
                )}

                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full sm:flex-1 py-6 rounded-2xl font-bold text-base shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}
                </Button>
              </div>

              {selectedVariant && !isOutOfStock && selectedVariant.stock <= 5 && (
                <p className="text-xs text-rose-500 font-bold animate-pulse">
                  ⚠️ Only {selectedVariant.stock} items left in stock - order soon!
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border mt-8 text-center">
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

        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="border-t border-border pt-10 space-y-4">
            <h3 className="text-xl font-extrabold text-foreground">Specifications & Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-border/50 py-2.5 text-sm font-semibold">
                  <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-foreground">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
