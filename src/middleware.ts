import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const publicRoutes = ['/login', '/api/auth/login', '/api/auth/logout'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static assets, next internals, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;
  const isPublicRoute = publicRoutes.includes(pathname);

  // Exclude some api routes from protection during development? No, protect all except login.
  // Actually, we should allow /login and auth routes.

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    const payload = await verifyToken(token);
    
    if (!payload && !isPublicRoute) {
      // Invalid token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }

    if (payload && isPublicRoute && pathname === '/login') {
      // Already logged in, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Role based protection
    if (pathname.startsWith('/authorization-access') && payload?.role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Add user info to headers so we can access it if needed
    if (payload) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-role', payload.role);
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-id', payload.id.toString());
      requestHeaders.set('x-user-name', payload.name);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/api/:path*'],
};
