import Link from 'next/link';
import { SiteNav } from '@/components/layout/SiteNav';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { PageBackground } from '@/components/ui/PageBackground';

export const metadata = {
  title: 'Create Account — FluentUp',
  description: 'Create a FluentUp account to track your speaking progress.',
};

export default function RegisterPage() {
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
          <RegisterForm />
        </div>
      </main>
    </>
  );
}
