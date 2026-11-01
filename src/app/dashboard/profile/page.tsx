import type { Metadata } from 'next';

import { StudentProfileForm } from '@/components/dashboard/profile-forms';
import { getMyStudentProfile } from '@/lib/auth/dashboard';
import { listTaxonomy } from '@/lib/cms/repositories/taxonomy';

export const metadata: Metadata = {
  title: 'Your profile',
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const [profile, streams] = await Promise.all([
    getMyStudentProfile(),
    listTaxonomy('streams', 20),
  ]);

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-ink-900">Your profile</h2>
      <p className="mt-2 text-sm text-ink-600">
        The more an advisor knows before a session, the less of it is spent on basics.
      </p>
      <div className="mt-6 rounded-card border border-ink-200 bg-white p-6">
        <StudentProfileForm profile={profile} streams={streams} />
      </div>
    </div>
  );
}
