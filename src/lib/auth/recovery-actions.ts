'use server';

import { CMS_INTERNAL_URL } from '@/lib/env';
import type { FormState } from '@/lib/form-state';
import { isPasswordResetCode } from './recovery';
import { clearSession } from './session';

const RESET_REQUESTED = 'If an account uses that email address, you will receive a password reset link. Check your inbox and spam folder.';
const INVALID_LINK = 'This reset link is invalid or has already been used. Request a new link below.';

export async function requestPasswordReset(_previous: FormState, form: FormData): Promise<FormState> {
  const email = typeof form.get('email') === 'string' ? String(form.get('email')).trim() : '';
  if (email.length > 180 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { status: 'error', message: 'Enter a valid email address.', invalid: ['email'] };
  }

  try {
    const response = await fetch(`${CMS_INTERNAL_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });
    if (response.status === 429) {
      return { status: 'error', message: 'Too many reset requests. Please wait a few minutes and try again.' };
    }
    // SMTP failure for an existing account must not reveal whether it exists.
    // Delivery/provider errors remain visible in the CMS server logs.
    return { status: 'success', message: RESET_REQUESTED };
  } catch {
    return { status: 'error', message: 'Password recovery is unavailable right now. Please try again shortly.' };
  }
}

export async function resetPassword(code: string, _previous: FormState, form: FormData): Promise<FormState> {
  if (!isPasswordResetCode(code)) return { status: 'error', message: INVALID_LINK };
  const password = typeof form.get('password') === 'string' ? String(form.get('password')) : '';
  const confirmation = typeof form.get('passwordConfirmation') === 'string' ? String(form.get('passwordConfirmation')) : '';
  if (password.length < 10 || password.length > 128) {
    return { status: 'error', message: 'Use a password with 10–128 characters.', invalid: ['password'] };
  }
  if (password !== confirmation) {
    return { status: 'error', message: 'The passwords do not match.', invalid: ['passwordConfirmation'] };
  }

  try {
    const response = await fetch(`${CMS_INTERNAL_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, password, passwordConfirmation: confirmation }),
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });
    if (response.status === 429) {
      return { status: 'error', message: 'Too many attempts. Please wait a few minutes and try again.' };
    }
    if (!response.ok) {
      return { status: 'error', message: response.status >= 500
        ? 'Password recovery is unavailable right now. Please try again shortly.'
        : INVALID_LINK };
    }
  } catch {
    return { status: 'error', message: 'Password recovery is unavailable right now. Please try again shortly.' };
  }

  // Strapi consumes the token. Do not expose its returned JWT or sign in implicitly.
  await clearSession();
  return { status: 'success', message: 'Your password has been updated. Sign in with your new password.' };
}
