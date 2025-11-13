import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/signin', '/signup', '/', '/api/auth'];
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // If it's a public path, continue
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If there's no token and the path is not public, redirect to signin
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Check role-based access if needed
  const userRole = request.cookies.get('userRole')?.value;
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
