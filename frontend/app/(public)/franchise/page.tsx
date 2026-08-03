'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, BarChart, GraduationCap, Map, Send, TrendingUp, ShieldCheck, Users, Star, CheckCircle, ArrowRight, Building2, Gem } from 'lucide-react';
import { toast } from 'sonner';

const PARTNER_STATS = [
  { value: '150+', label: 'Active Franchise Partners', icon: Users },
  { value: '₹8–25L', label: 'Average Monthly Revenue', icon: TrendingUp },
  { value: '32%', label: 'Avg. Gross Margin on Gold', icon: BarChart },
  { value: '48 Hrs', label: 'Business Development Response', icon: Star },
];

const BENEFITS = [
  {
    icon: BarChart,
    color: 'amber',
    title: 'High ROI Margin',
    desc: 'Enjoy lucrative retail markup margins of 25–40% on our certified hallmarked gold jewellery and PRAO anti-tarnish collections.',
  },
  {
    icon: Sparkles,
    color: 'rose',
    title: 'Exclusive Pre-Launch Access',
    desc: 'Get curated PRAO Anti-Tarnish drops, limited diamond sets, and seasonal cosmetics before they go live on retail.',
  },
  {
    icon: GraduationCap,
    color: 'amber',
    title: 'World-Class Staff Training',
    desc: 'End-to-end boutique setup, gemology basics, cosmetics consultation, and CRM management modules — certified.',
  },
  {
    icon: Map,
    color: 'rose',
    title: 'Geo-Protected Territory',
    desc: 'Your location gets a radius lock. No overlapping franchises, ensuring you dominate your luxury retail catchment.',
  },
  {
    icon: ShieldCheck,
    color: 'amber',
    title: 'Certified Inventory Supply',
    desc: 'All inventory comes direct from our certified atelier — BIS hallmarked gold, IGI diamonds, and lab-tested cosmetics.',
  },
  {
    icon: TrendingUp,
    color: 'rose',
    title: 'Dedicated Marketing Support',
    desc: 'National campaigns, hyperlocal social ads, influencer tie-ups, and festival season promotions — all managed by us.',
  },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Submit Application', desc: 'Fill out the franchise inquiry form with your location, investment plan, and retail background.' },
  { step: '02', title: 'BD Call & Audit', desc: 'Our Business Development head will contact you within 48 hours for a discovery call and site audit.' },
  { step: '03', title: 'Agreement & Onboarding', desc: 'Sign the franchise agreement, complete the brand onboarding certification course, and set up your boutique.' },
  { step: '04', title: 'Grand Opening', desc: 'We co-launch your boutique with marketing support, inventory supply, and a dedicated relationship manager.' },
];

const INVESTMENT_TIERS = [
  {
    tier: 'Express Kiosk',
    investment: '₹8–12 Lakhs',
    area: '100–200 sq ft',
    stock: 'PRAO Anti-Tarnish + Cosmetics',
    roi: '18–24 months',
    highlight: false,
  },
  {
    tier: 'Boutique Studio',
    investment: '₹15–25 Lakhs',
    area: '300–500 sq ft',
    stock: 'Full Gold, Diamond + PRAO',
    roi: '14–20 months',
    highlight: true,
  },
  {
    tier: 'Flagship Lounge',
    investment: '₹30–50 Lakhs',
    area: '700–1200 sq ft',
    stock: 'Complete Luxury Catalog',
    roi: '10–16 months',
    highlight: false,
  },
];

