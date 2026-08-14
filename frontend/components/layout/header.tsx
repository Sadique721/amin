'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingBag, Heart, Search, User, Sun, Moon, Menu, X,
  Gem, Phone, Truck, ShieldCheck, Home, ChevronRight, LogOut,
  LayoutDashboard, Package, Sparkles
} from 'lucide-react';
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

const NAV_LINKS = [
  { href: '/shop',                     label: 'Jewellery',  icon: Gem },
  { href: '/shop?category=cosmetics',  label: 'Cosmetics',  icon: Sparkles },
  { href: '/franchise',                label: 'Franchise',  icon: Package },
  { href: '/about',                    label: 'About',      icon: Home },
  { href: '/contact',                  label: 'Contact',    icon: Phone },
];

export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [scrolled, setScrolled] = React.useState(false);
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  
  const { user } = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
    setMobileOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b border-border transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-xl shadow-lg'
            : 'bg-background/85 backdrop-blur-md'
        }`}
      >
        {/* Top announcement bar */}
        <div className="hidden sm:flex items-center justify-center gap-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white text-[11px] font-semibold py-1.5 px-4">
          <span className="flex items-center gap-1.5"><Truck className="w-3 h-3" /> Free delivery on orders above ₹999</span>
          <span className="w-px h-3 bg-white/30" />
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> BIS Hallmarked Gold &bull; IGI Certified Diamonds</span>
          <span className="w-px h-3 bg-white/30" />
          <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> 3 Payment Methods Available</span>
        </div>

        <Container>
          <div className="flex h-14 sm:h-16 items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                  <Gem className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
                  AMIN
                </span>
              </Link>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href.split('?')[0]))
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'text-foreground/80 hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Action Bar */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <div className="relative flex items-center">
                {showSearch && (
                  <form
                    onSubmit={handleSearchSubmit}
                    className="absolute right-10 top-1/2 -translate-y-1/2 bg-background border border-border rounded-full px-3 py-1.5 shadow-xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-right-4 duration-200"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search jewellery, cosmetics..."
                      className="bg-transparent text-xs focus:outline-none w-44 sm:w-56 text-foreground placeholder:text-muted-foreground"
                      autoFocus
                    />
                    <button type="submit" className="text-amber-500">
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearch(!showSearch)}
                  className="text-muted-foreground hover:text-primary h-9 w-9"
                >
                  {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              {/* Theme Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="hidden sm:flex text-muted-foreground hover:text-primary h-9 w-9"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              )}

              {/* Wishlist */}
              <Link href="/wishlist" className="hidden sm:block">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary cursor-pointer h-9 w-9">
                  <Heart className="h-4 w-4" />
                </Button>
              </Link>

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary cursor-pointer h-9 w-9">
                  <ShoppingBag className="h-4 w-4" />
                  {mounted && cartCount > 0 && (
                    <span
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white shadow-sm"
                      suppressHydrationWarning
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Dropdown - Desktop */}
              <div className="hidden sm:block">
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-9 w-9">
                      {mounted && user ? (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-[11px]">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </Button>
                  } />
                  <DropdownMenuContent align="end" className="w-52">
                    {mounted && user ? (
                      <>
                        <DropdownMenuItem disabled className="font-semibold text-xs text-muted-foreground border-b border-border pb-2 flex items-center justify-between">
                          <span>Hi, {user.name?.split(' ')[0]}</span>
                          {user.role === 'admin' && (
                            <span className="bg-amber-500/20 text-amber-600 text-[10px] font-black px-1.5 py-0.5 rounded uppercase">Admin</span>
                          )}
                        </DropdownMenuItem>
                        {user.role === 'admin' && (
                          <DropdownMenuItem render={<Link href="/admin" className="font-bold text-amber-600 flex items-center gap-2 cursor-pointer hover:bg-amber-500/10" />}>
                            <LayoutDashboard className="w-3.5 h-3.5" /> Admin Console
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem render={<Link href="/account/profile" />}>
                          My Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem render={<Link href="/account/orders" />}>
                          My Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => dispatch(logout())} className="text-rose-500 cursor-pointer">
                          <LogOut className="w-3.5 h-3.5 mr-1.5" /> Logout
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
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-muted-foreground hover:text-primary h-9 w-9"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-[80vw] max-w-sm bg-background border-l border-border z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-amber-500/10 to-rose-500/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Gem className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">AMIN</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* User Card */}
        {mounted && (
          <div className="p-4 border-b border-border">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-base shrink-0 shadow-sm">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                {user.role === 'admin' && (
                  <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 uppercase">Admin</span>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl bg-amber-500 text-white text-sm font-bold"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl border border-amber-500 text-amber-600 text-sm font-bold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-3 mb-2">Shop</p>
          {NAV_LINKS.map(link => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href.split('?')[0]))
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'text-foreground/80 hover:bg-muted/50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 text-amber-500" />
                <span>{link.label}</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground/40" />
              </Link>
            );
          })}

          {mounted && user && (
            <>
              <div className="pt-3 pb-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-3">Account</p>
              </div>

              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-amber-600 bg-amber-500/10"
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Admin Console</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                </Link>
              )}

              <Link
                href="/account/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-foreground/80 hover:bg-muted/50"
              >
                <User className="w-4 h-4 shrink-0 text-amber-500" />
                <span>My Profile</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground/40" />
              </Link>

              <Link
                href="/account/orders"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-foreground/80 hover:bg-muted/50"
              >
                <ShoppingBag className="w-4 h-4 shrink-0 text-amber-500" />
                <span>My Orders</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground/40" />
              </Link>

              <Link
                href="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-foreground/80 hover:bg-muted/50"
              >
                <Heart className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Wishlist</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground/40" />
              </Link>
            </>
          )}
        </nav>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border space-y-2">
          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground/80 hover:bg-muted/50 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-amber-500" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          )}

          {/* Logout */}
          {mounted && user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
