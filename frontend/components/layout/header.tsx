'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Heart, Search, User, Sun, Moon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout } from '@/features/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { user } = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const [showSearch, setShowSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
                SANAB
              </span>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/shop" className="text-sm font-medium transition-colors hover:text-primary">
              Jewellery
            </Link>
            <Link href="/shop?category=cosmetics" className="text-sm font-medium transition-colors hover:text-primary">
              Cosmetics
            </Link>
            <Link href="/franchise" className="text-sm font-medium transition-colors hover:text-primary">
              Franchise
            </Link>
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
              Contact
            </Link>
          </nav>

          {/* Action Bar */}
          <div className="flex items-center space-x-2">
            {/* Search Bar / Input Toggle */}
            <div className="relative flex items-center">
              {showSearch && (
                <form
                  onSubmit={handleSearchSubmit}
                  className="absolute right-10 top-1/2 -translate-y-1/2 bg-background border border-border rounded-full px-3 py-1.5 shadow-lg flex items-center gap-2 z-50 animate-in fade-in slide-in-from-right-4 duration-200"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="bg-transparent text-xs focus:outline-none w-36 sm:w-48 text-foreground"
                    autoFocus
                  />
                </form>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
                className="text-muted-foreground hover:text-primary"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-muted-foreground hover:text-primary"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}

            {/* Wishlist */}
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary cursor-pointer">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary cursor-pointer">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <User className="h-5 w-5" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-48">
                {user ? (
                  <>
                    <DropdownMenuItem disabled className="font-semibold text-xs text-muted-foreground border-b border-border pb-1">
                      Hi, {user.name}
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/account/profile" />}>
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/account/orders" />}>
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => dispatch(logout())} className="text-rose-500 cursor-pointer">
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem render={<Link href="/auth/login" />}>
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/auth/register" />}>
                      Register
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Trigger */}
            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-primary">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
};
