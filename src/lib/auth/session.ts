import 'server-only';

import { cookies } from 'next/headers';

import { CMS_INTERNAL_URL, IS_PRODUCTION } from '@/lib/env';

/**
 * Session handling.
 *
 * The Strapi JWT lives in an httpOnly cookie, never in localStorage: a token
 * readable from JavaScript is a token any XSS on the page can exfiltrate. That
 * also means only server code ever holds it, so every authenticated read
 * happens on the server.
 */

const COOKIE = 'agrico_session';

/** Matches Strapi's default JWT lifetime. */
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export interface SessionUser {
  id: number;
  documentId: string;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
}

export async function setSession(jwt: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, jwt, {
    httpOnly: true,
    // Lax rather than Strict so a link from an email still arrives signed in;
    // server actions are separately protected by Next's Origin check.
    sameSite: 'lax',
    secure: IS_PRODUCTION,
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE)?.value ?? null;
}

/**
 * The signed-in user, or null.
 *
 * Always verified against the CMS rather than decoded from the token: a user
 * who has been blocked or deleted since signing in must stop being a user
 * immediately, and a JWT keeps asserting otherwise until it expires.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${CMS_INTERNAL_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const user = (await response.json()) as SessionUser;
    return user.blocked ? null : user;
  } catch {
    return null;
  }
}

/** Fetches from the CMS as the signed-in user. */
export async function cmsFetchAsUser<T>(
  path: string,
  init: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const token = await getToken();
  if (!token) return { ok: false, status: 401, data: null };

  try {
    const response = await fetch(`${CMS_INTERNAL_URL}/api${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
      // Per-user data must never enter a shared cache.
      cache: 'no-store',
    });

    const data = response.status === 204 ? null : ((await response.json()) as T);
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 502, data: null };
  }
}
