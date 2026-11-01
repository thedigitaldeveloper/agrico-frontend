'use server';

import { redirect } from 'next/navigation';

import { CMS_INTERNAL_URL } from '@/lib/env';
import type { FormState } from '@/lib/form-state';
import { clearSession, setSession } from './session';

/**
 * Authentication actions.
 *
 * Credentials go straight from the form to a server action to Strapi — they
 * never touch client JavaScript, and the resulting token is written to an
 * httpOnly cookie the browser cannot read.
 */

interface StrapiAuthResponse {
  jwt?: string;
  error?: { message?: string };
}

/**
 * Deliberately vague on failure. "No account with that email" tells an attacker
 * which addresses are registered; a single message for both cases does not.
 */
const BAD_CREDENTIALS = 'Those details did not match an account.';

const value = (form: FormData, key: string): string =>
  (form.get(key) as string | null)?.trim() ?? '';

/** Only relative paths, so a crafted ?next= cannot bounce the user off-site. */
function safeRedirect(target: string, fallback: string): string {
  if (!target.startsWith('/') || target.startsWith('//') || /[\\\r\n]/.test(target)) return fallback;
  return target;
}

export async function login(_previous: FormState, form: FormData): Promise<FormState> {
  const identifier = value(form, 'identifier');
  const password = typeof form.get('password') === 'string' ? String(form.get('password')) : '';

  if (!identifier || !password) {
    return { status: 'error', message: 'Enter your email and password.' };
  }

  let json: StrapiAuthResponse;
  try {
    const response = await fetch(`${CMS_INTERNAL_URL}/api/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
      cache: 'no-store',
    });
    json = (await response.json()) as StrapiAuthResponse;

    if (!response.ok || !json.jwt) {
      return { status: 'error', message: BAD_CREDENTIALS };
    }
  } catch {
    return { status: 'error', message: 'Sign-in is unavailable right now.' };
  }

  await setSession(json.jwt);
  redirect(safeRedirect(value(form, 'next'), '/dashboard'));
}

export async function register(_previous: FormState, form: FormData): Promise<FormState> {
  const email = value(form, 'email');
  const name = value(form, 'username') || value(form, 'name');
  const username = email;
  const phone = value(form, 'phone');
  const city = value(form, 'city');
  const stateVal = value(form, 'state');
  const course = value(form, 'course');
  const qualification = value(form, 'qualification');
  const password = typeof form.get('password') === 'string' ? String(form.get('password')) : '';

  const invalid: string[] = [];
  if (name.length < 2) invalid.push('name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) invalid.push('email');
  if (!/^[+]?\d[\d\s-]{7,18}$/.test(phone)) invalid.push('phone');
  if (password.length < 10 || password.length > 128) invalid.push('password');
  if (form.get('consent') !== 'on') invalid.push('consent');

  if (invalid.length > 0) {
    return {
      status: 'error',
      message: 'Please fill in all required fields accurately.',
      invalid,
    };
  }

  let json: StrapiAuthResponse;
  try {
    const response = await fetch(`${CMS_INTERNAL_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
      cache: 'no-store',
    });
    json = (await response.json()) as StrapiAuthResponse;

    if (!response.ok || !json.jwt) {
      const message = json.error?.message ?? '';
      return {
        status: 'error',
        message: /taken|already/i.test(message)
          ? 'An account with that email already exists. Please sign in.'
          : 'Could not create the account. Please try again.',
      };
    }

    // Save the name and private phone on the authenticated student's own profile.
    try {
      await fetch(CMS_INTERNAL_URL + '/api/student-profiles/me', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + json.jwt },
        body: JSON.stringify({ data: { full_name: name, phone } }), cache: 'no-store',
      });
    } catch { /* The signed-in student can complete the profile later. */ }
    // Contact consent is optional and separate from account registration.
    if (form.get('counselling_consent') === 'on') try {
      await fetch(`${CMS_INTERNAL_URL}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            name,
            email,
            phone,
            city: city || undefined,
            state: stateVal || undefined,
            source: 'counselling',
            message: `[STUDENT REGISTRATION] Interested Program: ${course || 'General Guidance'} | Highest Qualification: ${qualification || 'Not Specified'} | Location: ${city || 'India'}`,
            consent: true,
          },
        }),
        cache: 'no-store',
      });
    } catch {
      // Non-blocking lead log
    }
  } catch {
    return { status: 'error', message: 'Registration is unavailable right now.' };
  }

  await setSession(json.jwt);
  redirect(safeRedirect(value(form, 'next'), '/dashboard'));
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect('/');
}
