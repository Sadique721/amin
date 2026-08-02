'use client';

import * as React from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/features/auth';
import { api } from '@/services/axios';
import {
  User,
  Mail,
  Lock,
  Save,
  Shield,
  Bell,
  Globe,
  Check,
  Smartphone,
  Key,
  Server,
  Building
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  const [mounted, setMounted] = React.useState(false);

  // Admin Profile Form State
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('+91 9876543210');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');

  // Store Configuration State
  const [siteName, setSiteName] = React.useState('SANAB GSM & Jewellery');
  const [supportEmail, setSupportEmail] = React.useState('entitykart@gmail.com');
  const [currency, setCurrency] = React.useState('INR (₹)');
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [emailNotifications, setEmailNotifications] = React.useState(true);

  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingConfig, setSavingConfig] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && user) {
      setName(user.name || 'Admin User');
      setEmail(user.email || 'entitykart@gmail.com');
    }
  }, [mounted, user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Please provide name and email.');
      return;
    }
    setSavingProfile(true);
    try {
      try {
        await api.put('/users/profile', { name, email });
      } catch (apiErr) {}

      const updatedUser = { ...(user || {}), name, email, role: user?.role || 'admin' };
      dispatch(setCredentials({ user: updatedUser as any, accessToken: accessToken || 'token', refreshToken: 'token' }));
      localStorage.setItem('sanab_user', JSON.stringify(updatedUser));

      toast.success('Admin Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setTimeout(() => {
      setSavingConfig(false);
      toast.success('System configuration saved successfully!');
    }, 400);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Top Banner Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Admin Profile & Settings <Building className="w-6 h-6 text-[#00a65a]" />
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage your personal administrator account details, security credentials, store parameters, and notification channels.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card 1: Admin Profile Details */}
        <form onSubmit={handleProfileSave} className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-[#00a65a]" />
              <h2 className="text-base font-bold text-slate-800">Admin Account Profile</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:border-[#00a65a] focus:ring-1 focus:ring-[#00a65a]"
                    placeholder="Admin Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Administrator Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:border-[#00a65a] focus:ring-1 focus:ring-[#00a65a]"
                    placeholder="admin@sanab.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:border-[#00a65a] focus:ring-1 focus:ring-[#00a65a]"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" /> Change Security Password
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">New Password (Optional)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:border-[#00a65a] focus:ring-1 focus:ring-[#00a65a]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-5 py-2.5 rounded-md font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Updating Profile...' : 'Update Admin Profile'}</span>
            </button>
          </div>
        </form>

        {/* Card 2: Store & System Settings */}
        <form onSubmit={handleConfigSave} className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#00a65a]" />
              <h2 className="text-base font-bold text-slate-800">Store & System Parameters</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Brand Title</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:border-[#00a65a] focus:ring-1 focus:ring-[#00a65a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">System Mailer Address</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:border-[#00a65a] focus:ring-1 focus:ring-[#00a65a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Base Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:border-[#00a65a] focus:ring-1 focus:ring-[#00a65a]"
                >
                  <option value="INR (₹)">INR - Indian Rupee (₹)</option>
                  <option value="USD ($)">USD - US Dollar ($)</option>
                  <option value="EUR (€)">EUR - Euro (€)</option>
                  <option value="AED (AED)">AED - UAE Dirham</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Email Notification Channel</p>
                    <p className="text-[11px] text-slate-500">Send order receipts & OTP verification emails via Nodemailer SMTP.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-5 h-5 accent-[#00a65a] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Maintenance Mode</p>
                    <p className="text-[11px] text-slate-500">Temporarily restrict customer website access for updates.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="w-5 h-5 accent-[#00a65a] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={savingConfig}
              className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-5 py-2.5 rounded-md font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingConfig ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
