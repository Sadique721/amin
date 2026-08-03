'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Send, Clock, Globe, ExternalLink, Share2, MessageCircle, Gem } from 'lucide-react';
import { toast } from 'sonner';

const CONTACT_METHODS = [
  {
    icon: Phone,
    color: 'amber',
    label: 'Call Concierge',
    value: '+91 98765 43210',
    sub: 'Mon – Sat · 10:00 AM – 7:00 PM IST',
  },
  {
    icon: Mail,
    color: 'rose',
    label: 'Email Support',
    value: 'support@sanab.com',
    sub: 'Response within 24 hours',
  },
  {
    icon: MessageCircle,
    color: 'amber',
    label: 'WhatsApp Chat',
    value: '+91 98765 43210',
    sub: 'Instant product & order queries',
  },
  {
    icon: MapPin,
    color: 'rose',
    label: 'Flagship Atelier',
    value: 'Delhi Luxury Mall',
    sub: 'Connaught Place, New Delhi',
  },
];

const INQUIRY_TYPES = [
  'Jewellery Customization',
  'PRAO Anti-Tarnish Collection',
  'Bridal & Wedding Sets',
  'Cosmetics & Skincare',
  'Order Tracking',
  'Bulk / Wholesale Inquiry',
  'Franchise Partnership',
  'Other',
];

export default function ContactPage() {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiry: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('✨ Your message has been sent! Our concierge will reach out within 24 hours.');
      setFormData({ name: '', email: '', subject: '', message: '', inquiry: '' });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-muted/10">

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 py-16 sm:py-20 px-4 sm:px-8 text-white">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(circle at 20% 80%, rgba(245,158,11,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(244,63,94,0.2) 0%, transparent 50%)` }} />
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Gem className="h-3.5 w-3.5" /> Luxury Concierge Service
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-serif text-amber-100">
            Contact Our Concierge
          </h1>
          <p className="text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Reach out for bespoke jewellery consultations, PRAO anti-tarnish collection queries, bridal design sessions, or order assistance. Our luxury concierge team is at your service.
          </p>
        </div>
      </div>

      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">

        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTACT_METHODS.map((m, i) => (
            <Card key={i} className={`border-border bg-background/60 hover:border-amber-500/40 hover:shadow-lg transition-all`}>
              <CardContent className="p-5 flex items-start gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${m.color === 'amber' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">{m.label}</h4>
                  <p className="text-sm font-bold text-foreground mt-1 break-words">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Form + Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Side Panel */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950 to-slate-900 border border-amber-500/30 text-white space-y-4">
              <h3 className="text-lg font-extrabold text-amber-200 font-serif">Quick Responses</h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Order Queries:</strong> Responded within 2 hours during business hours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Customization Requests:</strong> Our design team reaches out in 24 hours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Franchise Queries:</strong> BD team responds within 48 hours.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-background border border-border space-y-4">
              <h3 className="text-sm font-extrabold text-foreground">Follow SANAB</h3>
              <div className="flex gap-3">
                <a href="#" className="p-2.5 rounded-xl bg-muted/20 hover:bg-rose-500/10 hover:text-rose-500 transition-colors text-muted-foreground">
                  <Globe className="h-4 w-4" />
                </a>
                <a href="#" className="p-2.5 rounded-xl bg-muted/20 hover:bg-blue-500/10 hover:text-blue-500 transition-colors text-muted-foreground">
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a href="#" className="p-2.5 rounded-xl bg-muted/20 hover:bg-blue-600/10 hover:text-blue-600 transition-colors text-muted-foreground">
                  <Share2 className="h-4 w-4" />
                </a>
                <a href="#" className="p-2.5 rounded-xl bg-muted/20 hover:bg-green-500/10 hover:text-green-500 transition-colors text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Follow us for latest PRAO anti-tarnish drops, diamond collections, and cosmetics launches.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-background border border-border space-y-2">
              <h3 className="text-sm font-extrabold text-foreground">Store Hours</h3>
              {[
                { day: 'Monday – Saturday', hours: '10:00 AM – 7:00 PM' },
                { day: 'Sunday', hours: '11:00 AM – 5:00 PM' },
                { day: 'Public Holidays', hours: 'Closed' },
              ].map((s) => (
                <div key={s.day} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{s.day}</span>
                  <span className={`font-bold ${s.hours === 'Closed' ? 'text-rose-500' : 'text-foreground'}`}>{s.hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2 border-border bg-background shadow-xl rounded-3xl">
            <CardContent className="p-8 space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-extrabold text-foreground font-serif">Send Us a Message</h2>
                <p className="text-xs text-muted-foreground mt-1">Fill in the form and our luxury concierge will respond promptly.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Your Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Enter your name" className="w-full bg-muted/20 border border-border focus:border-amber-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Email Address *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="Enter email" className="w-full bg-muted/20 border border-border focus:border-amber-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Inquiry Type</label>
                  <select value={formData.inquiry} onChange={(e) => setFormData(p => ({ ...p, inquiry: e.target.value }))} className="w-full bg-muted/20 border border-border focus:border-amber-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors">
                    <option value="">Select inquiry type</option>
                    {INQUIRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Subject</label>
                  <input type="text" value={formData.subject} onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))} placeholder="E.g., Custom bridal earrings consultation" className="w-full bg-muted/20 border border-border focus:border-amber-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                    placeholder="Describe your query or requirement in detail. Include your preferred designs, budget, and occasion..."
                    rows={5}
                    className="w-full bg-muted/20 border border-border focus:border-amber-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors resize-none"
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-white font-bold py-6 rounded-2xl shadow-lg shadow-amber-500/20 gap-2 text-sm">
                  <Send className="h-4 w-4" />
                  {loading ? 'Sending Message...' : 'Send Message to Concierge'}
                </Button>

                <p className="text-[10px] text-muted-foreground text-center">
                  Your data is safe. We never share your contact details with third parties.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
