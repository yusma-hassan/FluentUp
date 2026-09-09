'use client';

import { useActionState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { forgotPasswordAction, type AuthFormState } from '@/lib/auth/actions';

const initialState: AuthFormState = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initialState);

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
            Reset your password
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

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
              htmlFor="forgot-email"
              className="text-sm font-bold"
              style={{ color: 'var(--navy)' }}
            >
              Email
            </label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={pending}
              placeholder="you@example.com"
              className="fu-input"
              aria-describedby={state.errors?.email ? 'forgot-email-error' : undefined}
              aria-invalid={!!state.errors?.email}
            />
            {state.errors?.email && (
              <p id="forgot-email-error" className="text-xs font-medium" style={{ color: 'var(--error)' }}>
                {state.errors.email[0]}
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
            {pending ? 'Sending…' : 'Send Reset Link →'}
          </motion.button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Remember your password?{' '}
          <Link
            href="/login"
            className="font-bold underline-offset-2 hover:underline"
            style={{ color: 'var(--coral)' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
