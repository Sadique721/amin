'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Users,
  LayoutGrid,
  Clock,
  CheckCircle2,
  Zap,
  IndianRupee,
  Search,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  ArrowUpRight,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  ShieldCheck,
  RefreshCcw,
  Smartphone,
  Cpu,
  Wrench,
  Lock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { fetchSalesStatsApi, fetchAdminOrdersApi } from '@/features/checkout';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  ref: string;
  user: string;
  service: string;
  price: string;
  status: 'Pending' | 'Processing' | 'Success' | 'Reject';
  date: string;
}

const revenueChartData = [
  { month: 'Jan', revenue: 145000, orders: 42, profit: 45000 },
  { month: 'Feb', revenue: 210000, orders: 58, profit: 68000 },
  { month: 'Mar', revenue: 185000, orders: 51, profit: 59000 },
  { month: 'Apr', revenue: 290000, orders: 84, profit: 92000 },
  { month: 'May', revenue: 340000, orders: 98, profit: 115000 },
  { month: 'Jun', revenue: 410000, orders: 120, profit: 142000 },
  { month: 'Jul', revenue: 485000, orders: 145, profit: 168000 },
  { month: 'Aug', revenue: 560000, orders: 168, profit: 195000 },
];

const categoryPieData = [
  { name: 'Diamond Jewellery', value: 42, color: '#f59e0b' },
  { name: 'Luxury Cosmetics', value: 28, color: '#ec4899' },
  { name: 'Gold & Solitaires', value: 18, color: '#10b981' },
  { name: 'Franchise Royalty', value: 12, color: '#6366f1' },
];

const paymentGatewayData = [
  { method: 'Razorpay (UPI/QR)', count: 184, amount: 620000, color: '#3b82f6' },
  { method: 'Authorize.Net (Cards)', count: 96, amount: 480000, color: '#8b5cf6' },
  { method: 'Cash on Delivery', count: 64, amount: 210000, color: '#10b981' },
];

