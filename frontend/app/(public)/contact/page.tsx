'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: '',
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
      toast.success('Your message has been sent successfully! Our concierge team will reach out shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-muted/10 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Contact Our Concierge</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Reach out for bespoke design consultations, order assistance, or wholesale inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Info Grid */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border-border bg-background/50">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-amber-500/10 p-3 rounded-xl text-amber-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Call Us</h4>
                  <p className="text-sm font-bold text-foreground mt-1">+91 98765 43210</p>
                  <p className="text-[10px] text-muted-foreground">Mon - Sat: 10:00 AM - 7:00 PM</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-background/50">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-rose-500/10 p-3 rounded-xl text-rose-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Email Support</h4>
                  <p className="text-sm font-bold text-foreground mt-1">concierge@sanab.com</p>
                  <p className="text-[10px] text-muted-foreground">Response within 24 Hours</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-background/50">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-amber-500/10 p-3 rounded-xl text-amber-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Flagship Store</h4>
                  <p className="text-sm font-bold text-foreground mt-1">Delhi Luxury Mall</p>
                  <p className="text-[10px] text-muted-foreground">Connaught Place, New Delhi, India</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Card */}
          <Card className="md:col-span-2 border-border bg-background shadow-lg rounded-3xl">
            <CardContent className="p-8">
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

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="E.g., Jewellery customization"
                    className="w-full bg-muted/20 border border-border focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Message *</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Type your message details here..."
                    className="w-full bg-muted/20 border border-border focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-white font-bold py-6 rounded-2xl cursor-pointer shadow-lg shadow-amber-500/10 gap-2"
                >
                  <Send className="h-4 w-4" /> {loading ? 'Sending Message...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
