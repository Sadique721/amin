'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { forgotPasswordApi } from '@/features/auth/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Mail, ArrowRight, RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      await forgotPasswordApi(trimmedEmail);
      setSuccess(true);
      toast.success('Reset link dispatched to your inbox!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request password reset. Please try again.');
      toast.error('Failed to request reset');
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
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Enter your registered email address and we'll send you a link to reset your password.
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
                <h3 className="text-lg font-bold text-foreground">Check Your Email</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  If an account is registered with <strong className="text-foreground">{email}</strong>, you will receive a secure password reset link shortly.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 focus-visible:ring-amber-500"
                    disabled={loading}
                  />
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-white font-bold gap-2 py-6 rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer"
                disabled={loading}
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <>Send Reset Link <ArrowRight className="h-4 w-4" /></>}
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
