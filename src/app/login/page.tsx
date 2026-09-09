import Link from 'next/link';
import { SiteNav } from '@/components/layout/SiteNav';
import { LoginForm } from '@/components/auth/LoginForm';
import { PageBackground } from '@/components/ui/PageBackground';

interface LoginPageProps {
  searchParams: Promise<{ registered?: string; reset?: string; next?: string }>;
}

export const metadata = {
  title: 'Sign In — FluentUp',
  description: 'Sign in to your FluentUp account.',
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const registeredMessage =
    params.registered === '1'
      ? 'Account created! Check your email to confirm, then sign in.'
      : undefined;
  const resetMessage =
    params.reset === '1'
      ? 'Your password has been updated. Sign in with your new password.'
      : undefined;

  return (
    <>
      <SiteNav />
      <main
        className="relative flex flex-1 flex-col items-center justify-center px-4 py-12"
        style={{ background: 'var(--bg-page)' }}
      >
        <PageBackground variant="auth" />

        {/* Brand — links back home */}
        <Link
          href="/"
          className="relative z-10 mb-8 text-2xl font-extrabold tracking-tight hover:opacity-75 transition-opacity"
          style={{ color: 'var(--navy)' }}
        >
          Fluent<span style={{ color: 'var(--coral)' }}>Up</span>
        </Link>

        <div className="relative z-10 w-full">
          <LoginForm registeredMessage={registeredMessage} resetMessage={resetMessage} />
        </div>
      </main>
    </>
  );
}
