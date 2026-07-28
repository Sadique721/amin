'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/hooks/redux';
import { api } from '@/services/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  RefreshCw, Users, Search, ChevronLeft, ChevronRight,
  Sparkles, ShieldCheck, UserX, UserCheck, Trash2, Mail, Phone
} from 'lucide-react';
import { toast } from 'sonner';

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

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  const roleColor = (role: string) =>
    role === 'admin' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30' : 'bg-blue-500/10 text-blue-600 border border-blue-500/30';

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-muted/10 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <Link href="/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-500 mb-2 transition-colors">
              <ChevronLeft className="h-4 w-4" /> Admin Console
            </Link>
            <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
              Store Users <Sparkles className="h-6 w-6 text-amber-500" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalUsers} registered users — manage access, roles, and account status.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-background border border-border p-4 rounded-2xl shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 focus-visible:ring-amber-500"
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10' },
            { label: 'Active', value: users.filter(u => u.isActive).length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
            { label: 'Inactive', value: users.filter(u => !u.isActive).length, icon: UserX, color: 'text-rose-600', bg: 'bg-rose-500/10' },
            { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-500/10' },
          ].map(s => (
            <Card key={s.label} className="border-border bg-background rounded-2xl shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
                  <p className="text-2xl font-black text-foreground">{s.value}</p>
                </div>
                <div className={`${s.bg} p-2.5 rounded-xl ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users Table */}
        {users.length === 0 ? (
          <div className="bg-background border border-border rounded-3xl p-16 text-center shadow-sm space-y-4">
            <div className="bg-blue-500/10 p-5 rounded-full inline-block text-blue-500">
              <Users className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No Users Found</h3>
            <p className="text-sm text-muted-foreground">No users match your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="bg-background border border-border rounded-3xl overflow-hidden shadow-sm hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6">Contact</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Joined</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm font-semibold">
                  {users.map(u => {
                    const uid = u._id || u.id;
                    const joinDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                    return (
                      <tr key={uid} className="hover:bg-muted/10 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                              {u.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-foreground font-bold">{u.name}</p>
                              <p className="text-muted-foreground text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[180px]">{u.email}</span>
                            </div>
                            {u.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" /> {u.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${roleColor(u.role)}`}>
                            {u.role === 'admin' && <ShieldCheck className="h-3 w-3" />}
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-muted-foreground text-xs">{joinDate}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${u.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                            {u.isActive ? <><UserCheck className="h-3 w-3" /> Active</> : <><UserX className="h-3 w-3" /> Inactive</>}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionId === uid}
                            onClick={() => toggleStatus(u)}
                            className={`rounded-xl border text-xs font-bold h-8 px-3 cursor-pointer ${u.isActive ? 'border-rose-500/20 text-rose-600 hover:bg-rose-50/10' : 'border-emerald-500/20 text-emerald-600 hover:bg-emerald-50/10'}`}
                          >
                            {actionId === uid ? <RefreshCw className="h-3 w-3 animate-spin" /> : u.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {users.map(u => {
                const uid = u._id || u.id;
                return (
                  <Card key={uid} className="border-border bg-background p-4 rounded-2xl shadow-sm">
                    <CardContent className="p-0 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground truncate">{u.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold capitalize ${roleColor(u.role)}`}>{u.role}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <span className={`text-xs font-bold ${u.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionId === uid}
                          onClick={() => toggleStatus(u)}
                          className="h-8 text-xs rounded-xl"
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 border-t border-border pt-8">
                <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="rounded-xl h-10 w-10">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-bold text-muted-foreground px-3">Page {page} of {totalPages}</span>
                <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="rounded-xl h-10 w-10">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
