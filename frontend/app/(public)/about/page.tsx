import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ShieldCheck, Heart, Award, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-muted/10 py-16 px-4 sm:px-6 lg:px-8 space-y-20">
      <div className="mx-auto max-w-6xl space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Est. 2024 • AMIN & PRAO Atelier
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight font-serif">
            Timeless Elegance, <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">Defined by AMIN</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Crafting fine hallmarked gold, ethically-sourced diamonds, and PRAO anti-tarnish waterproof jewellery alongside clinically-proven botanical cosmetic formulations.
          </p>
        </div>

        {/* Brand Heritage & Certifications Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight font-serif">Our Heritage & Vision</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              At AMIN, luxury is an experience of trust, craftsmanship, and individuality. Founded with a vision to marry classic fine metal art with modern anti-tarnish innovations and organic clean cosmetics, we deliver pieces that empower your everyday dazzle.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every diamond is conflict-free and certified by IGI/GIA, every gold piece is 100% BIS 916 hallmarked, and our PRAO fashion collection guarantees 100% waterproof anti-tarnish durability.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-background border border-border flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-amber-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-foreground block">BIS Hallmarked</span>
                  <span className="text-[10px] text-muted-foreground">Certified 18K & 22K Gold</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-background border border-border flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-amber-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-foreground block">100% Anti-Tarnish</span>
                  <span className="text-[10px] text-muted-foreground">Waterproof PVD Gold</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-amber-950 via-slate-900 to-rose-950 p-8 rounded-3xl border border-amber-500/30 text-white shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/20 blur-3xl rounded-full" />
            <h3 className="text-xl font-extrabold text-amber-100 font-serif">Our Core Pledges</h3>
            <ul className="space-y-4 text-xs sm:text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>BIS 916 Hallmarked Gold & Lab-Certified Diamonds:</strong> Uncompromising purity verified by independent gemological institutes.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>PRAO Anti-Tarnish Tech:</strong> Advanced PVD coating resistant to water, sweat, perfume, and daily wear.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Clean Beauty Formulations:</strong> 100% cruelty-free, dermatologically tested, paraben-free cosmetic formulations.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Interactive Craftsmanship Timeline */}
        <div className="space-y-8 pt-6 border-t border-border">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Journey of Excellence</span>
            <h2 className="text-3xl font-extrabold text-foreground font-serif">The AMIN Heritage Timeline</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { year: '2024', title: 'Atelier Founded', desc: 'Launched AMIN in Delhi Luxury District with 100% hallmarked gold & diamond collections.' },
              { year: '2025', title: 'Dermal Cosmetics Line', desc: 'Introduced botanical clean cosmetics & velvet lip formulations certified cruelty-free.' },
              { year: '2025', title: 'PRAO Anti-Tarnish Launch', desc: 'Partnered with European artisans to introduce 100% waterproof anti-tarnish fashion earrings.' },
              { year: '2026', title: 'Global Franchise Network', desc: 'Expanded boutique stores and flagship concierges across tier-1 luxury hubs.' },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-background border border-border space-y-3 relative hover:border-amber-500/50 transition-colors">
                <span className="text-2xl font-black text-amber-500 font-serif block">{item.year}</span>
                <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Grid */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Why AMIN & PRAO</h2>
            <p className="text-xs text-muted-foreground mt-1">Built on trust, verified by science, designed by artisans.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="border-border bg-background/50 backdrop-blur-sm hover:border-amber-500/40 transition-colors">
              <CardContent className="p-6 text-center space-y-4">
                <div className="bg-amber-500/10 p-4 rounded-full inline-block text-amber-600">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base">Master Craftsmanship</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our master goldsmiths spend hundreds of hours hand-carving filigree, setting solitaires, and polishing every edge.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-background/50 backdrop-blur-sm hover:border-amber-500/40 transition-colors">
              <CardContent className="p-6 text-center space-y-4">
                <div className="bg-rose-500/10 p-4 rounded-full inline-block text-rose-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base">Armored Insured Shipping</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every order is dispatched in tamper-proof sealed packaging with full transit insurance directly to your doorstep.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-background/50 backdrop-blur-sm hover:border-amber-500/40 transition-colors">
              <CardContent className="p-6 text-center space-y-4">
                <div className="bg-amber-500/10 p-4 rounded-full inline-block text-amber-600">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base">Dermatological Purity</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our cosmetics use dermatologically active botanicals, designed to enhance natural radiance without synthetics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
