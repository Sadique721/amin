'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPasswordApi } from '@/features/auth/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, KeyRound, Eye, EyeOff, ArrowRight, RefreshCw, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Extract token from URL client-side to prevent Next.js SSR suspense requirements
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setToken(params.get('token') || '');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!token) {
      setError('Invalid or missing reset token.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await resetPasswordApi(token, password);
      setSuccess(true);
      toast.success('Password updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Token is invalid or has expired. Please request a new link.');
      toast.error('Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium glowing blurs */}
      <div className="absolute -left-40 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-amber-500/10 to-rose-500/10 blur-3xl" />
      <div className="absolute -right-40 bottom-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-amber-500/10 to-rose-500/10 blur-3xl" />
      
      <Card className="w-full max-w-md border-border bg-background/60 backdrop-blur-md shadow-2xl transition-all duration-300">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
            Choose Password
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Enter your new secure password below to complete the reset process.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20 transition-all duration-200">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">Password Reset Complete</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Your credentials have been securely updated. You can now use your new password to log in.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/auth/login" className="block">
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer">
                    Sign In Account
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    New Password
                  </label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 focus-visible:ring-amber-500"
                    disabled={loading || !token}
                  />
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={loading || !token}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="confirm-password" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 focus-visible:ring-amber-500"
                    disabled={loading || !token}
                  />
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {!token && (
                <div className="text-center text-xs text-rose-500 font-semibold py-2">
                  ⚠️ No reset token detected in URL. Please use the link sent to your email.
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-white font-bold gap-2 py-6 rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer"
                disabled={loading || !token}
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <>Reset Password <ArrowRight className="h-4 w-4" /></>}
              </Button>

              <div className="text-center pt-2">
                <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
