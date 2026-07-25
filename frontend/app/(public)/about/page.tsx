import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ShieldCheck, Heart, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-muted/10 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block">Est. 2024</span>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
            timeless elegance, <span className="bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">defined by sanab</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Crafting luxury jewellery and advanced cosmetic formulations with unmatched detail, ethical sourcing, and uncompromising purity.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Our Heritage & Vision</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              At SANAB, we believe that luxury is not just an item, but an experience. Founded with a vision to blend the classic brilliance of fine metals with the organic beauty of premium cosmetics, we bring you curated collections that celebrate your individuality.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every diamond is ethically sourced, and every cosmetic blend is formulated by dermatological experts using rich, certified natural ingredients to restore and protect.
            </p>
          </div>
          <div className="bg-gradient-to-tr from-amber-500/10 to-rose-500/10 p-8 rounded-3xl border border-amber-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/20 blur-3xl rounded-full" />
            <h3 className="text-xl font-bold text-foreground mb-4">Our Core Commitments</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-500 mt-0.5" />
                <span className="text-xs text-muted-foreground font-semibold">100% Certified Quality (BIS Hallmarked Gold & Lab-tested beauty lines)</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-amber-500 mt-0.5" />
                <span className="text-xs text-muted-foreground font-semibold">Bespoke Customization Options for Bridal Jewellery</span>
              </li>
              <li className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-amber-500 mt-0.5" />
                <span className="text-xs text-muted-foreground font-semibold">Cruelty-Free, Paraben-Free Clean Cosmetic formulations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Values Grid */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Why SANAB</h2>
            <p className="text-xs text-muted-foreground mt-1">Built on trust, verified by science, designed by artisans.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="border-border bg-background/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center space-y-4">
                <div className="bg-amber-500/10 p-4 rounded-full inline-block text-amber-600">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base">Unmatched Artistry</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our master craftsmen spend hours hand-carving designs, ensuring that every curve and setting is flawless.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-background/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center space-y-4">
                <div className="bg-rose-500/10 p-4 rounded-full inline-block text-rose-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base">Secure Insured Delivery</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We use armored logistics to deliver high-value gold collections directly to your doorstep with full insurance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-background/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center space-y-4">
                <div className="bg-amber-500/10 p-4 rounded-full inline-block text-amber-600">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base">Advanced Skin Health</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our cosmetics use dermatologically active botanicals, designed to enhance brightness and prevent aging.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
