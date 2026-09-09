'use server';

/**
 * Authentication Server Actions.
 *
 * All three actions run exclusively on the server — no secrets reach the
 * client bundle.  Passwords are handled entirely by Supabase Auth; we never
 * see, store, or hash them ourselves.
 *
 * Form state shape is compatible with React's `useActionState` hook.
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// ── Shared form-state type ────────────────────────────────────────────────────

export interface AuthFormState {
  /** Field-level validation errors. */
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  /** Top-level message (success or provider-level error). */
  message?: string;
}

// ── Validation helpers (server-side only) ─────────────────────────────────────

function validateEmail(email: string): string[] {
  const errs: string[] = [];
  if (!email.trim()) errs.push('Email is required.');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errs.push('Please enter a valid email address.');
  return errs;
}

function validatePassword(password: string): string[] {
  const errs: string[] = [];
  if (!password) errs.push('Password is required.');
  else if (password.length < 8) errs.push('Password must be at least 8 characters.');
  return errs;
}

function validateName(name: string): string[] {
  const errs: string[] = [];
  if (!name.trim()) errs.push('Name is required.');
  else if (name.trim().length < 2) errs.push('Name must be at least 2 characters.');
  return errs;
}

// ── signupAction ──────────────────────────────────────────────────────────────

export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get('name') ?? '');
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  // Field validation
  const errors: AuthFormState['errors'] = {};
  const nameErrs = validateName(name);
  const emailErrs = validateEmail(email);
  const passwordErrs = validatePassword(password);
  const confirmErrs: string[] = [];

  if (nameErrs.length) errors.name = nameErrs;
  if (emailErrs.length) errors.email = emailErrs;
  if (passwordErrs.length) errors.password = passwordErrs;
  if (password && confirmPassword && password !== confirmPassword)
    confirmErrs.push('Passwords do not match.');
  if (confirmErrs.length) errors.confirmPassword = confirmErrs;

  if (Object.keys(errors).length > 0) return { errors };

  // Call Supabase Auth
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name.trim() },
    },
  });

  if (error) {
    // Never surface raw Supabase error details to the client
    const isEmailTaken =
      error.message?.toLowerCase().includes('already registered') ||
      error.message?.toLowerCase().includes('user already exists') ||
      error.code === 'user_already_exists';

    return {
      message: isEmailTaken
        ? 'An account with this email already exists. Please log in instead.'
        : 'Registration failed. Please try again.',
    };
  }

  // Supabase may require email confirmation depending on project settings.
  // Redirect to login with a confirmation message.
  redirect('/login?registered=1');
}

// ── loginAction ───────────────────────────────────────────────────────────────

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  // Field validation
  const errors: AuthFormState['errors'] = {};
  const emailErrs = validateEmail(email);
  const passwordErrs = validatePassword(password);

  if (emailErrs.length) errors.email = emailErrs;
  if (passwordErrs.length) errors.password = passwordErrs;
  if (Object.keys(errors).length > 0) return { errors };

  // Call Supabase Auth
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Use a generic message — never confirm whether the email exists
    return {
      message: 'Invalid email or password. Please check your credentials and try again.',
    };
  }

  redirect('/dashboard');
}

// ── logoutAction ──────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

// ── forgotPasswordAction ──────────────────────────────────────────────────────

/**
 * Sends a Supabase password-reset email.
 *
 * `redirectTo` points to /auth/callback so the PKCE code in the email link
 * is exchanged for a session there before the user is forwarded to
 * /reset-password.
 *
 * We deliberately return the same success state whether or not the email
 * exists — this prevents user-enumeration attacks.
 */
export async function forgotPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '');

  const emailErrs = validateEmail(email);
  if (emailErrs.length) return { errors: { email: emailErrs } };

  // Derive the absolute site origin for the redirectTo URL.
  // NEXT_PUBLIC_SITE_URL takes priority (set this in Vercel for custom domains).
  // Falls back to VERCEL_URL (auto-set by Vercel for preview/production deployments).
  // Falls back to localhost for local development.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000');

  const redirectTo = `${siteUrl}/auth/callback?next=/reset-password`;

  const supabase = await createClient();
  // Intentionally ignore the error — same response whether email exists or not
  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  // Redirect back to the forgot-password page with a ?sent=1 flag so the
  // form can show a confirmation message without exposing server state.
  redirect('/forgot-password?sent=1');
}

// ── resetPasswordAction ───────────────────────────────────────────────────────

/**
 * Updates the authenticated user's password.
 *
 * This action is only reachable after the user has arrived via the Supabase
 * recovery email link and exchanged the PKCE code for a session at
 * /auth/callback. If there is no active session, Supabase returns an error.
 */
export async function resetPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  const errors: AuthFormState['errors'] = {};
  const passwordErrs = validatePassword(password);
  const confirmErrs: string[] = [];

  if (passwordErrs.length) errors.password = passwordErrs;
  if (password && confirmPassword && password !== confirmPassword)
    confirmErrs.push('Passwords do not match.');
  if (confirmErrs.length) errors.confirmPassword = confirmErrs;

  if (Object.keys(errors).length > 0) return { errors };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      message: 'Failed to update your password. The reset link may have expired. Please request a new one.',
    };
  }

  // Sign out after the password is changed so the recovery session is cleared,
  // then redirect to /login with a success banner.
  await supabase.auth.signOut();
  redirect('/login?reset=1');
}
