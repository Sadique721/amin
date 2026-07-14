'use client';

import { AuthForm } from '@/features/auth';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute -left-40 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-amber-500/10 to-rose-500/10 blur-3xl" />
      <div className="absolute -right-40 bottom-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-amber-500/10 to-rose-500/10 blur-3xl" />
      
      <AuthForm />
    </div>
  );
}
