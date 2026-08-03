'use client';

import * as React from 'react';
import { MessageSquare, User, Send, CheckCircle2, Clock, XCircle, Search, Sparkles, RefreshCw, Mail, Inbox } from 'lucide-react';

const ticketsData = [
  { id: '1', user: 'Md Sadique Amin', email: 'mdsadiqueamin721786@gmail.com', subject: 'Order Delivery Status Inquiry', status: 'Open',    date: '03 Aug 2026', avatar: 'M', priority: 'High' },
  { id: '2', user: 'Luxury Buyer',     email: 'buyer@example.com',              subject: 'Return Request — Crystal Hoops', status: 'Pending', date: '02 Aug 2026', avatar: 'L', priority: 'Medium' },
  { id: '3', user: 'Franchise Partner',email: 'partner@franchise.com',          subject: 'SANAB Franchise Onboarding Docs', status: 'Closed', date: '01 Aug 2026', avatar: 'F', priority: 'Low' },
  { id: '4', user: 'Test Customer',    email: 'test@sanab.com',                 subject: 'Payment confirmation not received', status: 'Open', date: '03 Aug 2026', avatar: 'T', priority: 'High' },
];

const STATUS_CONFIG = {
  Open:    { icon: Clock,         color: '#f59e0b', bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200' },
  Pending: { icon: RefreshCw,     color: '#3b82f6', bg: 'bg-blue-100',    text: 'text-blue-700',    border: 'border-blue-200' },
  Closed:  { icon: CheckCircle2,  color: '#10b981', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
};

const PRIORITY_CONFIG = {
  High:   { bg: 'bg-rose-100',   text: 'text-rose-700' },
  Medium: { bg: 'bg-amber-100',  text: 'text-amber-700' },
  Low:    { bg: 'bg-slate-100',  text: 'text-slate-600' },
};

const AVATAR_COLORS = ['#00a65a', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

export default function AdminMessagesPage() {
  const [tickets, setTickets] = React.useState(ticketsData);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'Open' | 'Pending' | 'Closed'>('all');
  const [replying, setReplying] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState('');

  const openCount = tickets.filter(t => t.status === 'Open').length;
  const pendingCount = tickets.filter(t => t.status === 'Pending').length;
  const closedCount = tickets.filter(t => t.status === 'Closed').length;

  const filtered = tickets.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || t.user.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const handleReply = (id: string) => {
    if (!replyText.trim()) return;
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Closed' as const } : t));
    setReplying(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Support Messages <Sparkles className="w-5 h-5 text-[#00a65a] animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage customer inquiries, support tickets, and franchise communications.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open Tickets',    value: openCount,    icon: Clock,        color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Pending',         value: pendingCount, icon: RefreshCw,    color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Resolved',        value: closedCount,  icon: CheckCircle2, color: '#10b981', bg: '#f0fdf4' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900">{s.value}</p>
                  <p className="text-[11px] font-semibold text-slate-500">{s.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter + Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#00a65a]/30 focus:border-[#00a65a] transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'Open', 'Pending', 'Closed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === f
                  ? 'bg-[#00a65a] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">
            <Inbox className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No support tickets found.</p>
          </div>
        ) : (
          filtered.map((ticket, idx) => {
            const statusCfg = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG];
            const priorityCfg = PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG];
            const StatusIcon = statusCfg.icon;
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const isReplying = replying === ticket.id;

            return (
              <div key={ticket.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {ticket.avatar}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-sm">{ticket.user}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${priorityCfg.bg} ${priorityCfg.text}`}>
                          {ticket.priority}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {ticket.status}
                        </span>
                        <span className="ml-auto text-[10px] text-slate-400 font-medium">{ticket.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
                        <Mail className="w-3 h-3" />
                        {ticket.email}
                      </div>
                      <p className="text-sm font-semibold text-slate-700">{ticket.subject}</p>
                    </div>
                  </div>

                  {/* Reply Box */}
                  {isReplying && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Type your reply here..."
                        className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00a65a]/30 focus:border-[#00a65a] resize-none transition-all"
                      />
                      <div className="flex gap-2 mt-2 justify-end">
                        <button
                          onClick={() => { setReplying(null); setReplyText(''); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReply(ticket.id)}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#00a65a] text-white hover:bg-[#008d4c] transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" /> Send Reply
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {!isReplying && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setReplying(ticket.id)}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#00a65a] text-white hover:bg-[#008d4c] transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3" /> Reply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
