'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/features/auth/store/authSlice';
import { sendOtpApi, verifyOtpApi } from '@/features/auth/api/auth.api';
import { registrationSchema, otpSchema } from '@/features/auth/schemas/auth.schema';
import { api } from '@/services/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Mail, KeyRound, ArrowRight, RefreshCw, User, Phone, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { ZodError } from 'zod';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Stepper: 1 = Registration Details, 2 = Email OTP Verification, 3 = Account Set Up Success
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  
  // Registration Form States
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  
  // OTP Form States
  const [otpCode, setOtpCode] = React.useState('');
  const [timer, setTimer] = React.useState(0);
  
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<{ name?: string; email?: string; phone?: string; password?: string; otp?: string; general?: string }>({});

  // Countdown timer for OTP resend
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Step 1: Submit Details & Trigger OTP Send
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validate form inputs
      registrationSchema.parse({ name, email, phone, password });
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
      // Trigger OTP dispatch on backend
      await sendOtpApi(email);
      setStep(2);
      setTimer(60);
      toast.success('Validation OTP sent to your email!');
    } catch (err: any) {
      setErrors({ general: err.response?.data?.message || 'Failed to dispatch verification email. Please try again.' });
      toast.error('Verification failed to start');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Profile Patching
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
      // 1. Verify OTP with backend to log in
      const response = await verifyOtpApi(email, otpCode);
      const { user, accessToken, refreshToken } = response.data;

      // 2. Set credentials in Redux
      dispatch(setCredentials({ user, accessToken, refreshToken }));

      // 3. Immediately update user details (Name, Password, Phone) via Profile Patch
      const profileResponse = await api.patch(
        '/users/profile',
        {
          name,
          phone: phone || undefined,
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // 4. Update credentials in Redux state with verified info
      const updatedUser = profileResponse.data.data || profileResponse.data;
      dispatch(
        setCredentials({
          user: {
            id: updatedUser._id || user.id,
            name: updatedUser.name || name,
            email: updatedUser.email || email,
            role: updatedUser.role || user.role,
            isActive: updatedUser.isActive !== undefined ? updatedUser.isActive : user.isActive,
            isEmailVerified: updatedUser.isEmailVerified !== undefined ? updatedUser.isEmailVerified : user.isEmailVerified,
          },
          accessToken,
          refreshToken,
        })
      );

      setStep(3);
      toast.success('Registration completed successfully!');
    } catch (err: any) {
      setErrors({ general: err.response?.data?.message || 'Verification or profile update failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Redirection on successful registration
  const handleFinalRedirect = () => {
    router.push('/shop');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium glowing background blurs */}
      <div className="absolute -left-40 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-amber-500/10 to-rose-500/10 blur-3xl" />
      <div className="absolute -right-40 bottom-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-amber-500/10 to-rose-500/10 blur-3xl" />

      <Card className="w-full max-w-md border-border bg-background/60 backdrop-blur-md shadow-2xl transition-all duration-300">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          
          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-center gap-2 pt-2 pb-1 select-none">
            <div className={`h-1.5 w-10 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-amber-500' : 'bg-muted'}`} />
            <div className={`h-1.5 w-10 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-amber-500' : 'bg-muted'}`} />
            <div className={`h-1.5 w-10 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-amber-500' : 'bg-muted'}`} />
          </div>
          
          <CardDescription className="text-muted-foreground text-xs font-semibold">
            {step === 1 && 'Enter your information below to register.'}
            {step === 2 && `Enter the validation code sent to ${email}`}
            {step === 3 && 'Your account setup is complete!'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Global Error message banner */}
          {errors.general && (
            <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20 transition-all duration-200">
              {errors.general}
            </div>
          )}

          {/* STEP 1: REGISTRATION DETAILS FORM */}
          {step === 1 && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="reg-name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`pl-10 focus-visible:ring-amber-500 ${errors.name ? 'border-destructive' : ''}`}
                    disabled={loading}
                  />
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                {errors.name && <p className="text-[11px] text-destructive font-medium mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="reg-email"
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
                <label htmlFor="reg-phone" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Phone Number <span className="text-muted-foreground/60">(Optional)</span>
                </label>
                <div className="relative">
                  <Input
                    id="reg-phone"
                    type="text"
                    placeholder="+919876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`pl-10 focus-visible:ring-amber-500 ${errors.phone ? 'border-destructive' : ''}`}
                    disabled={loading}
                  />
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                {errors.phone && <p className="text-[11px] text-destructive font-medium mt-1">{errors.phone}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-password" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
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
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <>Continue & Verify Email <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="reg-otp" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <Input
                    id="reg-otp"
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
                    onClick={handleDetailsSubmit}
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
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <>Complete Setup <CheckCircle2 className="h-4 w-4" /></>}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground text-xs"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Edit Details
              </Button>
            </form>
          )}

          {/* STEP 3: SUCCESS SCREEN */}
          {step === 3 && (
            <div className="text-center py-6 space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Welcome to Sanab!</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your premium jewellery & cosmetics account has been successfully configured. You can now shop, save items to your wishlist, and manage your delivery addresses.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleFinalRedirect}
                className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-white font-bold py-6 rounded-xl shadow-lg shadow-amber-500/15 cursor-pointer"
              >
                Go to Shop & Collections
              </Button>
            </div>
          )}

          {/* Redirect to Login Link (Only shown on Step 1) */}
          {step === 1 && (
            <p className="text-center text-xs text-muted-foreground font-semibold mt-4">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-amber-500 hover:underline hover:text-amber-600 font-bold transition-all">
                Sign In
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