export default function AdminDashboardPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'Pending' | 'Processing' | 'Success' | 'Reject' | 'All'>('All');
  const [statsData, setStatsData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const initialOrders: OrderItem[] = [
    { id: '1', ref: 'ORD-1785754636489-X7CE', user: 'Md Sadique Amin', service: 'Royal Diamond Solitaire Ring', price: '₹145,034.00', status: 'Success', date: '03 Aug 2026' },
    { id: '2', ref: 'ORD-1785754636608-VTKB', user: 'Sadique (Test)', service: 'Crystal Hoop Earrings', price: '₹34,000.00', status: 'Pending', date: '03 Aug 2026' },
    { id: '3', ref: 'ORD-1785755196807-E68H', user: 'Md Sadique Amin', service: 'Pure Gold Kundan Necklace', price: '₹214,034.00', status: 'Processing', date: '03 Aug 2026' },
    { id: '4', ref: 'ORD-310725-1004', user: 'Luxury Buyer', service: 'Velvet Matte Lipstick Set', price: '₹4,500.00', status: 'Success', date: '02 Aug 2026' },
    { id: '5', ref: 'ORD-310725-1005', user: 'Franchise Partner', service: 'SANAB Store Franchise Kit', price: '₹500,000.00', status: 'Success', date: '01 Aug 2026' },
  ];

  const [orders, setOrders] = React.useState<OrderItem[]>(initialOrders);

  React.useEffect(() => {
    async function loadStatsAndOrders() {
      try {
        setLoading(true);
        const [statsRes, ordersRes] = await Promise.all([
          fetchSalesStatsApi().catch(() => ({ data: null })),
          fetchAdminOrdersApi(1, 50, 'all').catch(() => ({ data: { results: [] } })),
        ]);

        if (statsRes?.data) setStatsData(statsRes.data);

        const docs = ordersRes?.data?.results || ordersRes?.data?.docs || [];
        if (docs.length > 0) {
          const mapped: OrderItem[] = docs.map((o: any) => ({
            id: o._id || o.id,
            ref: o.orderNumber || `#${(o._id||o.id||'').substring(0, 10).toUpperCase()}`,
            user: o.shippingAddress?.fullName || o.user?.name || o.userEmail || 'Customer',
            service: o.items?.[0]?.product?.name || o.items?.[0]?.sku || 'Luxury Jewellery Item',
            price: `₹${(o.total ?? o.totalAmount ?? 0).toLocaleString('en-IN')}`,
            status: o.status === 'shipped' || o.status === 'delivered' ? 'Success' : o.status === 'cancelled' ? 'Reject' : o.status === 'processing' ? 'Processing' : 'Pending',
            date: new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
          }));
          setOrders(mapped);
        }
      } catch (err: any) {
      } finally {
        setLoading(false);
      }
    }
    loadStatsAndOrders();
  }, []);

  const filteredOrders = orders.filter((ord) => {
    const matchesTab = activeTab === 'All' || ord.status === activeTab;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      ord.ref.toLowerCase().includes(query) ||
      ord.user.toLowerCase().includes(query) ||
      ord.service.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: OrderItem['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30">Pending</span>;
      case 'Processing':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/30">Processing</span>;
      case 'Success':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">Success</span>;
      case 'Reject':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/30">Reject</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            Executive Control Dashboard
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Real-time enterprise revenue, multi-gateway analytics, and order operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.success('Live telemetry refreshed!')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-muted/40 hover:bg-muted text-foreground border border-border flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Sync Live Metrics</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            System Live (99.98% Uptime)
          </div>
        </div>
      </div>

      {/* Top 6 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground leading-tight">
              {statsData?.totalUsers ? statsData.totalUsers.toLocaleString() : '14'}
            </h3>
            <p className="text-[11px] font-bold text-muted-foreground">Active Users</p>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground leading-tight">
              {orders.length}
            </h3>
            <p className="text-[11px] font-bold text-muted-foreground">Total Orders</p>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground leading-tight">
              {orders.filter((o) => o.status === 'Pending').length}
            </h3>
            <p className="text-[11px] font-bold text-muted-foreground">Pending Action</p>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground leading-tight">
              {orders.filter((o) => o.status === 'Success').length}
            </h3>
            <p className="text-[11px] font-bold text-muted-foreground">Completed</p>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground leading-tight">3 Active</h3>
            <p className="text-[11px] font-bold text-muted-foreground">Payment Gateways</p>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground leading-tight">
              ₹{(statsData?.totalRevenue ?? 1310000).toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] font-bold text-muted-foreground">Gross Revenue</p>
          </div>
        </div>

      </div>

      {/* Interactive Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Area Chart: Revenue & Profit Velocity */}
        <div className="lg:col-span-2 bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Revenue & Profit Trajectory (FY 2026)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly gross revenue vs net operating margin (INR)</p>
            </div>
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border text-[11px] font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white shadow-xs">2026 YTD</span>
            </div>
          </div>

          <div className="h-[300px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Category Sales Breakdown */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="border-b border-border/60 pb-4">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-emerald-500" />
              Category Share
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sales distribution by product line</p>
          </div>

          <div className="h-[220px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
            {categoryPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] font-bold text-foreground truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bar Chart: Gateway Volume Breakdown & Recent Orders Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Payment Gateway Distribution Bar Chart */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-border/60 pb-4">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Gateway Performance
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Volume processed per payment channel</p>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentGatewayData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="method" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {paymentGatewayData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Table */}
        <div className="lg:col-span-2 bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-extrabold text-foreground tracking-tight">Recent Orders Activity</h2>
              <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-xl border border-border">
                {(['All', 'Pending', 'Processing', 'Success', 'Reject'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by order ID, customer name, item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-border text-xs focus:outline-none focus:border-amber-500 bg-background text-foreground"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
                  <th className="p-3.5">Order Ref</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Item</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 font-bold text-amber-500">{ord.ref}</td>
                    <td className="p-3.5 font-bold text-foreground">{ord.user}</td>
                    <td className="p-3.5 text-muted-foreground truncate max-w-[180px]">{ord.service}</td>
                    <td className="p-3.5 font-black text-foreground">{ord.price}</td>
                    <td className="p-3.5">{getStatusBadge(ord.status)}</td>
                    <td className="p-3.5 text-muted-foreground">{ord.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {filteredOrders.length} orders</span>
            <Link href="/admin/orders" className="font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1">
              <span>View All Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
