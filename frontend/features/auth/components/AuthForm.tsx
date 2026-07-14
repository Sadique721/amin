'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '../store/authSlice';
import { sendOtpApi, verifyOtpApi, googleLoginApi } from '../api/auth.api';
import { emailSchema, otpSchema } from '../schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Mail, KeyRound, ArrowRight, RefreshCw } from 'lucide-react';
import { ZodError } from 'zod';

export function AuthForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [step, setStep] = React.useState<1 | 2>(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [timer, setTimer] = React.useState(0);
  const [hasPassword, setHasPassword] = React.useState(false);
  const [usePassword, setUsePassword] = React.useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.issues[0].message);
        return;
      }
    }

    const isAdmin = email.toLowerCase() === 'admin@sanab.com' || email.toLowerCase().startsWith('admin@');
    if (isAdmin) {
      setHasPassword(true);
      setUsePassword(true);
      setStep(2);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await sendOtpApi(email);
      const hasPwd = !!response.data?.hasPassword;
      setHasPassword(hasPwd);
      setUsePassword(hasPwd);
      setStep(2);
      setTimer(60);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isAdmin = email.toLowerCase() === 'admin@sanab.com' || email.toLowerCase().startsWith('admin@');
    if (!isAdmin && !usePassword) {
      try {
        otpSchema.parse(otp);
      } catch (err) {
        if (err instanceof ZodError) {
          setError(err.issues[0].message);
          return;
        }
      }
    }

    setLoading(true);
    setError(null);
    try {
      const response = await verifyOtpApi(email, otp);
      const { user, accessToken, refreshToken } = response.data;
      
      dispatch(setCredentials({ user, accessToken, refreshToken }));
      if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials or OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const mockHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const mockPayload = btoa(JSON.stringify({
        email: email || 'google-user@example.com',
        sub: 'google-oauth2|1234567890',
        name: 'Google Customer',
        iss: 'accounts.google.com',
        aud: 'sanab-client'
      }));
      const mockSignature = 'mock-signature';
      const mockCredential = `${mockHeader}.${mockPayload}.${mockSignature}`;
      
      const response = await googleLoginApi(mockCredential);
      const { user, accessToken, refreshToken } = response.data;
      
      dispatch(setCredentials({ user, accessToken, refreshToken }));
      if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = email.toLowerCase() === 'admin@sanab.com' || email.toLowerCase().startsWith('admin@');

  return (
    <Card className="w-full max-w-md border-border bg-background/60 backdrop-blur-md shadow-2xl">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
          <Sparkles className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          {step === 1 ? 'Welcome back' : usePassword ? 'Enter Password' : 'Enter security code'}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {step === 1 
            ? 'Sign in or sign up passwordless with email OTP' 
            : usePassword 
            ? 'Please enter your account password to log in'
            : `We've sent a 6-digit code to ${email}`}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive font-medium border border-destructive/20">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
              className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-white font-medium gap-2 py-5"
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Get OTP Code <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {hasPassword && !isAdmin && (
              <div className="flex border border-border rounded-xl p-1 bg-muted/10 gap-1 select-none mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setUsePassword(true);
                    setOtp('');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    usePassword
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsePassword(false);
                    setOtp('');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    !usePassword
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  OTP Verification
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="otp" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {usePassword ? 'Account Password' : '6-Digit Verification Code'}
              </label>
              <div className="relative">
                <Input
                  id="otp"
                  type={usePassword ? 'password' : 'text'}
                  placeholder={usePassword ? '••••••••' : '123456'}
                  maxLength={usePassword ? undefined : 6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(usePassword ? e.target.value : e.target.value.replace(/\D/g, ''))}
                  className={`pl-10 focus-visible:ring-amber-500 ${!usePassword ? 'tracking-widest text-center text-lg font-bold' : ''}`}
                  disabled={loading}
                />
                <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            
            {!usePassword && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Didn't receive it?</span>
                {timer > 0 ? (
                  <span className="text-amber-500 font-semibold">Resend in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-amber-500 hover:underline font-semibold"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-white font-medium gap-2 py-5"
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Verify & Log In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back to Email
            </Button>
          </form>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full py-5 border-border hover:bg-muted/50"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
          Google Account
        </Button>
      </CardContent>
    </Card>
  );
}
