import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sanab_accessToken')?.value;
  const role = request.cookies.get('sanab_role')?.value;
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isCustomerRoute = pathname.startsWith('/account');

  // 1. Unauthenticated users trying to access protected routes
  if ((isAdminRoute || isCustomerRoute) && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Non-admin users trying to access admin dashboard
  if (isAdminRoute && role && role !== 'admin') {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
