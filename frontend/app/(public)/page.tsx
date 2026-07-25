'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ShoppingBag
} from 'lucide-react';
import { fetchBannersApi, fetchFaqsApi, fetchCategoriesApi } from '@/features/cms/api/cms.api';

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

export default function HomePage() {
  const [heroBanners, setHeroBanners] = useState<BannerItem[]>([]);
  const [promoBanners, setPromoBanners] = useState<BannerItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initCms() {
      try {
        const [bannersRes, faqsRes, categoriesRes] = await Promise.all([
          fetchBannersApi(),
          fetchFaqsApi(),
          fetchCategoriesApi()
        ]);

        const banners = bannersRes.data || [];
        setHeroBanners(banners.filter((b: BannerItem) => b.type === 'hero'));
        setPromoBanners(banners.filter((b: BannerItem) => b.type !== 'hero'));
        setFaqs(faqsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error('Failed to load CMS content', err);
      } finally {
        setLoading(false);
      }
    }
    initCms();
  }, []);

  // Carousel slide timer
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroBanners]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
  };

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  // Structured Data (JSON-LD)
  const siteUrl = 'https://sanab.com';
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Sanab Store',
    'url': siteUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${siteUrl}/shop?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    'name': 'Sanab Store',
    'url': siteUrl,
    'logo': `${siteUrl}/logo.png`,
    'sameAs': [
      'https://www.facebook.com/sanab',
      'https://www.instagram.com/sanab'
    ]
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Structured SEO Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      {/* Hero / Banners Section */}
      <section className="relative overflow-hidden bg-muted/10 border-b border-border">
        {loading ? (
          <div className="h-[450px] w-full flex items-center justify-center bg-muted/20 animate-pulse">
            <div className="flex flex-col items-center space-y-4">
              <Sparkles className="h-8 w-8 text-amber-500 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading premium catalog...</span>
            </div>
          </div>
        ) : heroBanners.length > 0 ? (
          <div className="relative h-[450px] w-full overflow-hidden group">
            {heroBanners.map((banner, index) => {
              const bgImage = banner.desktopImage?.url;
              return (
                <div
                  key={banner._id}
                  className={cn(
                    "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out flex items-center",
                    index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  )}
                  style={{
                    backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 100%), url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <Container>
                    <div className="max-w-2xl text-white space-y-4 select-none">
                      {banner.subtitle && (
                        <p className="text-amber-400 font-bold uppercase tracking-wider text-xs md:text-sm">
                          {banner.subtitle}
                        </p>
                      )}
                      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                        {banner.title}
                      </h1>
                      {banner.linkUrl && (
                        <Link
                          href={banner.linkUrl}
                          className={cn(
                            buttonVariants({ variant: 'default', size: 'lg' }),
                            "bg-gradient-to-r from-amber-500 to-rose-500 text-white border-0 hover:opacity-90 font-semibold rounded-xl gap-2 mt-4 px-6"
                          )}
                        >
                          Explore Now <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </Container>
                </div>
              );
            })}
            
            {/* Arrows */}
            {heroBanners.length > 1 && (
              <>
                <button
                  onClick={handlePrevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/25 hover:bg-background/40 backdrop-blur-md flex items-center justify-center text-white z-20 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/25 hover:bg-background/40 backdrop-blur-md flex items-center justify-center text-white z-20 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                {/* Dots indicator */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                  {heroBanners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        index === currentSlide ? "w-6 bg-amber-500" : "w-2 bg-white/50"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Fallback Elegant Hero Header */
          <div className="relative overflow-hidden bg-muted/20 py-24 sm:py-32">
            <Container className="relative z-10">
              <div className="max-w-2xl lg:max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Luxury E-commerce Platform</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
                  Timeless Elegance, <br />
                  <span className="bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
                    Curated For You
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Discover our exclusive selection of artisanal jewellery and premium cosmetics. Handcrafted details and clinically-backed formulas, designed to match your elegance.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/shop"
                    className={cn(
                      buttonVariants({ variant: 'default', size: 'lg' }),
                      "bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium hover:opacity-90 inline-flex items-center gap-2"
                    )}
                  >
                    Shop Jewellery <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/shop?category=cosmetics"
                    className={buttonVariants({ variant: 'outline', size: 'lg' })}
                  >
                    Explore Cosmetics
                  </Link>
                </div>
              </div>
            </Container>
            <div className="absolute right-0 top-1/2 -z-10 h-96 w-96 -translate-y-1/2 rounded-full bg-gradient-to-tr from-amber-500/10 to-rose-500/10 blur-3xl" />
          </div>
        )}
      </section>

      {/* Features Bar */}
      <section className="border-b border-border py-8 bg-background">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-full bg-amber-500/5 p-3 text-amber-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-sm">100% Certified Quality</h3>
              <p className="text-xs text-muted-foreground">Certified purity for all jewellery items.</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-full bg-rose-500/5 p-3 text-rose-500">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-sm">Insured Fast Delivery</h3>
              <p className="text-xs text-muted-foreground">Secure shipping directly to your doorstep.</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-full bg-amber-500/5 p-3 text-amber-500">
                <RefreshCw className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-sm">Easy Returns</h3>
              <p className="text-xs text-muted-foreground">Hassle-free replacement policy.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Categories Grid Showcase */}
      <section className="py-12 bg-background">
        <Container className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Shop by Category
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Select a collection category to start exploring our handpicked premium selections.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-9 w-32 rounded-full bg-muted/20 animate-pulse" />
              ))
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/shop?category=${category.slug}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/10 hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-500 transition-all duration-200 group select-none"
                >
                  {category.image?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.image.url}
                      alt={category.name}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                  )}
                  <span className="text-xs font-semibold tracking-wide whitespace-nowrap">
                    {category.name}
                  </span>
                </Link>
              ))
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                No collections available.
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Promotional / Grid banner widget widgets */}
      {promoBanners.length > 0 && (
        <section className="py-12 bg-muted/10 border-y border-border">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {promoBanners.map((banner) => (
                <div
                  key={banner._id}
                  className="relative h-64 rounded-2xl overflow-hidden shadow-lg flex items-end group"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 100%), url(${banner.desktopImage?.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="p-6 text-white space-y-2 select-none z-10">
                    {banner.subtitle && (
                      <span className="text-amber-400 font-bold uppercase tracking-wider text-xs">
                        {banner.subtitle}
                      </span>
                    )}
                    <h3 className="text-xl font-bold">{banner.title}</h3>
                    {banner.linkUrl && (
                      <Link
                        href={banner.linkUrl}
                        className="inline-flex items-center gap-1 text-xs text-white/90 hover:text-white font-semibold underline underline-offset-4"
                      >
                        Shop Now <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Frequently Asked Questions */}
      <section className="py-16 bg-background">
        <Container className="max-w-3xl space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center justify-center gap-2">
              <HelpCircle className="h-6 w-6 text-rose-500" />
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground">
              Have questions? We're here to help. Explore our popular help topics below.
            </p>
          </div>

          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 w-full bg-muted/20 animate-pulse rounded-xl" />
              ))
            ) : faqs.length > 0 ? (
              faqs.map((faq) => {
                const isOpen = activeFaq === faq._id;
                return (
                  <div
                    key={faq._id}
                    className="border border-border rounded-xl bg-background shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(faq._id)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-sm md:text-base text-foreground hover:bg-muted/10 transition-colors"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <Minus className="h-4 w-4 text-rose-500 shrink-0" />
                      ) : (
                        <Plus className="h-4 w-4 text-amber-500 shrink-0" />
                      )}
                    </button>
                    <div
                      className={cn(
                        "transition-all duration-300 ease-in-out overflow-hidden",
                        isOpen ? "max-h-60 border-t border-border" : "max-h-0"
                      )}
                    >
                      <p className="px-6 py-4 text-xs md:text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                No FAQs available at this moment.
              </div>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
