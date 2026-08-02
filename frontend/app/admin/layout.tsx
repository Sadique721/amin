'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout } from '@/features/auth';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Server,
  Wrench,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  CreditCard,
  Receipt,
  Coins,
  Settings,
  ExternalLink,
  LogOut,
  FolderTree,
  ShoppingBag,
  Sliders,
  Menu,
  X,
  ShieldCheck,
  Store
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'API Providers', href: '/admin/api-providers', icon: Server },
  { label: 'Services', href: '/admin/services', icon: Wrench },
  { label: 'Inventory', href: '/admin/inventory', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Message', href: '/admin/messages', icon: MessageSquare },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Invoices', href: '/admin/invoices', icon: Receipt },
  { label: 'Currency', href: '/admin/currency', icon: Coins },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Products', href: '/admin/products', icon: ShoppingBag },
  { label: 'CMS', href: '/admin/cms', icon: Sliders },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Admin Auth Verification Guard
  React.useEffect(() => {
    if (!mounted) return;

    let currentToken = accessToken;
    let currentUser = user;
    if (typeof window !== 'undefined' && (!currentToken || !currentUser)) {
      try {
        const storedUser = localStorage.getItem('sanab_user');
        const storedToken = localStorage.getItem('sanab_accessToken');
        if (storedUser) currentUser = JSON.parse(storedUser);
        if (storedToken) currentToken = storedToken;
      } catch (e) {}
    }

    if (!currentToken || currentUser?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/auth/login?from=' + encodeURIComponent(pathname));
    }
  }, [mounted, accessToken, user, router, pathname]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully.');
    router.push('/auth/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  // Derive active header title
  const activeNavItem = navItems.find((item) => isActive(item.href));
  const pageTitle = activeNavItem ? activeNavItem.label : 'Dashboard';

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-[#181b1e] text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#00a65a] flex items-center justify-center text-white shadow-sm font-black text-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-wide text-white">Admin Panel</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 bg-[#181b1e] text-slate-300 h-screen flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out border-r border-slate-800/60 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
          
          {/* Logo Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#00a65a] flex items-center justify-center text-white shadow-md font-extrabold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white tracking-tight leading-tight">Admin Panel</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-md text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#00a65a] text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions Area */}
          <div className="p-3 border-t border-slate-800/80 space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>View Website</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-md text-sm font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </aside>

      {/* Main Content View Container */}
      <main className="flex-1 min-w-0 min-h-screen flex flex-col bg-[#f8fafc]">
        {/* Top Header bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-2xs sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">{pageTitle}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#00a65a] transition-colors bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
              <Store className="w-3.5 h-3.5" />
              <span>Visit Shop</span>
            </Link>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <div
                className="w-8 h-8 rounded-full bg-[#00a65a]/15 text-[#00a65a] flex items-center justify-center font-bold text-xs border border-[#00a65a]/30"
                suppressHydrationWarning
              >
                {mounted ? (user?.name?.[0]?.toUpperCase() || 'A') : 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight" suppressHydrationWarning>
                  {mounted ? (user?.name || 'Admin User') : 'Admin User'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium capitalize" suppressHydrationWarning>
                  {mounted ? (user?.role || 'administrator') : 'administrator'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-[1600px] w-full mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
