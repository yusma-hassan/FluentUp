/**
 * GET /auth/callback
 *
 * PKCE callback handler for Supabase Auth email flows.
 *
 * Supabase includes a one-time `code` query parameter in every email link
 * (sign-up confirmation, magic link, password reset). This route handler
 * exchanges that code for a session via `exchangeCodeForSession()`, then
 * redirects the user to the appropriate destination.
 *
 * The `next` query parameter is set by `forgotPasswordAction` to
 * `/reset-password` so the user lands on the password-update form once
 * their recovery session is established.
 *
 * Security notes:
 * - The code is one-time-use and time-limited (managed by Supabase).
 * - No sensitive data is returned to the client; only a redirect is issued.
 * - If exchange fails, the user is sent to /login with ?error=1.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  // If no code is present the link is malformed — send to login with error.
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=1`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // In a Route Handler cookies() is writable, so this should not
            // throw — but guard defensively.
          }
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // The code was invalid, already used, or expired.
    // Redirect to login with a generic error flag.
    return NextResponse.redirect(`${origin}/login?error=1`);
  }

  // Code exchanged successfully — session cookies are now set.
  // Redirect to the intended destination (e.g. /reset-password).
  // Use a relative URL so the redirect works in any environment.
  return NextResponse.redirect(`${origin}${next}`);
}