export default function FranchisePage() {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    investment: '',
    experience: '',
    tier: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.location) {
      toast.error('Please fill in all required contact details.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('🎉 Your Franchise Application is submitted! Our BD head will call you within 48 hours.');
      setFormData({ name: '', email: '', phone: '', location: '', investment: '', experience: '', tier: '' });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-muted/10">

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-950 via-slate-900 to-rose-950 py-20 px-4 sm:px-8 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="relative z-10 max-w-6xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Building2 className="h-3.5 w-3.5" /> Partner With SANAB
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-serif text-amber-100">
            Grow Your Business<br />with SANAB Franchise
          </h1>
          <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
            Expand the luxury jewellery and PRAO anti-tarnish cosmetics line to your city. We offer structured setup guidance, geo-protected territories, marketing resources, and certified BIS hallmarked inventory supply.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a href="#inquiry-form" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-colors">
              Apply Now <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#tiers" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition-colors">
              View Investment Plans
            </a>
          </div>
        </div>

        {/* Partner Stats Bar */}
        <div className="relative z-10 max-w-6xl mx-auto mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {PARTNER_STATS.map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">{stat.value}</span>
              <p className="text-[11px] text-slate-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="py-16 px-4 sm:px-6 lg:px-8 space-y-20 max-w-6xl mx-auto">

        {/* Benefits Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Why Partner With Us</span>
            <h2 className="text-3xl font-extrabold text-foreground font-serif">The SANAB Franchise Advantage</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <Card key={i} className="border-border bg-background/50 hover:border-amber-500/40 hover:shadow-lg transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className={`p-3 rounded-xl inline-block ${b.color === 'amber' ? 'text-amber-500 bg-amber-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                    <b.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{b.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 4-Step Process */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl font-extrabold text-foreground font-serif">Your Journey to Launching a SANAB Boutique</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step, i) => (
              <div key={i} className="p-6 rounded-2xl bg-background border border-border space-y-3 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                <span className="text-5xl font-black text-amber-500/10 absolute top-4 right-4 group-hover:text-amber-500/20 transition-colors select-none">{step.step}</span>
                <span className="text-xs font-extrabold text-amber-500 uppercase tracking-widest">Step {step.step}</span>
                <h3 className="font-bold text-sm text-foreground">{step.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Tiers */}
        <div id="tiers" className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Investment Models</span>
            <h2 className="text-3xl font-extrabold text-foreground font-serif">Choose Your Boutique Tier</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INVESTMENT_TIERS.map((tier, i) => (
              <div key={i} className={`rounded-2xl p-6 space-y-5 border-2 transition-all ${tier.highlight ? 'bg-gradient-to-b from-amber-950 via-slate-900 to-slate-900 border-amber-500 shadow-xl shadow-amber-500/10 text-white' : 'bg-background border-border'}`}>
                {tier.highlight && (
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">Most Popular</span>
                )}
                <div>
                  <h3 className={`text-lg font-extrabold font-serif ${tier.highlight ? 'text-amber-300' : 'text-foreground'}`}>{tier.tier}</h3>
                  <span className={`text-2xl font-black ${tier.highlight ? 'text-amber-400' : 'text-amber-500'}`}>{tier.investment}</span>
                </div>
                <ul className="space-y-2 text-xs">
                  {[
                    { label: 'Store Area', val: tier.area },
                    { label: 'Catalog', val: tier.stock },
                    { label: 'Est. ROI', val: tier.roi },
                  ].map((item) => (
                    <li key={item.label} className="flex items-center gap-2">
                      <CheckCircle className={`h-3.5 w-3.5 shrink-0 ${tier.highlight ? 'text-amber-400' : 'text-amber-500'}`} />
                      <span className={tier.highlight ? 'text-slate-300' : 'text-muted-foreground'}>
                        <strong className={tier.highlight ? 'text-white' : 'text-foreground'}>{item.label}:</strong> {item.val}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Inquiry Form */}
        <Card id="inquiry-form" className="border-border bg-background shadow-2xl rounded-3xl max-w-3xl mx-auto">
          <CardContent className="p-8 space-y-6">
            <div className="border-b border-border pb-4 space-y-1">
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-extrabold text-foreground font-serif">Franchise Inquiry Form</h2>
              </div>
              <p className="text-xs text-muted-foreground">Please provide your store details for an initial audit. Our BD head responds within 48 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Your Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Enter your full name" className="w-full bg-muted/20 border border-border focus:border-amber-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Email Address *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="Enter email" className="w-full bg-muted/20 border border-border focus:border-amber-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number *</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="E.g., +91 98765 43210" className="w-full bg-muted/20 border border-border focus:border-amber-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Proposed City / Location *</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="E.g., Mumbai, Bandra West" className="w-full bg-muted/20 border border-border focus:border-amber-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Preferred Tier</label>
                  <select value={formData.tier} onChange={(e) => setFormData(p => ({ ...p, tier: e.target.value }))} className="w-full bg-muted/20 border border-border focus:border-amber-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors">
                    <option value="">Select a tier</option>
                    <option value="kiosk">Express Kiosk (₹8–12L)</option>
                    <option value="boutique">Boutique Studio (₹15–25L)</option>
                    <option value="flagship">Flagship Lounge (₹30–50L)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Investment Budget</label>
                  <input type="text" value={formData.investment} onChange={(e) => setFormData(p => ({ ...p, investment: e.target.value }))} placeholder="E.g., ₹20–30 Lakhs" className="w-full bg-muted/20 border border-border focus:border-amber-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Prior Retail Experience</label>
                <input type="text" value={formData.experience} onChange={(e) => setFormData(p => ({ ...p, experience: e.target.value }))} placeholder="E.g., 5 years in apparel / luxury retail" className="w-full bg-muted/20 border border-border focus:border-amber-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors" />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-white font-bold py-6 rounded-2xl shadow-lg shadow-amber-500/20 gap-2 text-sm">
                <Send className="h-4 w-4" />
                {loading ? 'Submitting Application...' : 'Submit Franchise Application'}
              </Button>

              <p className="text-[10px] text-muted-foreground text-center">
                By submitting, you agree to our <span className="text-amber-500 underline cursor-pointer">Franchise Terms</span>. No commitment required at this stage.
              </p>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
