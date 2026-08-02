'use client';

import * as React from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setFilter, resetFilters } from '../store/productsSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw, ChevronRight } from 'lucide-react';

export function FilterSidebar() {
  const dispatch = useAppDispatch();
  const { filters, facets } = useAppSelector((state) => state.products);
  const { items: categories } = useAppSelector((state) => state.categories);

  const [searchVal, setSearchVal] = React.useState(filters.search);
  const [minPriceVal, setMinPriceVal] = React.useState(filters.minPrice?.toString() || '');
  const [maxPriceVal, setMaxPriceVal] = React.useState(filters.maxPrice?.toString() || '');

  // Defensive array fallback
  const categoryList = Array.isArray(categories) ? categories : [];
  const brandList = Array.isArray(facets?.brands) ? facets.brands : [];

  React.useEffect(() => {
    setSearchVal(filters.search);
    setMinPriceVal(filters.minPrice?.toString() || '');
    setMaxPriceVal(filters.maxPrice?.toString() || '');
  }, [filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilter({ search: searchVal }));
  };

  const handlePriceApply = () => {
    dispatch(
      setFilter({
        minPrice: minPriceVal ? Number(minPriceVal) : undefined,
        maxPrice: maxPriceVal ? Number(maxPriceVal) : undefined,
      })
    );
  };

  const handleBrandToggle = (brandName: string) => {
    const isSelected = (filters.brand || []).includes(brandName);
    const newBrands = isSelected
      ? (filters.brand || []).filter((b) => b !== brandName)
      : [...(filters.brand || []), brandName];
    dispatch(setFilter({ brand: newBrands }));
  };

  const handleCategorySelect = (categoryId: string) => {
    const newCategory = filters.category === categoryId ? '' : categoryId;
    dispatch(setFilter({ category: newCategory }));
  };

  return (
    <div className="space-y-8 bg-background/50 backdrop-blur-sm p-6 rounded-2xl border border-border">
      
      <form onSubmit={handleSearchSubmit} className="space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Search Products</h3>
        <div className="relative">
          <Input
            placeholder="Type keyword..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="pr-10 focus-visible:ring-amber-500"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Categories</h3>
        <div className="space-y-1">
          {categoryList.length > 0 ? (
            categoryList.map((cat, idx) => (
              <button
                key={cat._id || cat.slug || `category-${idx}`}
                onClick={() => handleCategorySelect(cat._id)}
                className={`flex w-full items-center justify-between py-1.5 px-2 rounded-lg text-sm font-medium transition-all ${
                  filters.category === cat._id
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'text-foreground hover:bg-muted/50'
                }`}
              >
                <span>{cat.name || 'Category'}</span>
                <ChevronRight className={`h-4 w-4 transition-transform ${filters.category === cat._id ? 'rotate-90' : ''}`} />
              </button>
            ))
          ) : (
            <p className="text-xs text-muted-foreground py-2">No categories available.</p>
          )}
        </div>
      </div>

      {brandList.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Brands</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {brandList.map((b, idx) => (
              <label key={b.name ? `brand-${b.name}` : `brand-${idx}`} className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-foreground select-none">
                <input
                  type="checkbox"
                  checked={(filters.brand || []).includes(b.name)}
                  onChange={() => handleBrandToggle(b.name)}
                  className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span>{b.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Price Range</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPriceVal}
            onChange={(e) => setMinPriceVal(e.target.value)}
            className="h-9 text-xs"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPriceVal}
            onChange={(e) => setMaxPriceVal(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
        <Button onClick={handlePriceApply} size="sm" variant="outline" className="w-full h-8 text-xs font-semibold">
          Filter Price
        </Button>
      </div>

      <Button
        onClick={() => {
          dispatch(resetFilters());
          setSearchVal('');
          setMinPriceVal('');
          setMaxPriceVal('');
        }}
        variant="ghost"
        size="sm"
        className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center gap-2"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset All Filters
      </Button>

    </div>
  );
}
