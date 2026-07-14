import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted/20 py-24 sm:py-32">
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
        {/* Subtle decorative elements */}
        <div className="absolute right-0 top-1/2 -z-10 h-96 w-96 -translate-y-1/2 rounded-full bg-gradient-to-tr from-amber-500/10 to-rose-500/10 blur-3xl" />
      </section>

      {/* Features Bar */}
      <section className="border-y border-border py-8 bg-background">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-full bg-primary/5 p-3 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">100% Certified Quality</h3>
              <p className="text-xs text-muted-foreground">Certified purity for all jewellery items.</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-full bg-primary/5 p-3 text-primary">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Insured Fast Delivery</h3>
              <p className="text-xs text-muted-foreground">Secure shipping directly to your doorstep.</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-full bg-primary/5 p-3 text-primary">
                <RefreshCw className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Easy Returns</h3>
              <p className="text-xs text-muted-foreground">Hassle-free replacement policy.</p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
