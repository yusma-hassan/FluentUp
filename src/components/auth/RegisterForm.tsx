'use client';

import { useActionState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { signupAction, type AuthFormState } from '@/lib/auth/actions';

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(signupAction, initialState);

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
            Create your account
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Join FluentUp and start tracking your speaking progress.
          </p>
        </div>

        {/* Top-level error/message */}
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
          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reg-name"
              className="text-sm font-bold"
              style={{ color: 'var(--navy)' }}
            >
              Full name
            </label>
            <input
              id="reg-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              disabled={pending}
              placeholder="Jane Smith"
              className="fu-input"
              aria-describedby={state.errors?.name ? 'reg-name-error' : undefined}
              aria-invalid={!!state.errors?.name}
            />
            {state.errors?.name && (
              <p id="reg-name-error" className="text-xs font-medium" style={{ color: 'var(--error)' }}>
                {state.errors.name[0]}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reg-email"
              className="text-sm font-bold"
              style={{ color: 'var(--navy)' }}
            >
              Email
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={pending}
              placeholder="you@example.com"
              className="fu-input"
              aria-describedby={state.errors?.email ? 'reg-email-error' : undefined}
              aria-invalid={!!state.errors?.email}
            />
            {state.errors?.email && (
              <p id="reg-email-error" className="text-xs font-medium" style={{ color: 'var(--error)' }}>
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reg-password"
              className="text-sm font-bold"
              style={{ color: 'var(--navy)' }}
            >
              Password
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              disabled={pending}
              placeholder="Min. 8 characters"
              className="fu-input"
              aria-describedby={state.errors?.password ? 'reg-password-error' : undefined}
              aria-invalid={!!state.errors?.password}
            />
            {state.errors?.password && (
              <ul id="reg-password-error" className="flex flex-col gap-0.5">
                {state.errors.password.map((err) => (
                  <li key={err} className="text-xs font-medium" style={{ color: 'var(--error)' }}>
                    {err}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reg-confirm"
              className="text-sm font-bold"
              style={{ color: 'var(--navy)' }}
            >
              Confirm password
            </label>
            <input
              id="reg-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              disabled={pending}
              placeholder="••••••••"
              className="fu-input"
              aria-describedby={state.errors?.confirmPassword ? 'reg-confirm-error' : undefined}
              aria-invalid={!!state.errors?.confirmPassword}
            />
            {state.errors?.confirmPassword && (
              <p id="reg-confirm-error" className="text-xs font-medium" style={{ color: 'var(--error)' }}>
                {state.errors.confirmPassword[0]}
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
            {pending ? 'Creating account…' : 'Create Account →'}
          </motion.button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
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
