/**
 * Browser-side Supabase client.
 *
 * Created with `createBrowserClient` from `@supabase/ssr` so that it
 * integrates with the cookie-based session managed by @supabase/ssr
 * middleware and server helpers.
 *
 * Use this only in 'use client' components.
 */
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
