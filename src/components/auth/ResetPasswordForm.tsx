'use client';

import { useActionState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { resetPasswordAction, type AuthFormState } from '@/lib/auth/actions';

const initialState: AuthFormState = {};

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, initialState);

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
            Set a new password
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Choose a strong password for your FluentUp account.
          </p>
        </div>

        {/* Top-level error */}
        {state.message && (
          <div
            className="rounded-[var(--radius-sm)] border-[1.5px] border-[var(--navy)] px-4 py-3 text-sm font-medium"
            style={{ background: 'var(--error-light)', color: 'var(--error)' }}
            role="alert"
          >
            {state.message}{' '}
            <Link
              href="/forgot-password"
              className="font-bold underline underline-offset-2"
              style={{ color: 'var(--error)' }}
            >
              Request a new link.
            </Link>
          </div>
        )}

        <form action={action} className="flex flex-col gap-4" noValidate>
          {/* New password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reset-password"
              className="text-sm font-bold"
              style={{ color: 'var(--navy)' }}
            >
              New password
            </label>
            <input
              id="reset-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              disabled={pending}
              placeholder="Min. 8 characters"
              className="fu-input"
              aria-describedby={state.errors?.password ? 'reset-password-error' : undefined}
              aria-invalid={!!state.errors?.password}
            />
            {state.errors?.password && (
              <ul id="reset-password-error" className="flex flex-col gap-0.5">
                {state.errors.password.map((err) => (
                  <li key={err} className="text-xs font-medium" style={{ color: 'var(--error)' }}>
                    {err}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm new password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reset-confirm"
              className="text-sm font-bold"
              style={{ color: 'var(--navy)' }}
            >
              Confirm new password
            </label>
            <input
              id="reset-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              disabled={pending}
              placeholder="••••••••"
              className="fu-input"
              aria-describedby={state.errors?.confirmPassword ? 'reset-confirm-error' : undefined}
              aria-invalid={!!state.errors?.confirmPassword}
            />
            {state.errors?.confirmPassword && (
              <p id="reset-confirm-error" className="text-xs font-medium" style={{ color: 'var(--error)' }}>
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
            {pending ? 'Updating…' : 'Update Password →'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
