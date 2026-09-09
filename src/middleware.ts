/**
 * Next.js Edge Middleware.
 *
 * Responsibilities:
 * 1. Refresh the Supabase session cookie on every request so access tokens
 *    never silently expire mid-session.
 * 2. Redirect unauthenticated visitors away from /dashboard → /login.
 * 3. Redirect authenticated users away from /login and /register → /dashboard
 *    (avoids showing auth forms to signed-in users).
 *
 * IMPORTANT: This file does NOT touch any protected MVP-0 routes
 * (/challenge, /api/evaluate, /api/generate-topics).
 */

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Refresh session and get current user (null when signed out)
  const { response, user } = await updateSession(request);

  // ── Protected routes ─────────────────────────────────────────────────────
  // Unauthenticated users cannot access /dashboard
  if (pathname.startsWith('/dashboard') && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Auth routes ───────────────────────────────────────────────────────────
  // Authenticated users have no reason to visit /login or /register
  if ((pathname === '/login' || pathname === '/register') && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    dashboardUrl.search = '';
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

// Run middleware on every route EXCEPT static files, images, and API routes
// that have their own auth checks.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
