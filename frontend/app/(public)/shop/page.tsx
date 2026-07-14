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
    
    const initialFilters: any = {};
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
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground capitalize">
              {filters.type ? `${filters.type} Catalog` : 'Explore All Collections'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Discover fine hand-crafted jewellery and premium cosmetic formulations.
            </p>
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
              <div className="flex h-96 items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-2xl bg-background/50 h-96">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4 animate-bounce" />
                <h3 className="text-xl font-bold text-foreground">No Products Found</h3>
                <p className="text-sm text-muted-foreground mt-1">Try relaxing some of your filter criteria or tags.</p>
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
