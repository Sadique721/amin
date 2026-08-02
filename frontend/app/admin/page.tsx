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
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Smartphone,
  Cpu,
  Wrench,
  Lock,
  RefreshCcw,
  Sparkles
} from 'lucide-react';
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

export default function AdminDashboardPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'Pending' | 'Processing' | 'Success' | 'Reject' | 'All'>('Pending');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [statsData, setStatsData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Initial order set matching the exact image reference with ability to pull real orders from backend
  const initialOrders: OrderItem[] = [
    { id: '1', ref: 'ORD-310725-1001', user: 'GenTechPro', service: 'Samsung KG Unlock', price: '₹2,500.00', status: 'Pending', date: '31-07-2025 12:42 PM' },
    { id: '2', ref: 'ORD-310725-1002', user: 'MobileFixer01', service: 'Xiaomi Bootloader Unlock', price: '₹1,800.00', status: 'Pending', date: '31-07-2025 12:36 PM' },
    { id: '3', ref: 'ORD-310725-1003', user: 'UnlockMaster', service: 'Oppo IMEI Repair', price: '₹3,200.00', status: 'Pending', date: '31-07-2025 12:35 PM' },
    { id: '4', ref: 'ORD-310725-1004', user: 'TechSolution', service: 'OnePlus FRP Remove', price: '₹900.00', status: 'Pending', date: '31-07-2025 12:28 PM' },
    { id: '5', ref: 'ORD-310725-1005', user: 'AndroidGuru', service: 'Realme IMEI Repair', price: '₹3,000.00', status: 'Pending', date: '31-07-2025 12:25 PM' },
    { id: '6', ref: 'ORD-310725-1006', user: 'ToolDealer', service: 'Unlock Tool Activation (1 Year)', price: '₹4,500.00', status: 'Pending', date: '31-07-2025 12:20 PM' },
    { id: '7', ref: 'ORD-310725-1007', user: 'GenClinic', service: 'iCloud Bypass (Full)', price: '₹2,700.00', status: 'Pending', date: '31-07-2025 12:15 PM' },
    { id: '8', ref: 'ORD-310725-1008', user: 'FlashKing', service: 'CPU / eMMC Reprogramming', price: '₹2,200.00', status: 'Pending', date: '31-07-2025 12:10 PM' },
    { id: '9', ref: 'ORD-310725-1009', user: 'FixItFast', service: 'iPhone Carrier Unlock', price: '₹5,000.00', status: 'Processing', date: '31-07-2025 11:55 AM' },
    { id: '10', ref: 'ORD-310725-1010', user: 'ExpertUnlock', service: 'Motorola Bootloader', price: '₹1,500.00', status: 'Success', date: '31-07-2025 11:40 AM' },
  ];

  const [orders, setOrders] = React.useState<OrderItem[]>(initialOrders);
  const [realOrders, setRealOrders] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function loadStatsAndOrders() {
      try {
        setLoading(true);
        const [statsRes, ordersRes] = await Promise.all([
          fetchSalesStatsApi().catch(() => ({ data: null })),
          fetchAdminOrdersApi(1, 50, 'all').catch(() => ({ data: { results: [] } })),
        ]);

        if (statsRes?.data) {
          setStatsData(statsRes.data);
        }

        const docs = ordersRes?.data?.results || ordersRes?.data?.docs || [];
        if (docs.length > 0) {
          setRealOrders(docs);
          const mapped: OrderItem[] = docs.map((o: any) => ({
            id: o._id,
            ref: `#${o._id?.substring(0, 10).toUpperCase()}`,
            user: o.shippingAddress?.fullName || o.user?.name || 'Customer',
            service: o.items?.[0]?.product?.name || 'GSM Service / Jewellery',
            price: `₹${(o.total ?? o.totalAmount ?? 0).toLocaleString('en-IN')}`,
            status: o.status === 'delivered' ? 'Success' : o.status === 'cancelled' ? 'Reject' : o.status === 'processing' ? 'Processing' : 'Pending',
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

  // Filtered orders logic
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

  const getServiceIcon = (service: string) => {
    if (service.includes('Samsung') || service.includes('Xiaomi') || service.includes('Oppo') || service.includes('Realme') || service.includes('OnePlus')) {
      return <Smartphone className="w-4 h-4 text-[#00a65a]" />;
    }
    if (service.includes('CPU') || service.includes('eMMC')) {
      return <Cpu className="w-4 h-4 text-purple-600" />;
    }
    if (service.includes('Tool') || service.includes('Activation')) {
      return <Wrench className="w-4 h-4 text-amber-600" />;
    }
    return <Lock className="w-4 h-4 text-blue-600" />;
  };

  const getStatusBadge = (status: OrderItem['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
      case 'Processing':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Processing</span>;
      case 'Success':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Success</span>;
      case 'Reject':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Reject</span>;
    }
  };

  return (
    <div className="space-y-6">

      {/* Top 6 KPI Summary Cards Grid matching Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Card 1: Users */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#00a65a]/10 flex items-center justify-center text-[#00a65a] shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 leading-tight">
              {statsData?.totalUsers ? statsData.totalUsers.toLocaleString() : '14'}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Users</p>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#00a65a]/10 flex items-center justify-center text-[#00a65a] shrink-0">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 leading-tight">
              {statsData?.totalOrders ?? realOrders.length ?? 0}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Total Orders</p>
          </div>
        </div>

        {/* Card 3: Pending Orders */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#00a65a]/10 flex items-center justify-center text-[#00a65a] shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 leading-tight">
              {realOrders.filter((o) => o.status === 'pending').length}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Pending Orders</p>
          </div>
        </div>

        {/* Card 4: Active Services */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#00a65a]/10 flex items-center justify-center text-[#00a65a] shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 leading-tight">68</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Active Services</p>
          </div>
        </div>

        {/* Card 5: API Connected */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#00a65a]/10 flex items-center justify-center text-[#00a65a] shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 leading-tight">11</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">API Connected</p>
          </div>
        </div>

        {/* Card 6: Total Profit (INR) */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#00a65a]/10 flex items-center justify-center text-[#00a65a] shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 leading-tight">
              ₹{(statsData?.totalRevenue ?? realOrders.reduce((sum, o) => sum + (o.total ?? 0), 0)).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Total Revenue (INR)</p>
          </div>
        </div>

      </div>

      {/* Main Table Card: Recent Orders */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Card Header & Controls */}
        <div className="p-5 border-b border-slate-200 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Title */}
            <h2 className="text-lg font-bold text-slate-800 tracking-tight shrink-0">Recent Orders</h2>

            {/* Search Input & Search Button */}
            <div className="flex items-center gap-2 max-w-md w-full">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Order ID, Customer, service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:border-[#00a65a] focus:ring-1 focus:ring-[#00a65a] transition-all bg-white"
                />
              </div>
              <button
                onClick={() => {}}
                className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('Pending')}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'Pending'
                    ? 'bg-[#00a65a] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pending <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded text-[10px]">96</span>
              </button>

              <button
                onClick={() => setActiveTab('Processing')}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'Processing'
                    ? 'bg-[#00a65a] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Processing
              </button>

              <button
                onClick={() => setActiveTab('Success')}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'Success'
                    ? 'bg-[#00a65a] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Success <span className="ml-1 px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px]">62132</span>
              </button>

              <button
                onClick={() => setActiveTab('Reject')}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'Reject'
                    ? 'bg-[#00a65a] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Reject <span className="ml-1 px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px]">0</span>
              </button>

              <button
                onClick={() => setActiveTab('All')}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'All'
                    ? 'bg-[#00a65a] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Orders
              </button>
            </div>

          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Ref</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Ref */}
                    <td className="py-3.5 px-4 font-medium text-[#00a65a] hover:underline cursor-pointer">
                      <Link href={`/admin/orders`}>
                        {ord.ref}
                      </Link>
                    </td>

                    {/* User */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span>{ord.user}</span>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 font-medium text-slate-800">
                        <div className="p-1 rounded bg-slate-100">
                          {getServiceIcon(ord.service)}
                        </div>
                        <span>{ord.service}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {ord.price}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(ord.status)}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ord.date}</span>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No orders matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card Footer: Item Count & Pagination matching Image */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 text-xs">
          
          <span className="text-slate-500 font-medium">
            Showing 1 to {filteredOrders.length} of 96 orders
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage(1)}
              className={`w-7 h-7 rounded font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === 1 ? 'bg-[#00a65a] text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              1
            </button>

            <button
              onClick={() => setCurrentPage(2)}
              className={`w-7 h-7 rounded font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === 2 ? 'bg-[#00a65a] text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              2
            </button>

            <button
              onClick={() => setCurrentPage(3)}
              className={`w-7 h-7 rounded font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === 3 ? 'bg-[#00a65a] text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              3
            </button>

            <span className="px-1 text-slate-400 font-bold">...</span>

            <button
              onClick={() => setCurrentPage(12)}
              className={`w-7 h-7 rounded font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === 12 ? 'bg-[#00a65a] text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              12
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(12, p + 1))}
              disabled={currentPage === 12}
              className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
