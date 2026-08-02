'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/axios';
import { useAppSelector } from '@/hooks/redux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Plus, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      const dataObj = res.data?.data || res.data;
      const list = Array.isArray(dataObj?.results)
        ? dataObj.results
        : Array.isArray(dataObj?.docs)
        ? dataObj.docs
        : Array.isArray(dataObj)
        ? dataObj
        : [];
      setCategories(list);
    } catch (e: any) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    let currentToken = accessToken;
    let currentUser = user;
    if (typeof window !== 'undefined' && (!currentToken || !currentUser)) {
      try {
        const storedUser = localStorage.getItem('sanab_user');
        const storedToken = localStorage.getItem('sanab_accessToken');
        if (storedUser) currentUser = JSON.parse(storedUser);
        if (storedToken) currentToken = storedToken;
      } catch (e) {}
    }

    if (!currentToken || currentUser?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/auth/login?from=' + encodeURIComponent('/admin/categories'));
      return;
    }
    loadData();
  }, [mounted, accessToken, user, loadData, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await api.patch(`/categories/${editingId}`, { name, description });
        toast.success('Category updated successfully!');
        setEditingId(null);
      } else {
        await api.post('/categories', { name, description });
        toast.success('Category created successfully!');
      }
      setName('');
      setDescription('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat._id || cat.id);
    setName(cat.name || '');
    setDescription(cat.description || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted successfully!');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header matching Screenshot 9 */}
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-border hover:bg-muted/20">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Categories</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage catalogue collections and categories</p>
          </div>
        </div>

        {/* 2-Column Grid matching Screenshot 9 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Create / Edit Category Form */}
          <div className="md:col-span-5">
            <Card className="border border-border/80 bg-card rounded-2xl p-6 shadow-sm space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground">
                  {editingId ? 'Edit Category' : 'Create Category'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {editingId ? 'Update existing collection details' : 'Add a new collection category to group products'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Category Name *</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Gold Necklaces"
                    className="h-11 rounded-xl bg-background border-border text-xs focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Fine 22kt and 18kt gold necklaces"
                    className="w-full rounded-xl bg-background border border-border text-xs p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    {submitting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : editingId ? (
                      'Update Category'
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> Add Category
                      </>
                    )}
                  </Button>

                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="h-11 px-4 rounded-xl border-border text-xs font-bold"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>

          {/* Right Column: Existing Categories List */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Existing Categories</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={loadData}
                className="h-9 w-9 rounded-xl border-border text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {categories.length === 0 ? (
              <Card className="border border-border/80 bg-card rounded-2xl p-8 text-center text-muted-foreground text-xs font-semibold">
                No categories found. Create your first category using the form on the left.
              </Card>
            ) : (
              <div className="space-y-3">
                {categories.map((cat: any) => {
                  const catId = cat._id || cat.id;
                  return (
                    <Card
                      key={catId}
                      className="border border-border/80 bg-card hover:border-border rounded-2xl p-5 transition-all flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-foreground">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">
                          /{cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}
                        </p>
                        {cat.description && (
                          <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(cat)}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(catId)}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
