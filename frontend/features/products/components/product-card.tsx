'use client';

import Link from 'next/link';
import Image from 'next/image';
import { IProduct } from '../types/product.types';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface ProductCardProps {
  product: IProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const cheapestVariant = product.variants?.reduce(
    (min, v) => (v.price < min ? v.price : min),
    product.variants[0]?.price || 0
  );

  const originalPrice = product.variants[0]?.compareAtPrice;
  const primaryImage = product.images?.[0] || '/images/placeholder.jpg';

  return (
    <Link href={`/shop/${product.slug}`}>
      <Card className="group overflow-hidden rounded-2xl border-border bg-background/50 hover:bg-background transition-all duration-300 hover:shadow-xl relative flex flex-col h-full cursor-pointer">
        
        <div className="relative aspect-square w-full overflow-hidden bg-muted/20">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {originalPrice && originalPrice > cheapestVariant && (
            <div className="absolute left-3 top-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-md">
              Sale
            </div>
          )}
        </div>

        <CardContent className="flex flex-col flex-1 p-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-amber-600">{product.brand}</span>
            <span className="bg-muted px-2 py-0.5 rounded-full capitalize">{product.type}</span>
          </div>

          <h3 className="font-bold text-foreground group-hover:text-amber-500 transition-colors text-base line-clamp-2 min-h-[3rem] leading-snug">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="h-4 w-4 fill-current" />
            </div>
            <span className="text-sm font-bold text-foreground">{product.ratingsAverage}</span>
            <span className="text-xs text-muted-foreground">({product.ratingsQuantity})</span>
          </div>

          <div className="pt-2 flex items-baseline gap-2 mt-auto">
            <span className="text-lg font-extrabold text-foreground">₹{cheapestVariant}</span>
            {originalPrice && originalPrice > cheapestVariant && (
              <span className="text-sm text-muted-foreground line-through">₹{originalPrice}</span>
            )}
          </div>
        </CardContent>

      </Card>
    </Link>
  );
}
