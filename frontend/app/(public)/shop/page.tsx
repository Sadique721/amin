'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  fetchProducts,
  fetchFacets,
  fetchCategories,
  setFilter,
  FilterSidebar,
  ProductCard
} from '@/features/products';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter, ShoppingBag } from 'lucide-react';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  const { items: products, filters, pagination, loading } = useAppSelector((state) => state.products);
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  React.useEffect(() => {
    const typeParam = searchParams.get('type');
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    const initialFilters: any = {
      search: searchParam || '',
    };
    if (typeParam === 'jewellery' || typeParam === 'cosmetics') {
      initialFilters.type = typeParam;
    }
    if (categoryParam) {
      initialFilters.category = categoryParam;
    }
    
    dispatch(setFilter(initialFilters));
    dispatch(fetchCategories());
    dispatch(fetchFacets(initialFilters.type));
  }, [searchParams, dispatch]);

  React.useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [filters, dispatch]);

  const handleSortChange = (value: string | null) => {
    if (value) {
      dispatch(setFilter({ sortBy: value }));
    }
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setFilter({ page: newPage }));
  };

  return (
    <div className="min-h-screen bg-muted/10 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* PRAO Anti-Tarnish Collection Banner Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-6 sm:p-8 text-white shadow-2xl border border-amber-500/20">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              <span>✨</span> PRAO Anti-Tarnish Edition <span>•</span> Waterproof & Lifetime Guarantee
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-amber-100 font-serif">
              Fine Anti-Tarnish Earrings & Luxury Collections
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore 100% tarnish-free, sweat-proof 18K gold plated earrings, evil eye hoops, crystal leaf climbers, and handcrafted jhumkas. Made for everyday luxury.
            </p>
          </div>
          {/* Quick Collection Pills */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => dispatch(setFilter({ search: '', category: '' }))}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${!filters.category ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              All Collections✨
            </button>
            {['Anti-Tarnish Earrings', 'Luxury Earrings', 'Hoops & Huggies', 'Jhumkas & Chaandbalis', 'Minimalist Studs', 'Gold Rings', 'Diamond Necklaces'].map((cat) => (
              <button
                key={cat}
                onClick={() => dispatch(setFilter({ search: cat }))}
                className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-white/10 text-amber-200 hover:bg-amber-500 hover:text-slate-950 transition-all border border-white/5"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground capitalize">
              {filters.type ? `${filters.type} Catalog` : filters.search ? `Results for "${filters.search}"` : 'Earrings & Fine Jewellery'}
            </h2>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <p className="text-sm text-muted-foreground">
                Discover fine hand-crafted anti-tarnish jewellery and premium cosmetic formulations.
              </p>
              {!loading && products.length > 0 && (
                <span className="text-[11px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {products.length} items
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Sort By</span>
            <Select value={filters.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest Arrivals</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="ratings">Top Rated</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden gap-2"
            >
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        {/* Anti-Tarnish Quick Filter Tag Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {[
            { label: '✨ Anti-Tarnish', val: 'anti-tarnish' },
            { label: '💧 Waterproof', val: 'waterproof' },
            { label: '🪙 Gold', val: 'gold' },
            { label: '🥈 Silver', val: 'silver' },
            { label: '💎 Diamond', val: 'diamond' },
            { label: '🌸 Jhumkas', val: 'jhumka' },
            { label: '⭕ Hoops', val: 'hoops' },
            { label: '🔵 Studs', val: 'studs' },
          ].map((tag) => (
            <button
              key={tag.val}
              onClick={() => dispatch(setFilter({ search: tag.val }))}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border ${
                filters.search === tag.val
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                  : 'bg-background border-border text-muted-foreground hover:border-amber-500/60 hover:text-amber-500'
              }`}
            >
              {tag.label}
            </button>
          ))}
          {filters.search && (
            <button
              onClick={() => dispatch(setFilter({ search: '' }))}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
            >
              ✕ Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          
          <div className="hidden lg:block lg:col-span-1">
            <FilterSidebar />
          </div>

          {showMobileFilters && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden">
              <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background p-6 shadow-xl overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">Filters</h2>
                  <Button variant="ghost" onClick={() => setShowMobileFilters(false)}>Close</Button>
                </div>
                <FilterSidebar />
              </div>
            </div>
          )}

          <div className="lg:col-span-3 space-y-8">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-border bg-background/50 animate-pulse">
                    <div className="aspect-square bg-muted/30" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 w-16 bg-muted/30 rounded" />
                      <div className="h-4 w-3/4 bg-muted/30 rounded" />
                      <div className="h-3 w-1/2 bg-muted/30 rounded" />
                      <div className="h-5 w-20 bg-muted/30 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-2xl bg-background/50 h-96">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4 animate-bounce" />
                <h3 className="text-xl font-bold text-foreground">No Products Found</h3>
                <p className="text-sm text-muted-foreground mt-1">Try relaxing some of your filter criteria or tags.</p>
                <button
                  onClick={() => dispatch(setFilter({ search: '', category: '' }))}
                  className="mt-4 px-4 py-2 rounded-full bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 border-t border-border pt-8">
                    <Button
                      variant="outline"
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-semibold text-muted-foreground px-4">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
