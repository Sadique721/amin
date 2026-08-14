'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { buttonVariants } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus,
  HelpCircle,
  ShoppingBag,
  Star,
  Heart,
  Gem,
  Zap,
  Award,
  CheckCircle,
  TrendingUp,
  Play,
  ArrowUpRight
} from 'lucide-react';
import { fetchBannersApi, fetchFaqsApi, fetchCategoriesApi } from '@/features/cms/api/cms.api';
import { fetchProductsApi, ProductCard } from '@/features/products';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addToCart } from '@/features/cart';
import { toast } from 'sonner';

interface BannerItem {
  _id: string;
  title?: string;
  subtitle?: string;
  desktopImage: { url: string; publicId: string };
  mobileImage?: { url: string; publicId: string };
  linkUrl?: string;
  type: 'hero' | 'promotional' | 'grid';
}

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  image?: { url: string; publicId: string };
}

interface FaqItem {
  _id: string;
  question: string;
  answer: string;
}

interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  brand?: string;
  type?: string;
  images?: string[];
  tags?: string[];
  ratingsAverage?: number;
  ratingsQuantity?: number;
  variants?: { price: number; compareAtPrice?: number; stock?: number; isActive?: boolean }[];
}

const MARQUEE_BRANDS = ['BIS Hallmarked', 'PRAO Anti-Tarnish', 'IGI Certified Diamonds', 'Cruelty-Free Cosmetics', '100% Waterproof', 'Hypoallergenic', 'Sweat-Proof Jewellery', 'Lifetime Brilliance Guarantee', 'PVD Gold Plating', 'Lab-Tested Beauty'];

const TRUST_STATS = [
  { value: '50,000+', label: 'Happy Customers', icon: Heart },
  { value: '99.8%', label: 'Satisfaction Rate', icon: Star },
  { value: '100%', label: 'BIS Certified Gold', icon: ShieldCheck },
  { value: '48hr', label: 'Nationwide Delivery', icon: Truck },
];

const DEFAULT_FAQS = [
  { _id: 'f1', question: 'Are your gold and diamond jewellery items certified?', answer: 'Yes! All our fine jewellery items are 100% BIS Hallmarked and diamonds are certified by reputed international labs like IGI and GIA, ensuring supreme quality and trust.' },
  { _id: 'f2', question: 'What is the Anti-Tarnish guarantee on PRAO collections?', answer: 'PRAO collection pieces feature advanced PVD 18K gold and silver coating that is 100% waterproof, sweat-proof, and tarnish-free. You can wear them daily without worrying about color fading.' },
  { _id: 'f3', question: 'What is your domestic and international shipping policy?', answer: 'We offer free insured delivery across all domestic locations within 2-4 business days. Express international shipping is available worldwide.' },
  { _id: 'f4', question: 'Are your cosmetics cruelty-free and dermatologically tested?', answer: 'Absolutely. All our skincare and makeup products are 100% cruelty-free, dermatologically evaluated, hypoallergenic, and free from parabens or harsh synthetics.' },
  { _id: 'f5', question: 'How do I return or exchange an item?', answer: 'We offer a hassle-free 14-day replacement/exchange policy on unused items with original tags intact. Simply contact our concierge or initiate a return from your account dashboard.' },
];

