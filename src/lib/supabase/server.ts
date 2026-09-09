/**
 * Server-side Supabase client.
 *
 * Created with `createServerClient` from `@supabase/ssr`.  Reads and writes
 * session cookies via the Next.js `cookies()` API so the session is
 * automatically refreshed on every server-side request.
 *
 * Use this in Server Components, Server Actions, and API route handlers.
 * Never import this file in 'use client' components.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
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
            // setAll called from a Server Component — cookies cannot be set
            // during rendering but the middleware will handle refreshing.
          }
        },
      },
    },
  );
}
