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
  Store,
  ChevronRight,
  Zap
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  group?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',    href: '/admin',               icon: LayoutDashboard, group: 'Core' },
  { label: 'Orders',       href: '/admin/orders',         icon: ShoppingCart,    group: 'Commerce' },
  { label: 'Products',     href: '/admin/products',       icon: ShoppingBag,     group: 'Commerce' },
  { label: 'Inventory',    href: '/admin/inventory',      icon: Package,         group: 'Commerce' },
  { label: 'Categories',   href: '/admin/categories',     icon: FolderTree,      group: 'Commerce' },
  { label: 'Payments',     href: '/admin/payments',       icon: CreditCard,      group: 'Finance' },
  { label: 'Invoices',     href: '/admin/invoices',       icon: Receipt,         group: 'Finance' },
  { label: 'Currency',     href: '/admin/currency',       icon: Coins,           group: 'Finance' },
  { label: 'Users',        href: '/admin/users',          icon: Users,           group: 'People' },
  { label: 'Messages',     href: '/admin/messages',       icon: MessageSquare,   group: 'People' },
  { label: 'API Providers',href: '/admin/api-providers',  icon: Server,          group: 'System' },
  { label: 'Services',     href: '/admin/services',       icon: Wrench,          group: 'System' },
  { label: 'CMS',          href: '/admin/cms',            icon: Sliders,         group: 'System' },
  { label: 'Settings',     href: '/admin/settings',       icon: Settings,        group: 'System' },
];

const groups = ['Core', 'Commerce', 'Finance', 'People', 'System'];

const groupColors: Record<string, string> = {
  Core:     '#00a65a',
  Commerce: '#3b82f6',
  Finance:  '#8b5cf6',
  People:   '#ec4899',
  System:   '#94a3b8',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [time, setTime] = React.useState('');

  React.useEffect(() => {
    setMounted(true);
    const update = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  // Admin Auth Verification Guard
  React.useEffect(() => {
    if (!mounted) return;

    let currentToken = accessToken;
    let currentUser = user;
    if (typeof window !== 'undefined' && (!currentToken || !currentUser)) {
      try {
        const storedUser = localStorage.getItem('amin_user');
        const storedToken = localStorage.getItem('amin_accessToken');
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

  const activeNavItem = navItems.find((item) => isActive(item.href));
  const pageTitle = activeNavItem ? activeNavItem.label : 'Dashboard';

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-800 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-gradient-to-r from-[#0d1117] to-[#1a2332] text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00a65a] to-emerald-600 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-black text-sm text-white tracking-wide">AMIN Admin</span>
            <span className="block text-[10px] text-slate-400 font-medium">Control Panel</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 bg-gradient-to-b from-[#0d1117] via-[#111827] to-[#0d1117] text-slate-300 h-screen flex flex-col shrink-0 transition-transform duration-300 ease-in-out border-r border-white/5 shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          
          {/* Logo Header */}
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00a65a] to-emerald-600 flex items-center justify-center shadow-lg shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-black text-base text-white tracking-tight block leading-tight">AMIN</span>
                <span className="text-[11px] text-slate-400 font-semibold">Admin Control Panel</span>
              </div>
            </div>

            {/* Live status */}
            <div className="mt-4 flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a65a] animate-ping" />
                <span className="text-[11px] text-[#00a65a] font-bold">System Live</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono" suppressHydrationWarning>{time}</span>
            </div>
          </div>

          {/* Navigation Items - grouped */}
          <nav className="p-3 flex-1 space-y-4">
            {groups.map(group => {
              const groupItems = navItems.filter(item => item.group === group);
              const color = groupColors[group];
              return (
                <div key={group}>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] px-3 mb-1" style={{ color }}>
                    {group}
                  </p>
                  <div className="space-y-0.5">
                    {groupItems.map(item => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all group relative ${
                            active
                              ? 'bg-gradient-to-r from-[#00a65a]/20 to-[#00a65a]/5 text-[#00a65a] border border-[#00a65a]/20'
                              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                          }`}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4/5 rounded-r-full bg-[#00a65a]" />
                          )}
                          <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#00a65a]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          <span>{item.label}</span>
                          {active && <ChevronRight className="w-3 h-3 ml-auto text-[#00a65a]/60" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Admin User Profile */}
          <div className="p-3 border-t border-white/5">
            {mounted && (
              <div className="bg-white/5 rounded-xl p-3 mb-2 border border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00a65a] to-emerald-700 flex items-center justify-center text-white font-black text-xs shrink-0">
                    {user?.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin User'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@amin.com'}</p>
                  </div>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#00a65a]/20 text-[#00a65a] uppercase">
                    {user?.role || 'admin'}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-0.5">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all"
              >
                <ExternalLink className="w-4 h-4 text-slate-500" />
                <span>Visit Shop</span>
                <Store className="w-3 h-3 ml-auto text-slate-600" />
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* Main Content View Container */}
      <main className="flex-1 min-w-0 min-h-screen flex flex-col">
        {/* Top Header bar */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-5 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Admin</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="font-bold text-slate-700">{pageTitle}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Quick action */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-[#00a65a] bg-[#00a65a]/10 px-2.5 py-1.5 rounded-lg border border-[#00a65a]/20">
              <Zap className="w-3 h-3" />
              <span>99.9% Uptime</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#00a65a] transition-colors bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
            >
              <Store className="w-3.5 h-3.5" />
              <span>View Shop</span>
            </Link>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00a65a] to-emerald-700 text-white flex items-center justify-center font-black text-xs shadow-sm"
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
