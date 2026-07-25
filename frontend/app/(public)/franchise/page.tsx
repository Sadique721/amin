'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, BarChart, GraduationCap, Map, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function FranchisePage() {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    investment: '',
    experience: '',
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
      toast.success('Your Franchise Application has been submitted! Our BD head will call you within 48 hours.');
      setFormData({ name: '', email: '', phone: '', location: '', investment: '', experience: '' });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-muted/10 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block">Partner With Us</span>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
            Grow Your Business with SANAB Franchise
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Expand the luxury jewellery and premium skin cosmetics line to your city. We offer structured setup guidance, marketing resources, and certified inventory supply.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <Card className="border-border bg-background/50">
            <CardContent className="p-6 space-y-3">
              <div className="text-amber-500 bg-amber-500/10 p-3 rounded-xl inline-block">
                <BarChart className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">High ROI Margin</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Enjoy lucrative retail markup margins on pure hallmark jewelry designs.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-background/50">
            <CardContent className="p-6 space-y-3">
              <div className="text-rose-500 bg-rose-500/10 p-3 rounded-xl inline-block">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Exclusive Designs</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Access custom limited jewelry drops and organic skin cosmetics before retail launch.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-background/50">
            <CardContent className="p-6 space-y-3">
              <div className="text-amber-500 bg-amber-500/10 p-3 rounded-xl inline-block">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Staff Training</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Complete modules for boutique design consultancies and store managers.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-background/50">
            <CardContent className="p-6 space-y-3">
              <div className="text-rose-500 bg-rose-500/10 p-3 rounded-xl inline-block">
                <Map className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Territory Security</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Guaranteed geo-location protection to avoid overlap with other retail outlets.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Application Card */}
        <Card className="border-border bg-background shadow-xl rounded-3xl max-w-3xl mx-auto">
          <CardContent className="p-8 space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground">Franchise Inquiry Form</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Please provide store location details for initial audit checks.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Your Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter name"
                    className="w-full bg-muted/20 border border-border focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                    className="w-full bg-muted/20 border border-border focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    className="w-full bg-muted/20 border border-border focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Proposed City/Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="E.g., Mumbai, Bandra"
                    className="w-full bg-muted/20 border border-border focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Investment Capability</label>
                  <input
                    type="text"
                    value={formData.investment}
                    onChange={(e) => setFormData((prev) => ({ ...prev, investment: e.target.value }))}
                    placeholder="E.g., 20 - 50 Lakhs"
                    className="w-full bg-muted/20 border border-border focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Prior Retail Experience (Years)</label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData((prev) => ({ ...prev, experience: e.target.value }))}
                    placeholder="E.g., 5 Years in Apparel / Luxury"
                    className="w-full bg-muted/20 border border-border focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-white font-bold py-6 rounded-2xl cursor-pointer shadow-lg shadow-amber-500/10 gap-2"
              >
                <Send className="h-4 w-4" /> {loading ? 'Submitting Application...' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
