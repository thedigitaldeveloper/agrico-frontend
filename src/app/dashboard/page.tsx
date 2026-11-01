import type { Metadata } from 'next';

import { BookingList } from '@/components/dashboard/booking-list';
import { ButtonLink } from '@/components/ui/button';
import {
  getMyBookings,
  getMyMentorProfile,
  partitionBookings,
} from '@/lib/auth/dashboard';

export const metadata: Metadata = {
  title: 'Your sessions',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const [bookings, mentor] = await Promise.all([getMyBookings(), getMyMentorProfile()]);
  const { upcoming, past } = partitionBookings(bookings);
  const viewer = mentor ? 'mentor' : 'student';

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-ink-900">Upcoming sessions</h2>
          {viewer === 'student' ? (
            <ButtonLink href="/mentors" size="sm">
              Book a session
            </ButtonLink>
          ) : null}
        </div>
        <div className="mt-4">
          <BookingList
            bookings={upcoming}
            viewer={viewer}
            emptyMessage={
              viewer === 'mentor'
                ? 'No upcoming sessions. Students will appear here when they book.'
                : 'Nothing booked yet. Pick a mentor and grab a slot.'
            }
            emptyAction={
              viewer === 'student' ? (
                <ButtonLink href="/mentors">Browse mentors</ButtonLink>
              ) : null
            }
          />
        </div>
      </section>

      {past.length > 0 ? (
        <section>
          <h2 className="text-xl font-bold text-ink-900">Past &amp; cancelled</h2>
          <div className="mt-4">
            <BookingList
              bookings={past}
              viewer={viewer}
              emptyMessage="Nothing here yet."
            />
          </div>
        </section>
      ) : null}

      {viewer === 'student' ? (
        <section className="surface-inverse rounded-card bg-brand-900 px-6 py-8 text-white">
          <h2 className="font-display text-xl font-bold text-white">Not sure who to talk to?</h2>
          <p className="mt-2 text-sm text-white/75">
            Browse advisors by stream, or ask the community first.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/mentors" variant="accent" size="sm">
              Browse mentors
            </ButtonLink>
            <ButtonLink href="/blogs" variant="inverse" size="sm">
              Read our blogs
            </ButtonLink>
          </div>
        </section>
      ) : null}
    </div>
  );
}
