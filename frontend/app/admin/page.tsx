'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/hooks/redux';
import { fetchSalesStatsApi } from '@/features/checkout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, ShoppingBag, DollarSign, Activity, Users, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!accessToken || user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/login?redirect=/admin');
      return;
    }

    async function loadStats() {
      try {
        setLoading(true);
        const res = await fetchSalesStatsApi();
        setStats(res.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load sales stats.');
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [accessToken, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/10 flex items-center justify-center p-6">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Admin Console</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time store stats and administration tools.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/orders">
              <Button variant="outline" className="border-border rounded-xl font-bold flex items-center gap-1.5 hover:bg-muted/15">
                <ShoppingBag className="h-4 w-4" /> Manage Orders
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-1.5">
                <ShoppingCart className="h-4 w-4" /> Manage Products
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <Card className="border-border bg-background shadow-sm hover:shadow transition-shadow duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Sales</span>
                <h3 className="text-2xl font-black text-foreground">₹{stats.totalRevenue || 0}</h3>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-background shadow-sm hover:shadow transition-shadow duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Orders</span>
                <h3 className="text-2xl font-black text-foreground">{stats.totalOrders || 0}</h3>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-600">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-background shadow-sm hover:shadow transition-shadow duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Avg Order Value</span>
                <h3 className="text-2xl font-black text-foreground">₹{stats.avgOrderValue || 0}</h3>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-background shadow-sm hover:shadow transition-shadow duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Store Users</span>
                <h3 className="text-2xl font-black text-foreground">12</h3>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-2xl text-purple-600">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <Card className="border-border bg-background p-6 rounded-2xl shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-500" /> Orders Status Distribution
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Breakdown of orders processed by current lifecycle stage.</p>
            </div>
            
            <div className="space-y-4">
              {stats.statusBreakdown?.map((item: any) => {
                const total = stats.totalOrders || 1;
                const percent = Math.round((item.count / total) * 100);
                return (
                  <div key={item._id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="capitalize text-foreground font-bold">{item._id}</span>
                      <span className="text-muted-foreground">{item.count} order(s) ({percent}%)</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="border-border bg-background p-6 rounded-2xl shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-500" /> Revenue Payment Channels
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Comparing online cards/UPI gateway usage vs cash on delivery.</p>
            </div>

            <div className="space-y-4">
              {stats.paymentBreakdown?.map((item: any) => {
                const totalRev = stats.totalRevenue || 1;
                const percent = Math.round((item.revenue / totalRev) * 100);
                return (
                  <div key={item._id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="uppercase text-foreground font-bold">{item._id || 'razorpay'}</span>
                      <span className="text-muted-foreground">₹{item.revenue} ({percent}%)</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
}
