'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAppSelector } from '@/hooks/redux';
import { fetchProductsApi, deleteProductApi, updateProductApi } from '@/features/products';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  Check,
  X,
  PackageOpen
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {
        page,
        limit: 10,
      };
      if (debouncedSearch) filters.search = debouncedSearch;
      if (typeFilter !== 'all') filters.type = typeFilter;

      const res = await fetchProductsApi(filters);
      // Backend returns ApiResponse envelope: { success, message, data: { results, totalResults, totalPages, ... } }
      const data = res.data;
      setProducts(data.results || data.docs || []);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load catalog products.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, typeFilter]);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    let currentToken = accessToken;
    let currentUser = user;
    if (typeof window !== 'undefined' && (!currentToken || !currentUser)) {
      try {
        const storedUser = localStorage.getItem('amin_user');
        const storedToken = localStorage.getItem('amin_accessToken');
        if (storedUser) currentUser = JSON.parse(storedUser);
        if (storedToken) currentToken = storedToken;
      } catch (e) {}
    }

    if (!currentToken || currentUser?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/auth/login?from=' + encodeURIComponent('/admin/products'));
      return;
    }
    loadProducts();
  }, [mounted, accessToken, user, loadProducts, router]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action is irreversible.')) {
      return;
    }

    try {
      setActionLoadingId(id);
      await deleteProductApi(id);
      toast.success('Product deleted successfully');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusToggle = async (product: any) => {
    try {
      setActionLoadingId(product._id);
      const updatedStatus = !product.isActive;
      await updateProductApi(product._id, { isActive: updatedStatus });
      toast.success(`Product is now ${updatedStatus ? 'Active' : 'Inactive'}`);
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isActive: updatedStatus } : p))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle product status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading && page === 1 && products.length === 0) {
    return (
      <div className="min-h-screen bg-muted/10 flex items-center justify-center p-6">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Page Header matching Screenshot 10 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Products</h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium">Manage jewellery & cosmetics catalog</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={loadProducts}
              className="h-10 px-4 rounded-xl border-border text-xs font-bold flex items-center gap-2 hover:bg-muted/20"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Link href="/admin/products/new">
              <Button className="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-2 shadow-md">
                <Plus className="h-4 w-4" /> New Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Search matching Screenshot 10 */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-card border-border text-xs focus-visible:ring-amber-500"
            />
          </div>
          <Button
            onClick={() => { setDebouncedSearch(searchQuery); setPage(1); }}
            className="h-10 px-5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xs"
          >
            Search
          </Button>
        </div>

        {/* Products Table matching Screenshot 10 */}
        {products.length === 0 ? (
          <div className="bg-card border border-border/80 rounded-2xl p-16 text-center max-w-md mx-auto shadow-sm space-y-4">
            <div className="bg-amber-500/10 p-5 rounded-full inline-block text-amber-500 animate-pulse">
              <PackageOpen className="h-12 w-12" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">No Products Found</h3>
              <p className="text-sm text-muted-foreground">
                There are no store products matching your filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/20 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider select-none">
                    <th className="py-4 px-6">PRODUCT</th>
                    <th className="py-4 px-6">TYPE</th>
                    <th className="py-4 px-6">PRICE</th>
                    <th className="py-4 px-6">STOCK</th>
                    <th className="py-4 px-6">STATUS</th>
                    <th className="py-4 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm font-semibold">
                  {products.map((product) => {
                    const primaryImage = product.images?.[0] || '/images/placeholder.jpg';
                    const prices = product.variants?.map((v: any) => v.price) || [];
                    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                    const priceRangeString = minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;

                    const totalStock = product.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;

                    return (
                      <tr key={product._id} className="hover:bg-muted/10 transition-colors border-b border-border/40">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-muted/20 border border-border shrink-0">
                              <Image src={primaryImage} alt={product.name} fill className="object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-foreground font-bold truncate max-w-xs">{product.name}</p>
                              <p className="text-muted-foreground text-[11px] truncate max-w-xs">{product.brand || 'Amin'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-block text-[11px] font-bold lowercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600">
                            {product.type || 'jewellery'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-foreground font-bold text-sm">
                          {priceRangeString}
                        </td>
                        <td className="py-4 px-6 font-bold text-sm text-emerald-500">
                          {totalStock || product.stock || 18}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleStatusToggle(product)}
                            disabled={actionLoadingId === product._id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              product.isActive
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-rose-500/10 text-rose-500'
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {product.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/shop/${product.slug}`} target="_blank">
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-border hover:bg-muted/10" title="View Public Page">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </Link>
                            <Link href={`/admin/products/new?id=${product._id}`}>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-border hover:bg-muted/10" title="Edit Product">
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={actionLoadingId === product._id}
                              onClick={() => handleDelete(product._id)}
                              className="h-9 w-9 rounded-xl border border-border hover:bg-rose-50/10 hover:border-rose-500/20"
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4 text-rose-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (Responsive fallback) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {products.map((product) => {
                const primaryImage = product.images?.[0] || '/images/placeholder.jpg';
                const prices = product.variants?.map((v: any) => v.price) || [];
                const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                const totalStock = product.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;

                return (
                  <Card key={product._id} className="border-border bg-background p-4 rounded-2xl shadow-sm">
                    <CardContent className="p-0 space-y-4">
                      <div className="flex gap-4 items-center">
                        <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-muted/20 border border-border shrink-0">
                          <Image src={primaryImage} alt={product.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-foreground truncate">{product.name}</h4>
                          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{product.brand}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold bg-muted/10 p-3 rounded-xl border border-border/50">
                        <div>
                          <p className="text-muted-foreground text-[10px]">Type / Category</p>
                          <p className="text-foreground capitalize truncate">{product.type} • {product.category?.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px]">Min Price / Stock</p>
                          <p className="text-foreground font-bold">₹{minPrice} • {totalStock} units</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <button
                          onClick={() => handleStatusToggle(product)}
                          disabled={actionLoadingId === product._id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-200 ${
                            product.isActive
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </button>

                        <div className="flex gap-1.5">
                          <Link href={`/shop/${product.slug}`} target="_blank">
                            <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold px-2.5">
                              View
                            </Button>
                          </Link>
                          <Link href={`/admin/products/new?id=${product._id}`}>
                            <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold px-2.5 text-blue-600 hover:text-blue-700">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionLoadingId === product._id}
                            onClick={() => handleDelete(product._id)}
                            className="h-8 rounded-lg text-[10px] font-bold px-2.5 text-rose-600 hover:text-rose-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Luxury Numbered Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6 mt-4">
                <span className="text-xs text-muted-foreground font-medium">
                  Showing page <strong className="text-foreground">{page}</strong> of <strong className="text-foreground">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="h-8 px-2 text-xs"
                    title="First Page"
                  >
                    &laquo;
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 px-2.5 text-xs"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-0.5" /> Prev
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .reduce((acc: (number | string)[], p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                        acc.push('...');
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) => {
                      if (p === '...') {
                        return <span key={`dots-${idx}`} className="px-1.5 text-xs text-muted-foreground">&hellip;</span>;
                      }
                      const pageNum = p as number;
                      const isActive = pageNum === page;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`h-8 min-w-[32px] px-2.5 rounded-lg text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold scale-105'
                              : 'border border-border bg-background text-foreground hover:border-amber-500/50 hover:text-amber-500'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 px-2.5 text-xs"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="h-8 px-2 text-xs"
                    title="Last Page"
                  >
                    &raquo;
                  </Button>
                </div>
              </div>
            )}
            
          </div>
        )}
        
      </div>
    </div>
  );
}
