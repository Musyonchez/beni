import { NextResponse, type NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

// Optimistic check only (cookie-based, no DB hit) — a UX nicety that avoids
// a flash of protected/auth content before the real check. The actual
// authorization boundary is lib/dal.ts's verifySession()/getCurrentUser(),
// called from the protected layout and every Server Action. See the
// "Optimistic checks with Proxy" section of Next.js's Authentication guide.

const PROTECTED_PREFIX = '/dashboard';
const AUTH_ROUTES = new Set(['/login', '/register']);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await decrypt(request.cookies.get('session')?.value);

  if (pathname.startsWith(PROTECTED_PREFIX) && !session?.userId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (AUTH_ROUTES.has(pathname) && session?.userId) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
