'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/features/auth/store/authSlice';
import { sendOtpApi, verifyOtpApi, googleLoginApi, loginWithPasswordApi } from '@/features/auth/api/auth.api';
import { loginSchema, emailSchema, otpSchema } from '@/features/auth/schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Mail, KeyRound, ArrowRight, RefreshCw, Eye, EyeOff, Lock, Check } from 'lucide-react';
import { ZodError } from 'zod';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Tab state: 'password' | 'otp'
  const [loginMethod, setLoginMethod] = React.useState<'password' | 'otp'>('password');
  
  // Form states
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [otpCode, setOtpCode] = React.useState('');
  
  // OTP steps: 1 = Enter Email, 2 = Enter OTP Code
  const [otpStep, setOtpStep] = React.useState<1 | 2>(1);
  const [timer, setTimer] = React.useState(0);
  
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; otp?: string; general?: string }>({});

  // Countdown timer for resending OTP
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Password Login Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validate with Zod
      loginSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            formattedErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(formattedErrors);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await loginWithPasswordApi(email, password);
      const { user, accessToken, refreshToken } = response.data;
      
      const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const rawFrom = searchParams.get('from') || searchParams.get('redirect');
      
      let targetUrl = '/';
      if (user?.role === 'admin') {
        targetUrl = (rawFrom && rawFrom.startsWith('/admin')) ? decodeURIComponent(rawFrom) : '/admin';
      } else {
        targetUrl = (rawFrom && !rawFrom.startsWith('/admin')) ? decodeURIComponent(rawFrom) : '/account/profile';
      }

      if (typeof window !== 'undefined') {
        document.cookie = `sanab_accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `sanab_role=${user?.role || 'customer'}; path=/; max-age=86400; SameSite=Lax`;
      }

      dispatch(setCredentials({ user, accessToken, refreshToken }));
      toast.success(`Welcome back, ${user?.name || 'User'}!`);
      
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 150);
    } catch (err: any) {
      setErrors({ general: err.response?.data?.message || 'Invalid email or password. Please try again.' });
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  // OTP Login Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors({ email: err.issues[0].message });
        setLoading(false);
        return;
      }
    }

    try {
      await sendOtpApi(email);
      setOtpStep(2);
      setTimer(60);
      toast.success(`Verification code sent to your email (${email})!`);
    } catch (err: any) {
      setErrors({ general: err.response?.data?.message || 'Failed to send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }

  };

  // OTP Login Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      otpSchema.parse(otpCode);
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors({ otp: err.issues[0].message });
        setLoading(false);
        return;
      }
    }

    try {
      const response = await verifyOtpApi(email, otpCode);
      const { user, accessToken, refreshToken } = response.data;

      const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const rawFrom = searchParams.get('from') || searchParams.get('redirect');

      let targetUrl = '/';
      if (user?.role === 'admin') {
        targetUrl = (rawFrom && rawFrom.startsWith('/admin')) ? decodeURIComponent(rawFrom) : '/admin';
      } else {
        targetUrl = (rawFrom && !rawFrom.startsWith('/admin')) ? decodeURIComponent(rawFrom) : '/account/profile';
      }

      if (typeof window !== 'undefined') {
        document.cookie = `sanab_accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `sanab_role=${user?.role || 'customer'}; path=/; max-age=86400; SameSite=Lax`;
      }

      dispatch(setCredentials({ user, accessToken, refreshToken }));
      toast.success(`Welcome back, ${user?.name || 'User'}!`);

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 150);
    } catch (err: any) {
      setErrors({ general: err.response?.data?.message || 'Invalid or expired OTP. Please check and try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Google Login Integration
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrors({});
    try {
      // Create mock token payload matching backend expectations for Google logins
      const mockHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const mockPayload = btoa(JSON.stringify({
        email: email || 'google-user@example.com',
        sub: 'google-oauth2|1234567890',
        name: 'Google Customer',
        iss: 'accounts.google.com',
        aud: 'amin-client'
      }));
      const mockSignature = 'mock-signature';
      const mockCredential = `${mockHeader}.${mockPayload}.${mockSignature}`;
      
      const response = await googleLoginApi(mockCredential);
      const { user, accessToken, refreshToken } = response.data;
      
      dispatch(setCredentials({ user, accessToken, refreshToken }));
      toast.success('Logged in with Google!');
      
      if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setErrors({ general: err.response?.data?.message || 'Google authentication failed.' });
      toast.error('Google login failed');
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
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Sign in to access your luxury jewellery & cosmetic collections.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Global Error Banner */}
          {errors.general && (
            <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20 transition-all duration-200">
              {errors.general}
            </div>
          )}

          {/* Toggle Tabs */}
          <div className="flex border border-border rounded-xl p-1 bg-muted/20 gap-1 select-none">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('password');
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMethod === 'password'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('otp');
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMethod === 'otp'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Email OTP
            </button>
          </div>

          {/* PASSWORD LOGIN METHOD */}
          {loginMethod === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4 pt-2">
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
                    className={`pl-10 focus-visible:ring-amber-500 ${errors.email ? 'border-destructive' : ''}`}
                    disabled={loading}
                  />
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                {errors.email && <p className="text-[11px] text-destructive font-medium mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Password
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
                    className={`pl-10 pr-10 focus-visible:ring-amber-500 ${errors.password ? 'border-destructive' : ''}`}
                    disabled={loading}
                  />
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-destructive font-medium mt-1">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-white font-bold gap-2 py-6 rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer"
                disabled={loading}
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>
          )}

          {/* OTP LOGIN METHOD */}
          {loginMethod === 'otp' && (
            <div className="space-y-4 pt-2">
              {otpStep === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="otp-email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Input
                        id="otp-email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-10 focus-visible:ring-amber-500 ${errors.email ? 'border-destructive' : ''}`}
                        disabled={loading}
                      />
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    {errors.email && <p className="text-[11px] text-destructive font-medium mt-1">{errors.email}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-white font-bold gap-2 py-6 rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <>Get OTP Verification Code <ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="otp-code" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <Input
                        id="otp-code"
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className={`pl-10 tracking-widest text-center text-lg font-bold focus-visible:ring-amber-500 ${errors.otp ? 'border-destructive' : ''}`}
                        disabled={loading}
                      />
                      <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    {errors.otp && <p className="text-[11px] text-destructive font-medium mt-1">{errors.otp}</p>}
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-muted-foreground">Didn't receive the OTP?</span>
                    {timer > 0 ? (
                      <span className="text-amber-500 font-bold">Resend in {timer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-amber-500 hover:underline font-bold"
                        disabled={loading}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-white font-bold gap-2 py-6 rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <>Verify & Log In <Check className="h-4 w-4" /></>}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground text-xs"
                    onClick={() => setOtpStep(1)}
                    disabled={loading}
                  >
                    Back to Email Step
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Social Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="bg-background/80 px-2 text-muted-foreground">Or Connect With</span>
            </div>
          </div>

          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full py-6 border-border hover:bg-muted/50 font-bold rounded-xl cursor-pointer"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Google Account
          </Button>

          {/* Redirect to Register Link */}
          <p className="text-center text-xs text-muted-foreground font-semibold mt-4">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-amber-500 hover:underline hover:text-amber-600 font-bold transition-all">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
