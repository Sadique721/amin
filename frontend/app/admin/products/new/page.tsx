'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/axios';
import { useAppSelector } from '@/hooks/redux';
import Image from 'next/image';
import {
  fetchProductByIdApi,
  createProductApi,
  updateProductApi,
  fetchCategoriesApi
} from '@/features/products';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  RefreshCw,
  Check,
  X,
  Sparkles,
  Info,
  Settings,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  const productId = searchParams.get('id');
  const isEditMode = !!productId;

  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  // Core Form State
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [brand, setBrand] = React.useState('');
  const [type, setType] = React.useState<'jewellery' | 'cosmetics'>('jewellery');
  const [category, setCategory] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);

  // Specifications (Dynamic list of key-value pairs)
  const [specifications, setSpecifications] = React.useState<{ key: string; value: string }[]>([]);

  // Variants State
  const [variants, setVariants] = React.useState<any[]>([
    {
      sku: '',
      price: 0,
      compareAtPrice: 0,
      stock: 0,
      isActive: true,
      attributes: [{ key: '', value: '' }],
      images: [],
    },
  ]);

  // General Product Images
  const [images, setImages] = React.useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = React.useState(false);

  // Load categories and initial product details if editing
  React.useEffect(() => {
    if (!accessToken || user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/auth/login?redirect=/admin/products/new');
      return;
    }

    async function initialize() {
      try {
        setLoading(true);
        // Load categories
        const catRes = await fetchCategoriesApi();
        setCategories(catRes.data || []);

        if (isEditMode) {
          const prodRes = await fetchProductByIdApi(productId!);
          const product = prodRes.data;

          setName(product.name || '');
          setDescription(product.description || '');
          setBrand(product.brand || '');
          setType(product.type || 'jewellery');
          setCategory(product.category?._id || product.category || '');
          setTags(product.tags || []);
          setIsActive(product.isActive !== false);
          setImages(product.images || []);

          // Parse specifications (Map to array of objects)
          const specs = product.specifications || {};
          const specList = Object.entries(specs).map(([key, value]) => ({
            key,
            value: String(value),
          }));
          setSpecifications(specList);

          // Parse variants
          const vars = product.variants?.map((v: any) => {
            const attrs = v.attributes || {};
            // Convert Map/Object to array
            const attrList = Object.entries(attrs).map(([key, value]) => ({
              key,
              value: String(value),
            }));

            return {
              sku: v.sku || '',
              price: v.price || 0,
              compareAtPrice: v.compareAtPrice || 0,
              stock: v.stock || 0,
              isActive: v.isActive !== false,
              attributes: attrList.length > 0 ? attrList : [{ key: '', value: '' }],
              images: v.images || [],
            };
          });

          setVariants(vars?.length > 0 ? vars : [
            {
              sku: '',
              price: 0,
              compareAtPrice: 0,
              stock: 0,
              isActive: true,
              attributes: [{ key: '', value: '' }],
              images: [],
            },
          ]);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Initialization failed.');
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, [accessToken, user, isEditMode, productId, router]);

  // Image Upload helper
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, variantIndex?: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);

      // Call single upload API
      const res = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data.data.url;

      if (variantIndex !== undefined) {
        // Add to variant images
        const updated = [...variants];
        updated[variantIndex].images = [...(updated[variantIndex].images || []), uploadedUrl];
        setVariants(updated);
      } else {
        // Add to general images
        setImages((prev) => [...prev, uploadedUrl]);
      }
      toast.success('Image uploaded successfully to Cloudinary');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove uploaded image
  const handleRemoveImage = (index: number, variantIndex?: number) => {
    if (variantIndex !== undefined) {
      const updated = [...variants];
      updated[variantIndex].images = updated[variantIndex].images.filter((_: any, i: number) => i !== index);
      setVariants(updated);
    } else {
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Specifications Handlers
  const addSpecification = () => {
    setSpecifications((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...specifications];
    updated[index][field] = val;
    setSpecifications(updated);
  };

  // Variants Handlers
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        sku: '',
        price: 0,
        compareAtPrice: 0,
        stock: 0,
        isActive: true,
        attributes: [{ key: '', value: '' }],
        images: [],
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      toast.warning('A product must have at least one variant.');
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const addVariantAttribute = (variantIndex: number) => {
    const updated = [...variants];
    updated[variantIndex].attributes = [...updated[variantIndex].attributes, { key: '', value: '' }];
    setVariants(updated);
  };

  const removeVariantAttribute = (variantIndex: number, attrIndex: number) => {
    const updated = [...variants];
    updated[variantIndex].attributes = updated[variantIndex].attributes.filter((_: any, i: number) => i !== attrIndex);
    setVariants(updated);
  };

  const handleVariantAttributeChange = (variantIndex: number, attrIndex: number, field: 'key' | 'value', value: string) => {
    const updated = [...variants];
    updated[variantIndex].attributes[attrIndex][field] = value;
    setVariants(updated);
  };

  // Tag list helpers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !brand || !category) {
      toast.error('Please fill in all general product fields.');
      return;
    }

    // Validate variants
    for (const v of variants) {
      if (!v.sku) {
        toast.error('All variants must have a valid SKU identifier.');
        return;
      }
      if (v.price <= 0) {
        toast.error(`Variant SKU ${v.sku} must have a price greater than 0.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      // Format specifications from key-value pairs back to Record Map
      const specsObj: Record<string, string> = {};
      specifications.forEach((s) => {
        if (s.key.trim() && s.value.trim()) {
          specsObj[s.key.trim()] = s.value.trim();
        }
      });

      // Format variants (convert key-value attributes list to Record Map)
      const formattedVariants = variants.map((v) => {
        const attrsObj: Record<string, string> = {};
        v.attributes.forEach((a: any) => {
          if (a.key.trim() && a.value.trim()) {
            attrsObj[a.key.trim()] = a.value.trim();
          }
        });

        return {
          sku: v.sku,
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
          stock: Number(v.stock),
          isActive: v.isActive,
          attributes: attrsObj,
          images: v.images,
        };
      });

      const payload = {
        name,
        description,
        brand,
        type,
        category,
        tags,
        isActive,
        images,
        specifications: specsObj,
        variants: formattedVariants,
      };

      if (isEditMode) {
        await updateProductApi(productId!, payload);
        toast.success('Product updated successfully!');
      } else {
        await createProductApi(payload);
        toast.success('New product created successfully!');
      }

      router.push('/admin/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save product details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/10 flex items-center justify-center p-6">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <Link href="/admin/products" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-500 mb-2 select-none transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Products
            </Link>
            <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
              {isEditMode ? 'Edit Product Details' : 'Add New Product'} <Sparkles className="h-6 w-6 text-amber-500" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure product details, dynamic attributes, variants, pricing, inventory levels, and upload images.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* section 1: Basic Info */}
          <Card className="border-border bg-background p-6 rounded-2xl shadow-sm">
            <CardContent className="p-0 space-y-6">
              <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-amber-500" /> 1. General Product Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-bold text-muted-foreground">Product Name *</label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter product title..."
                    className="focus-visible:ring-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="brand" className="text-xs font-bold text-muted-foreground">Brand Name *</label>
                  <Input
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                    placeholder="e.g. CaratLane, L'Oreal"
                    className="focus-visible:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="description" className="text-xs font-bold text-muted-foreground">Description *</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Provide a detailed description of materials, benefits, dimensions, styles..."
                  rows={4}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="type" className="text-xs font-bold text-muted-foreground">Domain Type *</label>
                  <Select value={type} onValueChange={(val: any) => setType(val)}>
                    <SelectTrigger className="w-full bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jewellery">Jewellery</SelectItem>
                      <SelectItem value="cosmetics">Cosmetics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="category" className="text-xs font-bold text-muted-foreground">Collection Category *</label>
                  <Select value={category} onValueChange={(val) => setCategory(val || '')}>
                    <SelectTrigger className="w-full bg-background border-border">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground block">Active Visibility</label>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer mt-1 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                    }`}
                  >
                    {isActive ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    {isActive ? 'Visible in Catalog' : 'Hidden / Draft'}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Tags (Press Enter to add)</label>
                <div className="flex flex-wrap gap-2 border border-border p-2 rounded-xl min-h-[46px] bg-background">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg text-xs font-bold text-foreground">
                      {t}
                      <button type="button" onClick={() => handleRemoveTag(t)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={tags.length === 0 ? "e.g. Gold, Matte, Waterproof" : ""}
                    className="flex-1 bg-transparent border-0 outline-0 ring-0 text-sm focus:outline-none"
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* section 2: Dynamic Specifications */}
          <Card className="border-border bg-background p-6 rounded-2xl shadow-sm">
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Settings className="h-5 w-5 text-amber-500" /> 2. Specifications & Attributes
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={addSpecification} className="border-border rounded-xl font-bold flex items-center gap-1 select-none">
                  <Plus className="h-4 w-4" /> Add Row
                </Button>
              </div>

              {specifications.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4 bg-muted/10 border border-dashed rounded-xl">
                  No specifications added yet. Add attributes like Karat, Stone Type, Volume, or Certification.
                </p>
              ) : (
                <div className="space-y-3">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <Input
                        placeholder="Specification Key (e.g. Metal Karat)"
                        value={spec.key}
                        onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                        className="flex-1 focus-visible:ring-amber-500"
                      />
                      <Input
                        placeholder="Specification Value (e.g. 18k Gold)"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        className="flex-1 focus-visible:ring-amber-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSpecification(index)}
                        className="text-rose-600 hover:bg-rose-50/10 hover:border hover:border-rose-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* section 3: Product General Gallery */}
          <Card className="border-border bg-background p-6 rounded-2xl shadow-sm">
            <CardContent className="p-0 space-y-6">
              <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-amber-500" /> 3. General Photo Gallery
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square border border-border rounded-xl overflow-hidden group bg-muted/20">
                    <Image src={img} alt="Product image" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 bg-background/90 hover:bg-rose-500 hover:text-white p-1.5 rounded-full shadow border transition-colors cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                <label className={`relative aspect-square border border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 transition-colors ${uploadingImage ? 'pointer-events-none opacity-50' : ''}`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e)}
                    className="hidden"
                  />
                  {uploadingImage ? (
                    <RefreshCw className="h-6 w-6 text-amber-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Upload Photo</span>
                    </>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>

          {/* section 4: Product Variants */}
          <Card className="border-border bg-background p-6 rounded-2xl shadow-sm">
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-5 w-5 text-amber-500" /> 4. Product Variants
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={addVariant} className="border-border rounded-xl font-bold flex items-center gap-1 select-none">
                  <Plus className="h-4 w-4" /> Add Variant
                </Button>
              </div>

              <div className="space-y-8 divide-y divide-border/60">
                {variants.map((v, vIdx) => (
                  <div key={vIdx} className={`space-y-4 ${vIdx > 0 ? 'pt-6' : ''}`}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest">
                        Variant #{vIdx + 1}
                      </h4>
                      {variants.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(vIdx)}
                          className="text-rose-600 hover:bg-rose-50/10 font-bold text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">SKU Code *</label>
                        <Input
                          placeholder="e.g. GLD-RG-18K-001"
                          value={v.sku}
                          onChange={(e) => handleVariantChange(vIdx, 'sku', e.target.value)}
                          className="focus-visible:ring-amber-500 h-9 text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Price (₹) *</label>
                        <Input
                          type="number"
                          placeholder="Selling Price"
                          value={v.price || ''}
                          onChange={(e) => handleVariantChange(vIdx, 'price', e.target.value)}
                          className="focus-visible:ring-amber-500 h-9 text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Compare Price (₹)</label>
                        <Input
                          type="number"
                          placeholder="MRP Price"
                          value={v.compareAtPrice || ''}
                          onChange={(e) => handleVariantChange(vIdx, 'compareAtPrice', e.target.value)}
                          className="focus-visible:ring-amber-500 h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Stock Level *</label>
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={v.stock || '0'}
                          onChange={(e) => handleVariantChange(vIdx, 'stock', e.target.value)}
                          className="focus-visible:ring-amber-500 h-9 text-xs"
                          required
                        />
                      </div>
                    </div>

                    {/* Variant Specific Attributes */}
                    <div className="space-y-3 bg-muted/10 border border-border p-4 rounded-xl">
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <h5 className="text-[10px] font-bold text-muted-foreground uppercase">Variant Swatches / Attributes</h5>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addVariantAttribute(vIdx)}
                          className="text-[10px] font-bold text-amber-500 h-6 px-2 hover:bg-amber-50/5"
                        >
                          <Plus className="h-3 w-3 mr-0.5" /> Add Attribute
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {v.attributes.map((attr: any, aIdx: number) => (
                          <div key={aIdx} className="flex gap-2 items-center">
                            <Input
                              placeholder="Attribute Key (e.g. shade, karat, size)"
                              value={attr.key}
                              onChange={(e) => handleVariantAttributeChange(vIdx, aIdx, 'key', e.target.value)}
                              className="flex-1 focus-visible:ring-amber-500 h-8 text-xs"
                            />
                            <Input
                              placeholder="Value (e.g. Ruby Red, 18k, 12)"
                              value={attr.value}
                              onChange={(e) => handleVariantAttributeChange(vIdx, aIdx, 'value', e.target.value)}
                              className="flex-1 focus-visible:ring-amber-500 h-8 text-xs"
                            />
                            {v.attributes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeVariantAttribute(vIdx, aIdx)}
                                className="text-rose-600 hover:bg-rose-50/10 p-1.5 rounded-lg border border-transparent hover:border-border transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Variant Specific Images */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase block">Variant Image Swatches</label>
                      <div className="flex flex-wrap gap-3">
                        {v.images?.map((img: string, imgIdx: number) => (
                          <div key={imgIdx} className="relative h-14 w-14 border border-border rounded-lg overflow-hidden bg-muted/20 group">
                            <Image src={img} alt="Variant image" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(imgIdx, vIdx)}
                              className="absolute top-1 right-1 bg-background/90 hover:bg-rose-500 hover:text-white p-1 rounded-full shadow cursor-pointer transition-colors"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}

                        <label className={`relative h-14 w-14 border border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 transition-colors ${uploadingImage ? 'pointer-events-none opacity-50' : ''}`}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, vIdx)}
                            className="hidden"
                          />
                          {uploadingImage ? (
                            <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />
                          ) : (
                            <>
                              <Upload className="h-4 w-4 text-muted-foreground" />
                              <span className="text-[8px] font-bold text-muted-foreground uppercase text-center mt-0.5">Upload</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 items-center justify-end select-none pt-4 border-t border-border">
            <Link href="/admin/products">
              <Button type="button" variant="outline" className="border-border rounded-xl font-bold py-6 px-8 hover:bg-muted/15 cursor-pointer">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-6 px-10 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" /> {isEditMode ? 'Save Changes' : 'Publish Product'}
                </>
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
