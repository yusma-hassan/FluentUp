import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SiteNav } from '@/components/layout/SiteNav';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { createClient } from '@/lib/supabase/server';
import { PageBackground } from '@/components/ui/PageBackground';

export const metadata = {
  title: 'Set New Password — FluentUp',
  description: 'Set a new password for your FluentUp account.',
};

/**
 * /reset-password
 *
 * Only reachable after the user has clicked the recovery email link and
 * the PKCE code has been exchanged for a session at /auth/callback.
 *
 * Server-side auth check: if there is no active session (e.g. the user
 * navigated here directly), redirect to /forgot-password so they can
 * request a new link rather than seeing a confusing empty form.
 */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No active session — the recovery link was not used or has expired.
  if (!user) {
    redirect('/forgot-password');
  }

  return (
    <>
      <SiteNav />
      <main
        className="relative flex flex-1 flex-col items-center justify-center px-4 py-12"
        style={{ background: 'var(--bg-page)' }}
      >
        <PageBackground variant="auth" />

        {/* Brand */}
        <Link
          href="/"
          className="relative z-10 mb-8 text-2xl font-extrabold tracking-tight hover:opacity-75 transition-opacity"
          style={{ color: 'var(--navy)' }}
        >
          Fluent<span style={{ color: 'var(--coral)' }}>Up</span>
        </Link>

        <div className="relative z-10 w-full">
          <ResetPasswordForm />
        </div>
      </main>
    </>
  );
}
