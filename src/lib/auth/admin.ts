import 'server-only';

import { redirect } from 'next/navigation';

import { ADMIN_EMAILS } from '@/lib/env';
import { getCurrentUser, type SessionUser } from './session';

/**
 * Who may see the admissions desk.
 *
 * This used to be `user.email.includes('admin') || user.email.endsWith(...)`,
 * which is not an authorisation check. Registration is open to anyone, so any
 * address containing the substring "admin" — sysadmin@, admin@gmail.com,
 * not-admin@anywhere — granted access to every lead the business has.
 *
 * Strapi has only the default `public` and `authenticated` roles here, so there
 * is no role to check yet. An explicit allowlist is the honest interim: exact
 * addresses, compared whole, listed in the server environment where the CMS
 * cannot be edited into granting someone access. When an Admin role does exist,
 * this is the one place that has to change.
 *
 * Unset means nobody is an admin. An authorisation check that opens up when its
 * configuration is missing is worse than one that locks everyone out.
 */
export function isAdminUser(user: Pick<SessionUser, 'email'> | null): boolean {
  if (!user?.email) return false;
  return ADMIN_EMAILS.has(user.email.trim().toLowerCase());
}

/**
 * The signed-in admin, or a redirect.
 *
 * Every admin page must call this itself. Gating in the dashboard layout only
 * hides the nav link — the route underneath stays reachable by typing the URL,
 * which is exactly how /dashboard/leads was serving the full lead list to any
 * account that asked for it.
 */
export async function requireAdmin(returnTo: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);

  // Signed in but not an admin: send them to their own dashboard rather than to
  // sign-in, which would loop them through a login they have already done.
  if (!isAdminUser(user)) redirect('/dashboard');

  return user;
}
