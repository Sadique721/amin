'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux';
import { api } from '@/services/axios';
import {
  RefreshCw, Users, Search, ChevronLeft, ChevronRight,
  Sparkles, ShieldCheck, UserX, UserCheck, Mail, Phone,
  TrendingUp, BarChart3, UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.fill || p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [actionId, setActionId] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(1); }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const loadUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users', { params: { page, limit: 15, search: debouncedSearch } });
      const data = res.data?.data || res.data;
      setUsers(data.results || []);
      const total = data.totalResults || 0;
      setTotalUsers(total);
      setTotalPages(Math.ceil(total / 15) || 1);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  React.useEffect(() => { setMounted(true); }, []);

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
      toast.error('Admin access required');
      router.push('/auth/login?from=' + encodeURIComponent('/admin/users'));
      return;
    }
    loadUsers();
  }, [mounted, accessToken, user, loadUsers, router]);

  const toggleStatus = async (u: any) => {
    try {
      setActionId(u._id || u.id);
      const newStatus = !u.isActive;
      await api.patch(`/admin/users/${u._id || u.id}`, { isActive: newStatus });
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'}`);
      setUsers(prev => prev.map(x => (x._id || x.id) === (u._id || u.id) ? { ...x, isActive: newStatus } : x));
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update user');
    } finally {
      setActionId(null);
    }
  };

  // Analytics
  const activeCount = users.filter(u => u.isActive).length;
  const inactiveCount = users.filter(u => !u.isActive).length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const customerCount = users.filter(u => u.role !== 'admin').length;

  const rolePieData = [
    { name: 'Customers', value: customerCount, color: '#3b82f6' },
    { name: 'Admins', value: adminCount, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  const statusBarData = [
    { name: 'Active', value: activeCount, fill: '#10b981' },
    { name: 'Inactive', value: inactiveCount, fill: '#ef4444' },
    { name: 'Admin', value: adminCount, fill: '#f59e0b' },
    { name: 'Customer', value: customerCount, fill: '#3b82f6' },
  ];

  // Mock join trend (last 7 days based on loaded page)
  const joinTrend = React.useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })] = 0;
    }
    users.forEach(u => {
      if (u.createdAt) {
        const d = new Date(u.createdAt);
        const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        if (days[key] !== undefined) days[key]++;
      }
    });
    return Object.entries(days).map(([date, count]) => ({ date, count }));
  }, [users]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Store Users <Sparkles className="w-5 h-5 text-[#00a65a] animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">{totalUsers} registered accounts — manage roles, access, and status.</p>
        </div>
        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm text-xs font-bold text-slate-600"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: totalUsers, icon: Users, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
          { label: 'Active',      value: activeCount, icon: UserCheck, color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
          { label: 'Inactive',    value: inactiveCount, icon: UserX,   color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
          { label: 'Admins',      value: adminCount,  icon: ShieldCheck, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all"
              style={{ borderColor: s.border }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <TrendingUp className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Join Trend Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-[#00a65a]" />
            <h3 className="text-sm font-bold text-slate-700">New Registrations (7 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={joinTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00a65a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00a65a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="New Users" stroke="#00a65a" fill="url(#userGrad)" strokeWidth={2} dot={{ fill: '#00a65a', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution Pie */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[#00a65a]" />
            <h3 className="text-sm font-bold text-slate-700">Role Breakdown</h3>
          </div>
          {rolePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={rolePieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {rolePieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-slate-300">No data</div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#00a65a]/30 focus:border-[#00a65a] transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-[#00a65a]" />
              <p className="text-xs text-slate-500 font-medium">Loading users…</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No users found matching your search.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-4 px-5">User</th>
                    <th className="py-4 px-5">Contact</th>
                    <th className="py-4 px-5">Role</th>
                    <th className="py-4 px-5">Joined</th>
                    <th className="py-4 px-5 text-center">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {users.map(u => {
                    const uid = u._id || u.id;
                    const joinDate = u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—';
                    return (
                      <tr key={uid} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#00a65a] to-emerald-700 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
                              {u.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-xs leading-tight">{u.name}</p>
                              <p className="text-[10px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{u.email}</span>
                            </div>
                            {u.phone && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <Phone className="h-3 w-3 text-slate-400" /> {u.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {u.role === 'admin' && <ShieldCheck className="h-3 w-3" />}
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-[11px] text-slate-400 font-medium">{joinDate}</td>
                        <td className="py-4 px-5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            u.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {u.isActive ? <><UserCheck className="h-3 w-3" /> Active</> : <><UserX className="h-3 w-3" /> Inactive</>}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            disabled={actionId === uid}
                            onClick={() => toggleStatus(u)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                              u.isActive
                                ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {actionId === uid
                              ? <RefreshCw className="h-3 w-3 animate-spin inline" />
                              : u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
              {users.map(u => {
                const uid = u._id || u.id;
                return (
                  <div key={uid} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00a65a] to-emerald-700 flex items-center justify-center text-white font-black shrink-0">
                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate text-sm">{u.name}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>{u.role}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <span className={`text-xs font-bold flex items-center gap-1 ${u.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {u.isActive ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        disabled={actionId === uid}
                        onClick={() => toggleStatus(u)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          u.isActive
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs">
                <span className="text-slate-400 font-medium">Page {page} of {totalPages}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-white transition-colors disabled:opacity-40 shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-white transition-colors disabled:opacity-40 shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