const COLLECTION_HIGHLIGHTS = [
  { title: 'PRAO Anti-Tarnish', sub: 'Earrings & Hoops', tag: 'anti-tarnish', color: 'from-amber-900 to-slate-900', accent: 'text-amber-400', badge: '✨ Waterproof', desc: 'PVD 18K gold plated. 100% tarnish-free & sweat-proof.' },
  { title: 'Fine Diamonds', sub: 'Rings & Necklaces', tag: 'diamond', color: 'from-slate-900 to-rose-950', accent: 'text-rose-300', badge: '💎 IGI Certified', desc: 'Ethically sourced, conflict-free diamonds. IGI/GIA certified.' },
  { title: 'Luxury Cosmetics', sub: 'Skin & Lip Care', tag: 'cosmetics', color: 'from-rose-950 to-amber-950', accent: 'text-amber-300', badge: '🌿 Cruelty-Free', desc: 'Dermatologist tested. Paraben-free botanical formulations.' },
];

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  const [heroBanners, setHeroBanners] = useState<BannerItem[]>([]);
  const [promoBanners, setPromoBanners] = useState<BannerItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductItem[]>([]);
  const [activeTab, setActiveTab] = useState<'featured' | 'new' | 'antitarnish'>('featured');
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initCms() {
      try {
        const [bannersRes, faqsRes, categoriesRes] = await Promise.all([
          fetchBannersApi(),
          fetchFaqsApi(),
          fetchCategoriesApi()
        ]);

        const bannersData = bannersRes?.data || bannersRes;
        const bannersList = Array.isArray(bannersData) ? bannersData : (Array.isArray(bannersData?.results) ? bannersData.results : []);
        setHeroBanners(bannersList.filter((b: BannerItem) => b.type === 'hero'));
        setPromoBanners(bannersList.filter((b: BannerItem) => b.type !== 'hero'));

        const faqsData = faqsRes?.data || faqsRes;
        setFaqs(Array.isArray(faqsData) ? faqsData : (Array.isArray(faqsData?.results) ? faqsData.results : []));

        const catsData = categoriesRes?.data || categoriesRes;
        setCategories(Array.isArray(catsData) ? catsData : (Array.isArray(catsData?.results) ? catsData.results : []));
      } catch (err) {
        console.error('Failed to load CMS content', err);
      } finally {
        setLoading(false);
      }
    }
    initCms();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        setProductsLoading(true);
        const baseFilters = { search: '', category: '', brand: [], sortBy: 'newest', page: 1, limit: 8 } as any;
        const [featuredRes, newRes] = await Promise.all([
          fetchProductsApi({ ...baseFilters, sortBy: 'ratings' }),
          fetchProductsApi({ ...baseFilters, sortBy: 'newest' }),
        ]);
        // API returns: { data: { results: [...], totalDocs, totalPages, ... } } or { results: [...] }
        const unpack = (res: any) => {
          const d = res?.data ?? res;
          return Array.isArray(d) ? d : (Array.isArray(d?.results) ? d.results : (Array.isArray(d?.data) ? d.data : []));
        };
        setFeaturedProducts(unpack(featuredRes));
        setNewArrivals(unpack(newRes));
      } catch (e) {
        console.error('Failed to load products', e);
      } finally {
        setProductsLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Carousel slide timer
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroBanners]);

  const handlePrevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  const handleNextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
  const toggleFaq = (id: string) => setActiveFaq(activeFaq === id ? null : id);

  const handleAddToCart = (product: ProductItem) => {
    const activeVariant = product.variants?.find(v => v.isActive && (v.stock ?? 0) > 0) || product.variants?.[0];
    if (!activeVariant) { toast.error('Out of stock'); return; }
    dispatch(addToCart({ product: product as any, variant: activeVariant as any, quantity: 1 }));
    toast.success('Added to cart!', { description: product.name });
  };

  const handleWishlist = (productId: string) => {
    setWishlistIds(prev => { const n = new Set(prev); n.has(productId) ? n.delete(productId) : n.add(productId); return n; });
    toast.success('Wishlist updated!');
  };

  const getDisplayProducts = () => {
    if (activeTab === 'featured') return featuredProducts;
    if (activeTab === 'new') return newArrivals;
    if (activeTab === 'antitarnish') return [...featuredProducts, ...newArrivals].filter(p => p.tags?.includes('anti-tarnish') || p.brand === 'PRAO Paris');
    return featuredProducts;
  };

  const siteUrl = 'https://amin.com';
  const websiteSchema = { '@context': 'https://schema.org', '@type': 'WebSite', 'name': 'Amin Store', 'url': siteUrl };
  const orgSchema = { '@context': 'https://schema.org', '@type': 'OnlineStore', 'name': 'Amin Store', 'url': siteUrl };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      {/* ═══ SECTION 1: HERO ═══ */}
      <section className="relative overflow-hidden">
        {loading ? (
          <div className="h-[92vh] w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-amber-950 to-slate-950 animate-pulse">
            <div className="flex flex-col items-center gap-4">
              <Sparkles className="h-10 w-10 text-amber-500 animate-spin" />
              <span className="text-sm text-amber-300/60 tracking-widest uppercase">Loading Luxury Catalog...</span>
            </div>
          </div>
        ) : heroBanners.length > 0 ? (
          <div className="relative h-[92vh] w-full overflow-hidden group">
            {heroBanners.map((banner, index) => (
              <div
                key={banner._id}
                className={cn(
                  "absolute inset-0 w-full h-full transition-all duration-1200 ease-in-out flex items-center",
                  index === currentSlide ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 pointer-events-none scale-105"
                )}
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.5) 100%), url(${banner.desktopImage?.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'opacity 1.2s ease, transform 1.2s ease',
                }}
              >
                <Container>
                  <div className="max-w-3xl text-white space-y-6 select-none">
                    {banner.subtitle && (
                      <span className="inline-flex items-center gap-2 text-amber-400 font-bold uppercase tracking-widest text-xs sm:text-sm bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                        <Sparkles className="h-3 w-3" /> {banner.subtitle}
                      </span>
                    )}
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none font-serif">
                      {banner.title}
                    </h1>
                    {banner.linkUrl && (
                      <Link href={banner.linkUrl} className={cn(buttonVariants({ size: 'lg' }), "bg-gradient-to-r from-amber-500 to-rose-500 text-white border-0 hover:opacity-90 font-semibold rounded-full gap-2 mt-4 px-8 py-6 text-base shadow-xl shadow-amber-500/20")}>
                        Explore Now <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </Container>
              </div>
            ))}
            {heroBanners.length > 1 && (
              <>
                <button onClick={handlePrevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white z-20 transition-all opacity-0 group-hover:opacity-100 border border-white/10">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={handleNextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white z-20 transition-all opacity-0 group-hover:opacity-100 border border-white/10">
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
                  {heroBanners.map((_, index) => (
                    <button key={index} onClick={() => setCurrentSlide(index)} className={cn("h-1.5 rounded-full transition-all duration-500", index === currentSlide ? "w-10 bg-amber-500" : "w-2 bg-white/40")} />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* ── FALLBACK HERO: Full-screen cinematic ── */
          <div className="relative min-h-[92vh] flex items-center overflow-hidden bg-slate-950">
            {/* Background gradient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/8 rounded-full blur-[120px] animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-rose-500/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-900/5 rounded-full blur-[150px]" />
              {/* Floating particles */}
              {[...Array(20)].map((_, i) => (
                <div key={i} className="absolute w-1 h-1 bg-amber-400/30 rounded-full animate-bounce" style={{ left: `${5 + (i * 4.7) % 90}%`, top: `${10 + (i * 7.3) % 80}%`, animationDuration: `${2 + (i * 0.3) % 3}s`, animationDelay: `${(i * 0.2) % 2}s` }} />
              ))}
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
            </div>

            <Container className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
                {/* Left: Text content */}
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    ✨ PRAO Anti-Tarnish • BIS Certified • Luxury E-Commerce
                  </div>

                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none font-serif text-white">
                    Timeless<br />
                    <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">
                      Elegance,
                    </span><br />
                    Curated For You
                  </h1>

                  <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
                    Discover our exclusive selection of <strong className="text-amber-300">BIS hallmarked fine jewellery</strong>, PRAO anti-tarnish waterproof earrings, and premium dermatological cosmetics — handcrafted for your everyday dazzle.
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <Link href="/shop" className={cn(buttonVariants({ size: 'lg' }), "bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold hover:opacity-90 inline-flex items-center gap-2 rounded-full px-8 py-6 text-base shadow-xl shadow-amber-500/25 border-0")}>
                      Shop All Collections <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link href="/shop?type=jewellery" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), "rounded-full px-8 py-6 text-base border-white/20 text-white hover:bg-white/10 hover:border-white/40 bg-transparent")}>
                      Fine Jewellery
                    </Link>
                  </div>

                  {/* Quick stats */}
                  <div className="flex items-center gap-6 pt-2 border-t border-white/10">
                    {[['50K+', 'Happy Customers'], ['100%', 'Certified Gold'], ['14-Day', 'Easy Returns']].map(([val, label]) => (
                      <div key={label} className="text-center">
                        <span className="block text-lg font-black text-amber-400">{val}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Collection highlight cards */}
                <div className="hidden lg:grid grid-cols-1 gap-4">
                  {COLLECTION_HIGHLIGHTS.map((col, i) => (
                    <Link key={i} href={`/shop?search=${col.tag}`} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-r ${col.color} p-5 border border-white/10 hover:border-amber-500/40 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-amber-500/10 flex items-center gap-5`}>
                      <div className="flex-1 space-y-1">
                        <span className={`text-xs font-extrabold ${col.accent} uppercase tracking-widest`}>{col.title}</span>
                        <p className="font-bold text-white">{col.sub}</p>
                        <p className="text-xs text-slate-400">{col.desc}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-[10px] font-bold ${col.accent} bg-white/10 border border-white/10 px-2 py-0.5 rounded-full`}>{col.badge}</span>
                        <ArrowUpRight className="h-5 w-5 text-white/40 group-hover:text-amber-400 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Container>
          </div>
        )}
      </section>

      {/* ═══ SECTION 2: MARQUEE TRUST BAR ═══ */}
      <section className="bg-amber-500 py-3 overflow-hidden">
        <div className="flex items-center gap-0 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
          {[...MARQUEE_BRANDS, ...MARQUEE_BRANDS].map((brand, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-6 text-slate-950 font-bold text-xs uppercase tracking-widest">
              <Sparkles className="h-3 w-3 shrink-0" /> {brand}
            </span>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 3: TRUST STATS BAR ═══ */}
      <section className="bg-background border-b border-border py-10">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_STATS.map((stat, i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-muted/20 border border-border hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-2xl font-black text-foreground">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══ SECTION 4: FEATURED PRODUCTS ═══ */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/10">
        <Container className="space-y-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full inline-block">Our Collections</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-serif">
                Shop Our Best Sellers
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg">
                Handpicked jewellery and cosmetic favourites — from PRAO anti-tarnish earrings to BIS certified diamonds.
              </p>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors whitespace-nowrap group">
              View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Tab Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {([
              { id: 'featured', label: '⭐ Top Rated', desc: 'Best sellers' },
              { id: 'new', label: '🆕 New Arrivals', desc: 'Just dropped' },
              { id: 'antitarnish', label: '✨ Anti-Tarnish', desc: 'PRAO Collection' },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/20'
                    : 'bg-background border-border text-muted-foreground hover:border-amber-500/40 hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-border bg-background/50 animate-pulse">
                  <div className="aspect-square bg-muted/30" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 w-16 bg-muted/30 rounded" />
                    <div className="h-4 w-3/4 bg-muted/30 rounded" />
                    <div className="h-5 w-20 bg-muted/30 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : getDisplayProducts().length === 0 ? (
            <div className="text-center py-16 text-muted-foreground space-y-3">
              <ShoppingBag className="h-12 w-12 mx-auto opacity-30" />
              <p className="text-sm">No products in this collection yet.</p>
              <Link href="/shop" className="text-amber-500 text-sm font-bold hover:underline">Browse all products →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {getDisplayProducts().slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product as any} />
              ))}
            </div>
          )}


          <div className="flex justify-center pt-4">
            <Link href="/shop" className={cn(buttonVariants({ size: 'lg' }), "bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold hover:opacity-90 rounded-full px-10 py-6 text-base shadow-lg shadow-amber-500/20 border-0 gap-2")}>
              Explore Full Collection <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </Container>
      </section>

      {/* ═══ SECTION 5: PRAO ANTI-TARNISH SPOTLIGHT ═══ */}
      <section className="py-20 bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 blur-3xl rounded-full" />
        <Container className="relative z-10 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-6 text-white">
              <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                ✨ PRAO Anti-Tarnish Technology
              </span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight font-serif text-amber-100">
                Jewellery That<br />Never Fades
              </h2>
              <p className="text-slate-300 leading-relaxed">
                PRAO Paris uses advanced <strong className="text-amber-300">PVD (Physical Vapour Deposition) 18K gold and silver plating</strong> — the same technology used in Swiss watchmaking — to create jewellery that is 100% waterproof, sweat-proof, and tarnish-free for life.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '💧', title: 'Waterproof', desc: 'Shower, swim, and work out' },
                  { icon: '🌡️', title: 'Sweat-Proof', desc: 'Daily wear, every season' },
                  { icon: '✨', title: 'Never Tarnishes', desc: 'Lifetime brilliance guarantee' },
                  { icon: '🌿', title: 'Hypoallergenic', desc: 'Safe for sensitive skin' },
                ].map(feat => (
                  <div key={feat.title} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500/10 hover:border-amber-500/30 transition-colors">
                    <span className="text-2xl block mb-1">{feat.icon}</span>
                    <span className="font-bold text-white text-sm block">{feat.title}</span>
                    <span className="text-xs text-slate-400">{feat.desc}</span>
                  </div>
                ))}
              </div>
              <Link href="/shop?search=anti-tarnish" className={cn(buttonVariants({ size: 'lg' }), "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full px-8 py-6 border-0 gap-2 inline-flex shadow-xl shadow-amber-500/25")}>
                Shop PRAO Collection <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            {/* Right: Feature cards stack */}
            <div className="space-y-4">
              {[
                { label: 'Anti-Tarnish Heart Evil Eye Hoops', price: '₹1,299', badge: '✨ Anti-Tarnish', img: 'https://images.unsplash.com/photo-1635767798638-3665a0a107fc?w=100&h=100&fit=crop&crop=center' },
                { label: 'Crystal Leaf Ear Climbers', price: '₹1,499', badge: '💧 Waterproof', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&h=100&fit=crop&crop=center' },
                { label: 'Peacock Pearl Jhumkas', price: '₹1,899', badge: '🌸 Handcrafted', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=100&h=100&fit=crop&crop=center' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all group cursor-pointer">
                  <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 bg-muted/20">
                    <img src={item.img} alt={item.label} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{item.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-extrabold text-amber-400">{item.price}</span>
                      <span className="text-[10px] text-amber-300 bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded-full">{item.badge}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-amber-400 transition-colors shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ═══ SECTION 6: CATEGORIES SHOWCASE ═══ */}
      <section className="py-20 bg-background">
        <Container className="space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold text-amber-500 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full inline-block">Browse by Category</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-serif">
              Explore Our Collections
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              From anti-tarnish PRAO earrings to hallmarked gold rings, diamonds, and premium cosmetics.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-10 w-32 rounded-full bg-muted/20 animate-pulse" />
              ))
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/shop?category=${category.slug}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-muted/10 hover:border-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-all duration-200 group select-none font-semibold text-sm"
                >
                  {category.image?.url ? (
                    <img src={category.image.url} alt={category.name} className="h-5 w-5 rounded-full object-cover" />
                  ) : (
                    <Gem className="h-3.5 w-3.5 text-amber-500 group-hover:text-slate-950 transition-colors" />
                  )}
                  {category.name}
                </Link>
              ))
            ) : (
              ['Earrings', 'Rings', 'Necklaces', 'Bracelets', 'Anti-Tarnish', 'Diamonds', 'Gold', 'Cosmetics'].map(cat => (
                <Link key={cat} href={`/shop?search=${cat.toLowerCase()}`} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-muted/10 hover:border-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-all duration-200 font-semibold text-sm group">
                  <Gem className="h-3.5 w-3.5 text-amber-500 group-hover:text-slate-950 transition-colors" /> {cat}
                </Link>
              ))
            )}
          </div>
        </Container>
      </section>

      {/* ═══ SECTION 7: GUARANTEE GRID ═══ */}
      <section className="py-16 bg-muted/10 border-y border-border">
        <Container className="space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-serif">Crafted for Lifetime Brilliance</h2>
            <p className="text-sm text-muted-foreground">Every piece undergoes rigorous multi-layer quality testing.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, color: 'amber', title: '100% Anti-Tarnish', desc: 'PVD 18K gold plating ensures your jewellery never darkens, discolors, or loses its radiant shine.' },
              { icon: ShieldCheck, color: 'rose', title: 'Waterproof & Sweat-Proof', desc: 'Wear your favourite hoops, dangles, and studs while showering, swimming, or working out.' },
              { icon: Truck, color: 'amber', title: 'Insured Armored Express', desc: 'All fine gold & diamond orders shipped via insured express couriers in tamper-proof packaging.' },
              { icon: RefreshCw, color: 'rose', title: '14-Day Easy Exchange', desc: 'Not in love with your purchase? Exchange or return hassle-free within 14 days.' },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-background border border-border/60 hover:border-amber-500/50 hover:shadow-xl transition-all space-y-3 group">
                <div className={`h-12 w-12 rounded-xl ${item.color === 'amber' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══ SECTION 8: PROMOTIONAL BANNERS ═══ */}
      {promoBanners.length > 0 && (
        <section className="py-16 bg-background border-b border-border">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promoBanners.map((banner) => (
                <div key={banner._id} className="relative h-64 rounded-2xl overflow-hidden shadow-lg flex items-end group" style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 100%), url(${banner.desktopImage?.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="p-6 text-white space-y-2 z-10">
                    {banner.subtitle && <span className="text-amber-400 font-bold uppercase tracking-wider text-xs">{banner.subtitle}</span>}
                    <h3 className="text-xl font-bold">{banner.title}</h3>
                    {banner.linkUrl && (
                      <Link href={banner.linkUrl} className="inline-flex items-center gap-1 text-xs text-white/90 hover:text-amber-400 font-bold underline underline-offset-4">
                        Shop Now <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ═══ SECTION 9: TESTIMONIALS ═══ */}
      <section className="py-20 bg-background">
        <Container className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground font-serif">
              Loved by 50,000+ Dazzling Customers
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">Real stories and reviews from our community across India and abroad.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Ananya Sharma', city: 'Mumbai', review: 'The Anti-Tarnish Evil Eye Hoops are my absolute favourite! I wear them every day, even in the shower, and they still look as bright as day one.', rating: 5, product: 'PRAO Heart Evil Eye Hoops' },
              { name: 'Priya Mukherjee', city: 'Kolkata', review: "AMIN's diamond choker surpassed my expectations. The craftsmanship is divine and hallmark purity gives complete peace of mind.", rating: 5, product: 'Empress Diamond Choker' },
              { name: 'Riya Verma', city: 'Delhi', review: 'The Kashmiri Kundan Dangles look so regal! Packaging was premium and delivery took less than 48 hours.', rating: 5, product: 'Kashmiri Kundan Dangles' },
            ].map((t, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-muted/20 border border-border space-y-4 flex flex-col justify-between hover:border-amber-500/30 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-sm text-foreground/90 italic leading-relaxed">"{t.review}"</p>
                </div>
                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-foreground block">{t.name}</span>
                    <span className="text-muted-foreground">{t.city}</span>
                  </div>
                  <span className="text-[10px] text-amber-600 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">{t.product}</span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══ SECTION 10: FAQs ═══ */}
      <section className="py-20 bg-muted/10 border-t border-border">
        <Container className="max-w-3xl space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground font-serif flex items-center justify-center gap-2">
              <HelpCircle className="h-6 w-6 text-rose-500" /> Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground">Have questions? We're here to help.</p>
          </div>
          <div className="space-y-4">
            {(faqs.length > 0 ? faqs : DEFAULT_FAQS).map((faq) => {
              const isOpen = activeFaq === faq._id;
              return (
                <div key={faq._id} className="border border-border rounded-2xl bg-background shadow-sm overflow-hidden hover:border-amber-500/30 transition-colors">
                  <button onClick={() => toggleFaq(faq._id)} className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-sm md:text-base text-foreground hover:bg-muted/10 transition-colors">
                    <span>{faq.question}</span>
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-rose-500 text-white' : 'bg-amber-500/10 text-amber-500'}`}>
                      {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                  <div className={cn("transition-all duration-300 ease-in-out overflow-hidden", isOpen ? "max-h-60 border-t border-border" : "max-h-0")}>
                    <p className="px-6 py-4 text-xs md:text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ═══ SECTION 11: NEWSLETTER CTA ═══ */}
      <section className="py-20 bg-gradient-to-r from-amber-950 via-slate-900 to-rose-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(245,158,11,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(244,63,94,0.3) 0%, transparent 50%)' }} />
        <Container className="relative z-10 text-center space-y-6 max-w-2xl">
          <Gem className="h-10 w-10 text-amber-400 mx-auto" />
          <h2 className="text-3xl sm:text-4xl font-black text-amber-100 font-serif tracking-tight">
            Join the AMIN Circle
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Be the first to know about new PRAO anti-tarnish drops, hallmarked gold arrivals, exclusive offers, and VIP member-only collections.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-full text-sm transition-colors shrink-0">
              Join Now
            </button>
          </div>
          <p className="text-[11px] text-white/30">No spam. Unsubscribe anytime. Your data is safe with us.</p>
        </Container>
      </section>
    </div>
  );
}
