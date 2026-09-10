/**
 * Supabase middleware helper.
 *
 * Creates a Supabase client that can read and write cookies from a
 * Next.js `NextRequest` / `NextResponse` pair, then calls
 * `supabase.auth.getUser()` to refresh the session token if needed.
 *
 * This must be called from `src/middleware.ts` on every matching request
 * so that short-lived Supabase access tokens are silently refreshed before
 * they expire, keeping the session alive without requiring the user to log
 * in again.
 *
 * Returns the (potentially mutated) response and the authenticated user (or
 * null when unauthenticated).
 */


import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './types';

export async function updateSession(request: NextRequest) {
  // Start with an unmodified response — we may add Set-Cookie headers.
  let supabaseResponse = NextResponse.next({ request });

  console.log("SUPABASE URL EXISTS:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SUPABASE KEY EXISTS:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write to request so downstream server code sees updated cookies.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // Re-create response so we can append Set-Cookie headers.
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Do not add code between createServerClient and getUser().
  // getUser() is what actually refreshes the token when necessary.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, user };
}
