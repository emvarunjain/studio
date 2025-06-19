
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register'];
const PROTECTED_ROUTES = ['/chat', '/admin']; // Add other protected routes here
const ADMIN_ROUTES = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('firebaseIdToken'); // Example cookie name, adjust if different

  // Check if trying to access a public route while authenticated
  if (sessionCookie && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // Check if trying to access a protected route without authentication
  if (!sessionCookie && PROTECTED_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Rudimentary admin check - In a real app, verify token and check custom claims
  if (sessionCookie && ADMIN_ROUTES.includes(pathname)) {
    // This is a placeholder. A real admin check would involve decoding the token
    // and checking for an admin role/claim. For now, if they have a session and try
    // to access admin, we let it pass, client-side will do further checks.
    // A more robust server-side check here is recommended for production.
    // For instance, you might have an API route that verifies the token's admin claim.
  }

  return NextResponse.next();
}

/*
 * Match all request paths except for the ones starting with:
 * - api (API routes)
 * - _next/static (static files)
 * - _next/image (image optimization files)
 * - favicon.ico (favicon file)
 * - assets (custom static assets folder)
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
