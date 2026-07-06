import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || '5e6833fe6b9eb47b85e05a089d701046bbbb1bcf030b200b3e6e737c35f7ba52'
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    const tokenCookie = request.cookies.get('session_token');

    if (!tokenCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
      const role = payload.role as string;

      // Check path prefixes
      if (pathname.startsWith('/dashboard/super-admin') && role !== 'super_admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      if (pathname.startsWith('/dashboard/admin') && !['super_admin', 'admin'].includes(role)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      if (
        pathname.startsWith('/dashboard/receptionist') &&
        !['super_admin', 'admin', 'receptionist'].includes(role)
      ) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      if (pathname.startsWith('/dashboard/teacher') && !['super_admin', 'admin', 'teacher'].includes(role)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      if (pathname.startsWith('/dashboard/student') && !['super_admin', 'admin', 'student'].includes(role)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Root path redirect
      if (pathname === '/dashboard') {
        if (role === 'super_admin') {
          return NextResponse.redirect(new URL('/dashboard/super-admin', request.url));
        }
        if (role === 'admin') {
          return NextResponse.redirect(new URL('/dashboard/admin', request.url));
        }
        if (role === 'receptionist') {
          return NextResponse.redirect(new URL('/dashboard/receptionist', request.url));
        }
        if (role === 'teacher') {
          return NextResponse.redirect(new URL('/dashboard/teacher', request.url));
        }
        if (role === 'student') {
          return NextResponse.redirect(new URL('/dashboard/student', request.url));
        }
      }
    } catch (error) {
      console.error('Proxy JWT validation error:', error);
      const res = NextResponse.redirect(new URL('/login', request.url));
      res.cookies.delete('session_token');
      return res;
    }
  }

  if (pathname === '/login') {
    const tokenCookie = request.cookies.get('session_token');
    if (tokenCookie) {
      try {
        await jwtVerify(tokenCookie.value, JWT_SECRET);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (e) {
        // Token invalid, allow login page access
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
