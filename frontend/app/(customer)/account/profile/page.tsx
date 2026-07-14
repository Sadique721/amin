'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux';
import { api } from '@/services/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MapPin, Trash2, CheckCircle2, Plus, ArrowLeft, RefreshCw, Smartphone, Mail, Shield } from 'lucide-react';

interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  
  const [profileName, setProfileName] = React.useState('');
  const [profilePhone, setProfilePhone] = React.useState('');
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  
  const [activeTab, setActiveTab] = React.useState<'profile' | 'addresses'>('profile');
  const [loading, setLoading] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newStreet, setNewStreet] = React.useState('');
  const [newCity, setNewCity] = React.useState('');
  const [newState, setNewState] = React.useState('');
  const [newPostalCode, setNewPostalCode] = React.useState('');
  const [newCountry, setNewCountry] = React.useState('India');
  const [newIsDefault, setNewIsDefault] = React.useState(false);

  React.useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users/profile');
        const userData = response.data.data;
        setProfileName(userData.name || '');
        setProfilePhone(userData.phone || '');
        setAddresses(userData.addresses || []);
      } catch (err: any) {
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.patch('/users/profile', {
        name: profileName,
        phone: profilePhone,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newState || !newPostalCode) {
      setMessage({ type: 'error', text: 'Please fill in all address fields.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const response = await api.post('/users/addresses', {
        street: newStreet,
        city: newCity,
        state: newState,
        postalCode: newPostalCode,
        country: newCountry,
        isDefault: newIsDefault,
      });
      setAddresses(response.data.data);
      setMessage({ type: 'success', text: 'Address added successfully!' });
      
      setNewStreet('');
      setNewCity('');
      setNewState('');
      setNewPostalCode('');
      setNewCountry('India');
      setNewIsDefault(false);
      setShowAddForm(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add address.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    setActionLoading(`delete-${addressId}`);
    setMessage(null);
    try {
      const response = await api.delete(`/users/addresses/${addressId}`);
      setAddresses(response.data.data);
      setMessage({ type: 'success', text: 'Address deleted successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete address.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setActionLoading(`default-${addressId}`);
    setMessage(null);
    try {
      const response = await api.patch(`/users/addresses/${addressId}/default`);
      setAddresses(response.data.data);
      setMessage({ type: 'success', text: 'Default address updated!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update default address.' });
    } finally {
      setActionLoading(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Button>
          <div className="text-right">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">My Account</h1>
            <p className="text-sm text-muted-foreground">Manage profile, personal info, and shipping addresses</p>
          </div>
        </div>

        {message && (
          <div
            className={`rounded-lg border p-4 text-sm font-medium transition-all ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-2 md:col-span-1">
            <button
              onClick={() => { setActiveTab('profile'); setMessage(null); }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                  : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <User className="h-4 w-4" /> Profile Info
            </button>
            <button
              onClick={() => { setActiveTab('addresses'); setMessage(null); }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                activeTab === 'addresses'
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                  : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <MapPin className="h-4 w-4" /> Saved Addresses
            </button>
          </div>

          <div className="md:col-span-3">
            {loading ? (
              <Card className="flex h-64 items-center justify-center border-border bg-background/50">
                <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
              </Card>
            ) : activeTab === 'profile' ? (
              <Card className="border-border bg-background/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Personal Profile Details</CardTitle>
                  <CardDescription>Update your public account information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                          <Input
                            required
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="pl-10 focus-visible:ring-amber-500"
                          />
                          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                        <div className="relative">
                          <Input
                            placeholder="+91 9999999999"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="pl-10 focus-visible:ring-amber-500"
                          />
                          <Smartphone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email (Read Only)</label>
                        <div className="relative">
                          <Input
                            value={user.email}
                            disabled
                            className="pl-10 bg-muted/50 cursor-not-allowed opacity-75"
                          />
                          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Role</label>
                        <div className="relative">
                          <Input
                            value={user.role}
                            disabled
                            className="pl-10 bg-muted/50 cursor-not-allowed uppercase tracking-wider opacity-75"
                          />
                          <Shield className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3"
                    >
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Manage Addresses</h2>
                  <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-white font-semibold gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add New Address
                  </Button>
                </div>

                {showAddForm && (
                  <Card className="border-border bg-background/50 backdrop-blur-sm shadow-xl p-6">
                    <form onSubmit={handleAddAddress} className="space-y-6">
                      <h3 className="text-lg font-bold">New Shipping Address</h3>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase">Street Address</label>
                          <Input
                            required
                            placeholder="Apartment, suite, unit, building, floor, street address"
                            value={newStreet}
                            onChange={(e) => setNewStreet(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase">City</label>
                          <Input
                            required
                            placeholder="Mumbai"
                            value={newCity}
                            onChange={(e) => setNewCity(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase">State / Province</label>
                          <Input
                            required
                            placeholder="Maharashtra"
                            value={newState}
                            onChange={(e) => setNewState(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase">Postal / ZIP Code</label>
                          <Input
                            required
                            placeholder="400001"
                            value={newPostalCode}
                            onChange={(e) => setNewPostalCode(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase">Country</label>
                          <Input
                            required
                            value={newCountry}
                            onChange={(e) => setNewCountry(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          id="set-default"
                          type="checkbox"
                          checked={newIsDefault}
                          onChange={(e) => setNewIsDefault(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                        />
                        <label htmlFor="set-default" className="text-sm font-medium text-foreground select-none cursor-pointer">
                          Set as my default shipping address
                        </label>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                          Add Address
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowAddForm(false)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Card>
                )}

                {addresses.length === 0 ? (
                  <Card className="flex h-48 flex-col items-center justify-center border-dashed border-border bg-background/30 p-8 text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <h3 className="text-lg font-bold text-foreground">No Saved Addresses</h3>
                    <p className="text-sm text-muted-foreground">Add a delivery location to speed up checkouts</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {addresses.map((address) => (
                      <Card
                        key={address._id}
                        className={`border-border bg-background/50 backdrop-blur-sm transition-all shadow-md relative ${
                          address.isDefault ? 'ring-2 ring-amber-500/50' : ''
                        }`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                              <MapPin className="h-3 w-3" /> Shipping Address
                            </span>
                            {address.isDefault && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Default
                              </span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-sm text-foreground leading-relaxed font-medium">
                            <p>{address.street}</p>
                            <p>{address.city}, {address.state} - {address.postalCode}</p>
                            <p>{address.country}</p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between border-t border-border pt-4">
                          {!address.isDefault ? (
                            <button
                              onClick={() => handleSetDefault(address._id)}
                              disabled={actionLoading !== null}
                              className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                            >
                              {actionLoading === `default-${address._id}` ? 'Setting...' : 'Set as Default'}
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-muted-foreground">Active Address</span>
                          )}

                          <button
                            onClick={() => handleDeleteAddress(address._id)}
                            disabled={actionLoading !== null}
                            className="text-xs font-semibold text-destructive hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {actionLoading === `delete-${address._id}` ? 'Deleting...' : 'Delete'}
                          </button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
