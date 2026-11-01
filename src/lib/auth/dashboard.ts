import 'server-only';

import { cmsFetchAsUser } from './session';

/**
 * Reads for the signed-in user's dashboard.
 *
 * All of these go through cmsFetchAsUser, which sends the user's own token and
 * never caches — the CMS decides what each user may see, and per-user data must
 * not land in a shared cache.
 */

export interface BookingMentor {
  documentId: string;
  display_name: string;
  slug: string;
  session_minutes: number;
  photo: { url: string; alternativeText: string | null } | null;
}

export interface Booking {
  documentId: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  topic: string | null;
  notes: string | null;
  cancellation_reason: string | null;
  mentor: BookingMentor | null;
  /** Curated by the CMS: a display name only, never an email. */
  student: { name: string } | null;
}

export interface StudentProfile {
  documentId: string;
  full_name: string | null;
  city: string | null;
  state: string | null;
  education_level: string | null;
  /** Whether a number is stored. The number itself is private and never sent. */
  has_phone: boolean;
  target_year: number | null;
  interested_streams: { documentId: string; name: string; slug: string }[];
  shortlisted_universities: { documentId: string; name: string; slug: string }[];
}

export interface MentorOwnProfile {
  documentId: string;
  display_name: string;
  slug: string;
  headline: string | null;
  bio: string | null;
  languages: string | null;
  experience_years: number | null;
  session_minutes: number;
  is_accepting_bookings: boolean;
  availability: {
    id: number;
    day_of_week: string | null;
    start_time: string | null;
    end_time: string | null;
  }[];
}

export async function getMyBookings(): Promise<Booking[]> {
  const result = await cmsFetchAsUser<{ data: Booking[] }>('/session-bookings');
  return result.ok ? (result.data?.data ?? []) : [];
}

export async function getMyStudentProfile(): Promise<StudentProfile | null> {
  const result = await cmsFetchAsUser<{ data: StudentProfile | null }>('/student-profiles/me');
  return result.ok ? (result.data?.data ?? null) : null;
}

/**
 * The caller's mentor profile, or null if they are not a mentor.
 *
 * Owning a published mentor profile is what makes someone a mentor — there is
 * no separate role flag to fall out of sync with it.
 */
export async function getMyMentorProfile(): Promise<MentorOwnProfile | null> {
  const result = await cmsFetchAsUser<{ data: MentorOwnProfile | null }>('/mentor-profiles/me');
  return result.ok ? (result.data?.data ?? null) : null;
}

/** Splits bookings into what still needs attention and what is history. */
export function partitionBookings(bookings: Booking[], now = new Date()) {
  const upcoming: Booking[] = [];
  const past: Booking[] = [];

  for (const booking of bookings) {
    const at = new Date(booking.scheduled_at);
    const isOver =
      booking.status === 'cancelled' ||
      booking.status === 'completed' ||
      at.getTime() < now.getTime();
    (isOver ? past : upcoming).push(booking);
  }

  past.reverse();
  return { upcoming, past };
}
