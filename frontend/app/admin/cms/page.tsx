'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/services/axios';
import { useAppSelector } from '@/hooks/redux';
import {
  fetchBannersAllApi,
  createBannerApi,
  updateBannerApi,
  deleteBannerApi,
  fetchFaqsAllApi,
  createFaqApi,
  updateFaqApi,
  deleteFaqApi
} from '@/features/cms';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  RefreshCw,
  Plus,
  Trash2,
  Upload,
  Check,
  X,
  ChevronLeft,
  Sparkles,
  Layers,
  HelpCircle,
  Link as LinkIcon,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCmsPage() {
  const router = useRouter();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = React.useState<'banners' | 'faqs'>('banners');
  const [banners, setBanners] = React.useState<any[]>([]);
  const [faqs, setFaqs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  // Form states for adding/editing Banners
  const [showBannerForm, setShowBannerForm] = React.useState(false);
  const [editingBannerId, setEditingBannerId] = React.useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = React.useState('');
  const [bannerSubtitle, setBannerSubtitle] = React.useState('');
  const [bannerDesktopUrl, setBannerDesktopUrl] = React.useState('');
  const [bannerDesktopPublicId, setBannerDesktopPublicId] = React.useState('');
  const [bannerMobileUrl, setBannerMobileUrl] = React.useState('');
  const [bannerMobilePublicId, setBannerMobilePublicId] = React.useState('');
  const [bannerLinkUrl, setBannerLinkUrl] = React.useState('');
  const [bannerOrder, setBannerOrder] = React.useState(0);
  const [bannerType, setBannerType] = React.useState<'hero' | 'promotional' | 'grid'>('hero');
  const [bannerIsActive, setBannerIsActive] = React.useState(true);
  const [uploadingImage, setUploadingImage] = React.useState(false);

  // Form states for adding/editing FAQs
  const [showFaqForm, setShowFaqForm] = React.useState(false);
  const [editingFaqId, setEditingFaqId] = React.useState<string | null>(null);
  const [faqQuestion, setFaqQuestion] = React.useState('');
  const [faqAnswer, setFaqAnswer] = React.useState('');
  const [faqOrder, setFaqOrder] = React.useState(0);
  const [faqIsActive, setFaqIsActive] = React.useState(true);

  const loadCmsData = React.useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === 'banners') {
        const res = await fetchBannersAllApi();
        const dataObj = res.data?.data || res.data;
        const list = Array.isArray(dataObj?.results) ? dataObj.results : Array.isArray(dataObj) ? dataObj : [];
        setBanners(list);
      } else {
        const res = await fetchFaqsAllApi();
        const dataObj = res.data?.data || res.data;
        const list = Array.isArray(dataObj?.results) ? dataObj.results : Array.isArray(dataObj) ? dataObj : [];
        setFaqs(list);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load CMS records.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

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
        const storedUser = localStorage.getItem('sanab_user');
        const storedToken = localStorage.getItem('sanab_accessToken');
        if (storedUser) currentUser = JSON.parse(storedUser);
        if (storedToken) currentToken = storedToken;
      } catch (e) {}
    }

    if (!currentToken || currentUser?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/auth/login?from=' + encodeURIComponent('/admin/cms'));
      return;
    }
    loadCmsData();
  }, [mounted, accessToken, user, activeTab, loadCmsData, router]);

  // Image Upload for Banner
  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'desktop' | 'mobile') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { url, publicId } = res.data.data;

      if (field === 'desktop') {
        setBannerDesktopUrl(url);
        setBannerDesktopPublicId(publicId);
      } else {
        setBannerMobileUrl(url);
        setBannerMobilePublicId(publicId);
      }
      toast.success(`${field === 'desktop' ? 'Desktop' : 'Mobile'} image uploaded successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Banner Actions
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bannerDesktopUrl || !bannerDesktopPublicId) {
      toast.error('Desktop image is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        title: bannerTitle || undefined,
        subtitle: bannerSubtitle || undefined,
        desktopImage: {
          url: bannerDesktopUrl,
          publicId: bannerDesktopPublicId,
        },
        linkUrl: bannerLinkUrl || undefined,
        order: Number(bannerOrder),
        type: bannerType,
        isActive: bannerIsActive,
      };

      if (bannerMobileUrl && bannerMobilePublicId) {
        payload.mobileImage = {
          url: bannerMobileUrl,
          publicId: bannerMobilePublicId,
        };
      }

      if (editingBannerId) {
        await updateBannerApi(editingBannerId, payload);
        toast.success('Banner updated successfully!');
      } else {
        await createBannerApi(payload);
        toast.success('New banner created successfully!');
      }

      resetBannerForm();
      loadCmsData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save banner.');
    } finally {
      setSubmitting(false);
    }
  };

  const [submitting, setSubmitting] = React.useState(false);

  const handleEditBannerClick = (banner: any) => {
    setEditingBannerId(banner._id);
    setBannerTitle(banner.title || '');
    setBannerSubtitle(banner.subtitle || '');
    setBannerDesktopUrl(banner.desktopImage?.url || '');
    setBannerDesktopPublicId(banner.desktopImage?.publicId || '');
    setBannerMobileUrl(banner.mobileImage?.url || '');
    setBannerMobilePublicId(banner.mobileImage?.publicId || '');
    setBannerLinkUrl(banner.linkUrl || '');
    setBannerOrder(banner.order || 0);
    setBannerType(banner.type || 'hero');
    setBannerIsActive(banner.isActive !== false);
    setShowBannerForm(true);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;

    try {
      setActionLoadingId(id);
      await deleteBannerApi(id);
      toast.success('Banner deleted successfully');
      setBanners((prev) => prev.filter((b) => b._id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete banner.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBannerStatusToggle = async (banner: any) => {
    try {
      setActionLoadingId(banner._id);
      const updatedStatus = !banner.isActive;
      await updateBannerApi(banner._id, { isActive: updatedStatus });
      toast.success(`Banner status updated to ${updatedStatus ? 'Active' : 'Inactive'}`);
      setBanners((prev) =>
        prev.map((b) => (b._id === banner._id ? { ...b, isActive: updatedStatus } : b))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const resetBannerForm = () => {
    setEditingBannerId(null);
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerDesktopUrl('');
    setBannerDesktopPublicId('');
    setBannerMobileUrl('');
    setBannerMobilePublicId('');
    setBannerLinkUrl('');
    setBannerOrder(0);
    setBannerType('hero');
    setBannerIsActive(true);
    setShowBannerForm(false);
  };

  // FAQ Actions
  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!faqQuestion || !faqAnswer) {
      toast.error('Question and Answer are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        question: faqQuestion,
        answer: faqAnswer,
        order: Number(faqOrder),
        isActive: faqIsActive,
      };

      if (editingFaqId) {
        await updateFaqApi(editingFaqId, payload);
        toast.success('FAQ updated successfully!');
      } else {
        await createFaqApi(payload);
        toast.success('FAQ created successfully!');
      }

      resetFaqForm();
      loadCmsData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save FAQ.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFaqClick = (faq: any) => {
    setEditingFaqId(faq._id);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqOrder(faq.order || 0);
    setFaqIsActive(faq.isActive !== false);
    setShowFaqForm(true);
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      setActionLoadingId(id);
      await deleteFaqApi(id);
      toast.success('FAQ deleted successfully');
      setFaqs((prev) => prev.filter((f) => f._id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete FAQ.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFaqStatusToggle = async (faq: any) => {
    try {
      setActionLoadingId(faq._id);
      const updatedStatus = !faq.isActive;
      await updateFaqApi(faq._id, { isActive: updatedStatus });
      toast.success(`FAQ status updated to ${updatedStatus ? 'Active' : 'Inactive'}`);
      setFaqs((prev) =>
        prev.map((f) => (f._id === faq._id ? { ...f, isActive: updatedStatus } : f))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const resetFaqForm = () => {
    setEditingFaqId(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqOrder(0);
    setFaqIsActive(true);
    setShowFaqForm(false);
  };

  if (loading && banners.length === 0 && faqs.length === 0) {
    return (
      <div className="min-h-screen bg-muted/10 flex items-center justify-center p-6">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <Link href="/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-500 mb-2 select-none transition-colors">
              <ChevronLeft className="h-4 w-4" /> Admin Console
            </Link>
            <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
              CMS Layouts & Content <Sparkles className="h-6 w-6 text-amber-500" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure hero slides, promotional cards, grids, and edit frequently asked questions (FAQs).
            </p>
          </div>
          <Button
            onClick={() => {
              if (activeTab === 'banners') {
                resetBannerForm();
                setShowBannerForm(true);
              } else {
                resetFaqForm();
                setShowFaqForm(true);
              }
            }}
            className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="h-5 w-5" /> Add {activeTab === 'banners' ? 'Banner' : 'FAQ'}
          </Button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 border-b border-border pb-4 select-none">
          <button
            onClick={() => { setActiveTab('banners'); resetBannerForm(); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              activeTab === 'banners'
                ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                : 'bg-background border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="h-4 w-4" /> Carousel Banners
          </button>
          <button
            onClick={() => { setActiveTab('faqs'); resetFaqForm(); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              activeTab === 'faqs'
                ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                : 'bg-background border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <HelpCircle className="h-4 w-4" /> FAQ Questions
          </button>
        </div>

        {/* BANNERS FORM */}
        {activeTab === 'banners' && showBannerForm && (
          <Card className="border-border bg-background p-6 rounded-2xl shadow-md border-2 border-amber-500/10 animate-in fade-in zoom-in-95 duration-200">
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">
                  {editingBannerId ? 'Edit Banner Slide' : 'Create Banner Slide'}
                </h3>
                <button onClick={resetBannerForm} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleBannerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Banner Title (Optional)</label>
                    <Input
                      placeholder="e.g. Summer bridal collection"
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                      className="focus-visible:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Subtitle / Caption (Optional)</label>
                    <Input
                      placeholder="e.g. Flat 10% discount on platinum rings"
                      value={bannerSubtitle}
                      onChange={(e) => setBannerSubtitle(e.target.value)}
                      className="focus-visible:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Banner Type *</label>
                    <Select value={bannerType} onValueChange={(val: any) => setBannerType(val)}>
                      <SelectTrigger className="w-full bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hero">Hero Carousel</SelectItem>
                        <SelectItem value="promotional">Promo Bar</SelectItem>
                        <SelectItem value="grid">Grid Banner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Sort Order *</label>
                    <Input
                      type="number"
                      placeholder="e.g. 0, 1, 2"
                      value={bannerOrder}
                      onChange={(e) => setBannerOrder(Number(e.target.value))}
                      className="focus-visible:ring-amber-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Link Destination URL (Optional)</label>
                    <Input
                      placeholder="e.g. /shop?category=rings"
                      value={bannerLinkUrl}
                      onChange={(e) => setBannerLinkUrl(e.target.value)}
                      className="focus-visible:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Upload Image fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-muted/10 border border-border rounded-2xl">
                  {/* Desktop Image */}
                  <div className="space-y-3">
                    <label className="text-xs font-extrabold text-foreground block">Desktop Image (Ratio 16:9) *</label>
                    {bannerDesktopUrl ? (
                      <div className="relative aspect-video w-full border border-border rounded-xl overflow-hidden bg-muted/20">
                        <Image src={bannerDesktopUrl} alt="Desktop image preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => { setBannerDesktopUrl(''); setBannerDesktopPublicId(''); }}
                          className="absolute top-2 right-2 bg-background/90 hover:bg-rose-500 hover:text-white p-1.5 rounded-full shadow border transition-colors cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className={`aspect-video w-full border border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 transition-colors ${uploadingImage ? 'pointer-events-none opacity-50' : ''}`}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleBannerImageUpload(e, 'desktop')}
                          className="hidden"
                        />
                        {uploadingImage ? (
                          <RefreshCw className="h-6 w-6 text-amber-500 animate-spin" />
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Upload Desktop image</span>
                          </>
                        )}
                      </label>
                    )}
                  </div>

                  {/* Mobile Image */}
                  <div className="space-y-3">
                    <label className="text-xs font-extrabold text-foreground block">Mobile Image (Optional - Ratio 1:1)</label>
                    {bannerMobileUrl ? (
                      <div className="relative aspect-video w-full border border-border rounded-xl overflow-hidden bg-muted/20">
                        <Image src={bannerMobileUrl} alt="Mobile image preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => { setBannerMobileUrl(''); setBannerMobilePublicId(''); }}
                          className="absolute top-2 right-2 bg-background/90 hover:bg-rose-500 hover:text-white p-1.5 rounded-full shadow border transition-colors cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className={`aspect-video w-full border border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 transition-colors ${uploadingImage ? 'pointer-events-none opacity-50' : ''}`}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleBannerImageUpload(e, 'mobile')}
                          className="hidden"
                        />
                        {uploadingImage ? (
                          <RefreshCw className="h-6 w-6 text-amber-500 animate-spin" />
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Upload Mobile image</span>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Publish immediately</span>
                    <button
                      type="button"
                      onClick={() => setBannerIsActive(!bannerIsActive)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                        bannerIsActive
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      }`}
                    >
                      {bannerIsActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={resetBannerForm} className="border-border rounded-xl font-bold h-10 px-4">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-10 px-6 rounded-xl flex items-center gap-1">
                      {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* FAQs FORM */}
        {activeTab === 'faqs' && showFaqForm && (
          <Card className="border-border bg-background p-6 rounded-2xl shadow-md border-2 border-amber-500/10 animate-in fade-in zoom-in-95 duration-200">
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">
                  {editingFaqId ? 'Edit FAQ Query' : 'Create FAQ Query'}
                </h3>
                <button onClick={resetFaqForm} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFaqSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-3 space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">FAQ Question *</label>
                    <Input
                      placeholder="e.g. Do you ship jewellery internationally?"
                      value={faqQuestion}
                      onChange={(e) => setFaqQuestion(e.target.value)}
                      className="focus-visible:ring-amber-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Display Order *</label>
                    <Input
                      type="number"
                      placeholder="e.g. 0, 1, 2"
                      value={faqOrder}
                      onChange={(e) => setFaqOrder(Number(e.target.value))}
                      className="focus-visible:ring-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">FAQ Answer *</label>
                  <textarea
                    placeholder="Enter descriptive answer details..."
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    rows={4}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-amber-500"
                    required
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Publish immediately</span>
                    <button
                      type="button"
                      onClick={() => setFaqIsActive(!faqIsActive)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                        faqIsActive
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      }`}
                    >
                      {faqIsActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={resetFaqForm} className="border-border rounded-xl font-bold h-10 px-4">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-10 px-6 rounded-xl flex items-center gap-1">
                      {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* CMS DATA LISTINGS */}
        {activeTab === 'banners' ? (
          banners.length === 0 ? (
            <div className="bg-background border border-border rounded-3xl p-16 text-center max-w-md mx-auto shadow-sm space-y-4">
              <div className="bg-amber-500/10 p-5 rounded-full inline-block text-amber-500">
                <Layers className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">No Banners Configured</h3>
                <p className="text-sm text-muted-foreground">
                  Create sliders or promo cards to populate your online store homepage.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((b) => (
                <Card key={b._id} className="border-border bg-background shadow-sm hover:shadow transition-all rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div className="relative aspect-video w-full overflow-hidden bg-muted/20 border-b border-border">
                    <Image src={b.desktopImage?.url || '/images/placeholder.jpg'} alt="Banner Image" fill className="object-cover" />
                    <span className="absolute left-3 top-3 bg-black/60 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider">
                      {b.type} banner
                    </span>
                    <span className="absolute right-3 top-3 bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                      Rank {b.order}
                    </span>
                  </div>

                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-foreground text-base leading-snug truncate">
                        {b.title || 'Untitled Banner Slide'}
                      </h4>
                      {b.subtitle && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{b.subtitle}</p>
                      )}
                      {b.linkUrl && (
                        <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                          <LinkIcon className="h-3 w-3" /> {b.linkUrl}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                      <button
                        onClick={() => handleBannerStatusToggle(b)}
                        disabled={actionLoadingId === b._id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                          b.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        }`}
                      >
                        {b.isActive ? 'Active' : 'Inactive'}
                      </button>

                      <div className="flex gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => handleEditBannerClick(b)} className="h-8 rounded-lg text-[10px] font-bold px-2.5">
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoadingId === b._id}
                          onClick={() => handleDeleteBanner(b._id)}
                          className="h-8 rounded-lg text-[10px] font-bold px-2.5 text-rose-600 hover:bg-rose-50/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          faqs.length === 0 ? (
            <div className="bg-background border border-border rounded-3xl p-16 text-center max-w-md mx-auto shadow-sm space-y-4">
              <div className="bg-amber-500/10 p-5 rounded-full inline-block text-amber-500">
                <HelpCircle className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">No FAQs Configured</h3>
                <p className="text-sm text-muted-foreground">
                  Build structured FAQ accordions for customer reference.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq._id} className="border-border bg-background shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">
                          Order rank {faq.order}
                        </span>
                        <h4 className="font-extrabold text-foreground text-sm sm:text-base leading-snug">
                          {faq.question}
                        </h4>
                      </div>

                      <div className="flex gap-1.5 shrink-0 select-none">
                        <Button variant="outline" size="sm" onClick={() => handleEditFaqClick(faq)} className="h-8 rounded-lg text-[10px] font-bold px-2.5">
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoadingId === faq._id}
                          onClick={() => handleDeleteFaq(faq._id)}
                          className="h-8 rounded-lg text-[10px] font-bold px-2.5 text-rose-600 hover:bg-rose-50/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground bg-muted/10 p-4 border border-border/50 rounded-xl leading-relaxed">
                      {faq.answer}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => handleFaqStatusToggle(faq)}
                        disabled={actionLoadingId === faq._id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                          faq.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        }`}
                      >
                        {faq.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
        
      </div>
    </div>
  );
}
