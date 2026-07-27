'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { logout } from '@/features/auth';
import { fetchSalesStatsApi } from '@/features/checkout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Activity,
  Users,
  ShoppingCart,
  LogOut,
  Sliders,
  Store,
  ChevronRight,
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [useDemoData, setUseDemoData] = React.useState(true);

  // Demo fallback data if live store has no orders yet
  const demoStats = {
    totalRevenue: 642800,
    totalOrders: 18,
    avgOrderValue: 35711,
    statusBreakdown: [
      { _id: 'delivered', count: 9 },
      { _id: 'processing', count: 5 },
      { _id: 'pending', count: 3 },
      { _id: 'cancelled', count: 1 },
    ],
    paymentBreakdown: [
      { _id: 'upi', revenue: 385000 },
      { _id: 'card', revenue: 198000 },
      { _id: 'netbanking', revenue: 45000 },
      { _id: 'cod', revenue: 14800 },
    ],
  };

  React.useEffect(() => {
    if (!accessToken || user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/auth/login?redirect=/admin');
      return;
    }

    async function loadStats() {
      try {
        setLoading(true);
        const res = await fetchSalesStatsApi();
        setStats(res.data);
        // If live database has some orders, automatically default to live data
        if (res.data && res.data.totalOrders > 0) {
          setUseDemoData(false);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load sales stats.');
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [accessToken, user, router]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully from Admin Console.');
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/10 flex items-center justify-center p-6">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const activeStats = useDemoData ? demoStats : (stats || demoStats);

  // Calculations for Donut Chart
  const statusColors: Record<string, string> = {
    delivered: '#10b981', // Emerald
    processing: '#f59e0b', // Amber
    pending: '#3b82f6', // Blue
    cancelled: '#ef4444', // Red
  };

  const totalOrdersCount = activeStats.statusBreakdown.reduce((sum: number, item: any) => sum + item.count, 0) || 1;
  let accumulatedPercent = 0;
  const donutSlices = activeStats.statusBreakdown.map((item: any) => {
    const percent = item.count / totalOrdersCount;
    const strokeDasharray = `${percent * 100} ${100 - (percent * 100)}`;
    const strokeDashoffset = 100 - accumulatedPercent + 25; // 25 is to rotate start point to top
    accumulatedPercent += percent * 100;
    return {
      label: item._id,
      count: item.count,
      percentage: Math.round(percent * 100),
      color: statusColors[item._id] || '#6b7280',
      strokeDasharray,
      strokeDashoffset,
    };
  });

  // Calculations for Payment Channel Bar Chart
  const maxPaymentRevenue = Math.max(...activeStats.paymentBreakdown.map((item: any) => item.revenue)) || 1;

  return (
    <div className="min-h-screen bg-muted/10">
      
      {/* Top Header Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border select-none">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2 text-lg font-black text-foreground hover:text-amber-500 transition-colors">
                <Sparkles className="h-5 w-5 text-amber-500" /> SANAB Admin
              </Link>
              <div className="hidden md:flex items-center gap-1.5 text-sm font-semibold">
                <Link href="/admin" className={`px-3 py-1.5 rounded-lg transition-colors ${pathname === '/admin' ? 'bg-amber-500/10 text-amber-600' : 'text-muted-foreground hover:text-foreground'}`}>
                  Dashboard
                </Link>
                <Link href="/admin/products" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                  Products
                </Link>
                <Link href="/admin/orders" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                  Orders
                </Link>
                <Link href="/admin/users" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                  Users
                </Link>
                <Link href="/admin/cms" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                  CMS
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-foreground">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{user?.role || 'admin'}</p>
              </div>
              
              <Link href="/" target="_blank">
                <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl text-muted-foreground hover:text-foreground">
                  <Store className="h-4 w-4 mr-1.5" /> Visit Shop
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="h-9 border-border hover:bg-rose-50/10 text-rose-600 hover:text-rose-700 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Console Content */}
      <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Dashboard Title Panel */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
              Dashboard Analytics <Activity className="h-6 w-6 text-amber-500" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Live statistics, transaction distributions, and administrative controls.
            </p>
          </div>
          
          {/* Live vs Demo Data Toggle */}
          <div className="flex items-center gap-2.5 bg-background border border-border p-1.5 rounded-xl self-start md:self-auto select-none">
            <button
              onClick={() => setUseDemoData(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !useDemoData
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Live Data
            </button>
            <button
              onClick={() => setUseDemoData(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                useDemoData
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Demo Data
            </button>
          </div>
        </div>

        {/* Demo Data Notice Banner */}
        {useDemoData && (
          <div className="bg-amber-500/15 border border-amber-500/20 text-amber-600 p-4 rounded-2xl flex items-start gap-3">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs font-semibold leading-relaxed">
              <span className="font-extrabold uppercase tracking-wide mr-1 bg-amber-500 text-white px-1.5 py-0.5 rounded-md text-[9px]">Demo Mode</span>
              Currently displaying simulated checkout analytics. Toggle to <strong className="cursor-pointer underline hover:text-amber-700" onClick={() => setUseDemoData(false)}>&quot;Live Data&quot;</strong> to inspect real-time user database orders.
            </div>
          </div>
        )}

        {/* Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <Card className="border-border bg-background shadow-sm hover:shadow transition-shadow rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Sales</span>
                <h3 className="text-2xl font-black text-foreground">₹{activeStats.totalRevenue.toLocaleString('en-IN')}</h3>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-background shadow-sm hover:shadow transition-shadow rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Orders</span>
                <h3 className="text-2xl font-black text-foreground">{activeStats.totalOrders}</h3>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-600">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-background shadow-sm hover:shadow transition-shadow rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Avg Order Value</span>
                <h3 className="text-2xl font-black text-foreground">₹{activeStats.avgOrderValue.toLocaleString('en-IN')}</h3>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-background shadow-sm hover:shadow transition-shadow rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Store Users</span>
                <h3 className="text-2xl font-black text-foreground">{stats?.totalUsers ?? '—'}</h3>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-2xl text-purple-600">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Graphical Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Donut Chart: Orders Status Breakdown */}
          <Card className="border-border bg-background p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <PieIcon className="h-5 w-5 text-amber-500" /> Orders Status Distribution
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Breakdown of orders processed by lifecycle stage.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
              {/* Donut SVG */}
              <div className="relative h-44 w-44 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                  {/* Background ring */}
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--muted)" strokeWidth="4.5" />
                  
                  {/* Slices */}
                  {donutSlices.map((slice: any, idx: number) => (
                    <circle
                      key={idx}
                      cx="21"
                      cy="21"
                      r="15.91549430918954"
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth="5"
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      className="transition-all duration-500 hover:stroke-[6px]"
                    />
                  ))}
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-foreground leading-none">{totalOrdersCount}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Total</span>
                </div>
              </div>

              {/* Legends */}
              <div className="flex-1 space-y-3.5 w-full">
                {donutSlices.map((slice: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-2 capitalize text-foreground font-bold">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                        {slice.label}
                      </span>
                      <span className="text-muted-foreground font-bold">
                        {slice.count} orders ({slice.percentage}%)
                      </span>
                    </div>
                    {/* Tiny Progress Bar */}
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${slice.percentage}%`, backgroundColor: slice.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Bar Chart: Revenue Payment Channels */}
          <Card className="border-border bg-background p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-500" /> Revenue Payment Channels
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Comparing online cards, netbanking, and UPI gateway revenue.</p>
              </div>
            </div>

            <div className="space-y-5 py-2">
              {activeStats.paymentBreakdown.map((item: any) => {
                const totalRev = activeStats.totalRevenue || 1;
                const percent = Math.round((item.revenue / totalRev) * 100);
                const barHeight = (item.revenue / maxPaymentRevenue) * 100;

                return (
                  <div key={item._id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="uppercase font-black text-foreground tracking-wider flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {item._id || 'razorpay'}
                      </span>
                      <span className="text-muted-foreground font-bold">
                        ₹{item.revenue.toLocaleString('en-IN')} <span className="text-[10px] text-amber-600 font-extrabold ml-1">({percent}%)</span>
                      </span>
                    </div>

                    {/* Gradient Horizontal Bar */}
                    <div className="relative h-6 w-full bg-muted/30 rounded-xl overflow-hidden border border-border/20">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl transition-all duration-500"
                        style={{ width: `${barHeight}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

        </div>

        {/* Quick Console Actions */}
        <Card className="border-border bg-background p-6 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-bold text-foreground">Quick Administration Shortcuts</h3>
              <p className="text-xs text-muted-foreground">Manage catalog items, check incoming order details, or adjust banner sliders.</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/admin/products">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-xs py-5 px-6 shadow-md shadow-amber-500/10 cursor-pointer">
                  Manage Products <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant="outline" className="border-border rounded-xl font-bold text-xs py-5 px-6 hover:bg-muted/15 cursor-pointer">
                  Manage Orders <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline" className="border-border rounded-xl font-bold text-xs py-5 px-6 hover:bg-muted/15 cursor-pointer">
                  Manage Users <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/admin/cms">
                <Button variant="outline" className="border-border rounded-xl font-bold text-xs py-5 px-6 hover:bg-muted/15 cursor-pointer">
                  Manage CMS <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
