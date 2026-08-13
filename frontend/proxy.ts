import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Derive the signing key as a Uint8Array for jose (edge-compatible).
// Must match JWT_SECRET used by lib/db.ts signAccess().
function getJwtSecretBytes(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return new TextEncoder().encode('dev_only_jwt_secret_do_not_use_in_production_12345');
  }
  return new TextEncoder().encode(secret);
}

// Next.js 16 requires the exported function to be named `proxy` or default export
export async function proxy(request: NextRequest) {
  const tokenCookie = request.cookies.get('sanab_accessToken')?.value;
  const { pathname } = request.nextUrl;

  const isAdminRoute    = pathname.startsWith('/admin');
  const isCustomerRoute = pathname.startsWith('/account');

  // 1. Unauthenticated users cannot access protected routes at all.
  if ((isAdminRoute || isCustomerRoute) && !tokenCookie) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Verify the JWT and derive the role from the verified payload.
  if ((isAdminRoute || isCustomerRoute) && tokenCookie) {
    try {
      const { payload } = await jwtVerify(tokenCookie, getJwtSecretBytes());
      const role = (payload as any).role as string | undefined;

      // 2a. Non-admin users cannot access the admin dashboard.
      if (isAdminRoute && role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // 2b. Propagate verified role downstream as a request header.
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-verified-role', role || 'user');
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      // Token invalid / expired — treat as unauthenticated.
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
