'use client';

import * as React from 'react';
import Link from 'next/link';
import { Container } from '@/components/common/container';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border bg-muted/30 pt-16 pb-8 text-sm">
      <Container>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
              SANAB
            </span>
            <p className="text-muted-foreground leading-relaxed">
              Premium Jewellery & Luxury Cosmetics curated with pure elegance. Indulge in state-of-the-art formulations and craftsmanship.
            </p>
            <div className="flex space-x-4">
              <Link href="https://facebook.com" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="https://instagram.com" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.752.054 2.14.097 3.266 1.203 3.632 3.632.043.967.052 1.32.052 3.752 0 2.43-.01 2.784-.052 3.752-.365 2.428-1.493 3.532-3.631 3.632-.969.043-1.32.052-3.753.052-2.43 0-2.784-.01-3.752-.052-2.137-.097-3.264-1.203-3.632-3.632C2.01 14.81 2 14.457 2 12.022c0-2.43.01-2.784.052-3.752.366-2.429 1.493-3.531 3.631-3.632.969-.043 1.32-.052 3.752-.052m.315-2c-2.472 0-2.782.01-3.752.054-2.834.13-4.428 1.724-4.558 4.557-.044.97-.054 1.28-.054 3.752 0 2.472.01 2.782.054 3.752.13 2.833 1.724 4.427 4.557 4.557.97.044 1.28.054 3.752.054 2.472 0 2.782-.01 3.752-.054 2.834-.13 4.428-1.724 4.558-4.557.044-.97.054-1.28.054-3.752 0-2.472-.01-2.782-.054-3.752-.13-2.833-1.724-4.427-4.557-4.557-.97-.044-1.28-.054-3.752-.054zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="https://twitter.com" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Explore</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/shop" className="hover:text-primary transition-colors">Jewellery Collections</Link>
              </li>
              <li>
                <Link href="/shop?category=cosmetics" className="hover:text-primary transition-colors">Luxury Cosmetics</Link>
              </li>
              <li>
                <Link href="/franchise" className="hover:text-primary transition-colors">Franchise Program</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">Our Story</Link>
              </li>
            </ul>
          </div>

          {/* Help & Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact Us</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>123 Luxury Road, Suite 45, New Delhi, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>support@sanab.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Newsletter</h4>
            <p className="text-muted-foreground">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Enter email address"
                required
                className="max-w-[240px] focus-visible:ring-primary"
              />
              <Button type="submit">Join</Button>
            </form>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="mt-16 border-t border-border pt-8 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} SANAB Platform. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
};
