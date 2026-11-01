import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { MentorProfileForm } from '@/components/dashboard/profile-forms';
import { getMyMentorProfile } from '@/lib/auth/dashboard';

export const metadata: Metadata = {
  title: 'Mentor settings',
  robots: { index: false, follow: false },
};

export default async function MentorSettingsPage() {
  const mentor = await getMyMentorProfile();
  // Not a mentor: there is nothing here, and the tab is not shown either.
  if (!mentor) redirect('/dashboard');

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-ink-900">Mentor settings</h2>
      <p className="mt-2 text-sm text-ink-600">
        Your public profile and the hours students can book. Times are IST.
      </p>
      <div className="mt-6 rounded-card border border-ink-200 bg-white p-6">
        <MentorProfileForm profile={mentor} />
      </div>
    </div>
  );
}
