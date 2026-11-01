import { redirect } from 'next/navigation';

import { LogoutButton } from '@/components/auth/auth-forms';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { isAdminUser } from '@/lib/auth/admin';
import { logout } from '@/lib/auth/actions';
import { getMyMentorProfile, getMyStudentProfile } from '@/lib/auth/dashboard';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * The middleware only checks that a session cookie exists. This is where the
 * token is actually verified against the CMS — a deleted or blocked account
 * gets sent back to sign-in even though its cookie is still present.
 */
export default async function DashboardLayout({ children }: LayoutProps<'/dashboard'>) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/dashboard');

  const [mentor, student] = await Promise.all([getMyMentorProfile(), getMyStudentProfile()]);

  // Controls the nav link only. /dashboard/leads gates itself with
  // requireAdmin — hiding a link is presentation, not authorisation.
  const isAdmin = isAdminUser(user);

  const links = [
    { href: '/dashboard', label: 'Sessions' },
    { href: '/dashboard/profile', label: 'My profile' },
    ...(isAdmin ? [{ href: '/dashboard/leads', label: 'Student Leads & CAF (Admin)' }] : []),
    ...(mentor ? [{ href: '/dashboard/mentor', label: 'Mentor settings' }] : []),
  ];

  return (
    <div className="container-page py-8 lg:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900">
            {mentor ? mentor.display_name : (student?.full_name || user.username || 'Your dashboard')}
          </h1>
          <p className="mt-0.5 text-xs text-ink-500">{user.email}</p>
        </div>
        <LogoutButton action={logout} />
      </header>

      <nav aria-label="Dashboard" className="mt-6 border-b border-ink-200">
        <DashboardNav links={links} />
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}
