import Link from 'next/link';
import { SiteNav } from '@/components/layout/SiteNav';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { PageBackground } from '@/components/ui/PageBackground';

interface ForgotPasswordPageProps {
  searchParams: Promise<{ sent?: string }>;
}

export const metadata = {
  title: 'Reset Password — FluentUp',
  description: 'Request a password reset link for your FluentUp account.',
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  const sent = params.sent === '1';

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
          {sent ? (
            /* Confirmation state — shown after forgotPasswordAction redirects here */
            <div className="w-full max-w-md mx-auto fu-card flex flex-col gap-4 text-center">
              {/* Icon */}
              <div
                className="flex h-14 w-14 mx-auto items-center justify-center rounded-full border-[2px] border-[var(--navy)]"
                style={{ background: 'var(--teal-light)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="var(--teal-dark)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>

              <div>
                <h1 className="text-xl font-extrabold" style={{ color: 'var(--navy)' }}>
                  Check your email
                </h1>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  If an account exists for that email address, we&apos;ve sent a
                  password reset link. Check your inbox and follow the link to set a
                  new password.
                </p>
              </div>

              <Link
                href="/login"
                className="text-sm font-bold underline-offset-2 hover:underline"
                style={{ color: 'var(--coral)' }}
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <ForgotPasswordForm />
          )}
        </div>
      </main>
    </>
  );
}
