'use client';

import { useActionState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { loginAction, type AuthFormState } from '@/lib/auth/actions';

const initialState: AuthFormState = {};

export function LoginForm({
  registeredMessage,
  resetMessage,
}: {
  registeredMessage?: string;
  resetMessage?: string;
}) {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <div className="fu-card flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--navy)' }}>
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sign in to your FluentUp account to view your progress.
          </p>
        </div>

        {/* Post-registration confirmation banner */}
        {registeredMessage && (
          <div
            className="rounded-[var(--radius-sm)] border-[1.5px] border-[var(--teal)] px-4 py-3 text-sm font-medium"
            style={{ background: 'var(--teal-light)', color: 'var(--teal-dark)' }}
            role="status"
          >
            {registeredMessage}
          </div>
        )}

        {/* Post-reset success banner */}
        {resetMessage && (
          <div
            className="rounded-[var(--radius-sm)] border-[1.5px] border-[var(--teal)] px-4 py-3 text-sm font-medium"
            style={{ background: 'var(--teal-light)', color: 'var(--teal-dark)' }}
            role="status"
          >
            {resetMessage}
          </div>
        )}

        {/* Top-level error */}
        {state.message && (
          <div
            className="rounded-[var(--radius-sm)] border-[1.5px] border-[var(--navy)] px-4 py-3 text-sm font-medium"
            style={{ background: 'var(--error-light)', color: 'var(--error)' }}
            role="alert"
          >
            {state.message}
          </div>
        )}

        <form action={action} className="flex flex-col gap-4" noValidate>
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="text-sm font-bold"
              style={{ color: 'var(--navy)' }}
            >
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={pending}
              placeholder="you@example.com"
              className="fu-input"
              aria-describedby={state.errors?.email ? 'login-email-error' : undefined}
              aria-invalid={!!state.errors?.email}
            />
            {state.errors?.email && (
              <p id="login-email-error" className="text-xs font-medium" style={{ color: 'var(--error)' }}>
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="text-sm font-bold"
                style={{ color: 'var(--navy)' }}
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold underline-offset-2 hover:underline"
                style={{ color: 'var(--text-muted)' }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={pending}
              placeholder="••••••••"
              className="fu-input"
              aria-describedby={state.errors?.password ? 'login-password-error' : undefined}
              aria-invalid={!!state.errors?.password}
            />
            {state.errors?.password && (
              <p id="login-password-error" className="text-xs font-medium" style={{ color: 'var(--error)' }}>
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={pending}
            className="fu-btn-primary w-full mt-1"
            whileTap={!pending ? { scale: 0.97 } : {}}
          >
            {pending ? 'Signing in…' : 'Sign In →'}
          </motion.button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-bold underline-offset-2 hover:underline"
            style={{ color: 'var(--coral)' }}
          >
            Create one
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
