'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { collectionTag } from '@/lib/cms/tags';
import type { FormState } from '@/lib/form-state';
import { cmsFetchAsUser } from './session';

/**
 * Profile updates.
 *
 * As with bookings, the CMS is the authority: `/student-profiles/me` and
 * `/mentor-profiles/me` pick the record from the token, so nothing here can
 * address someone else's profile even if the form were tampered with.
 */

const value = (form: FormData, key: string): string =>
  (form.get(key) as string | null)?.trim() ?? '';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export async function saveStudentProfile(
  _previous: FormState,
  form: FormData
): Promise<FormState> {
  const targetYear = value(form, 'target_year');

  const result = await cmsFetchAsUser('/student-profiles/me', {
    method: 'PUT',
    body: JSON.stringify({
      data: {
        full_name: value(form, 'full_name'),
        phone: value(form, 'phone'),
        city: value(form, 'city'),
        state: value(form, 'state'),
        education_level: value(form, 'education_level'),
        target_year: targetYear ? Number(targetYear) : undefined,
        interested_streams: form.getAll('interested_streams').filter(Boolean),
      },
    }),
  });

  if (!result.ok) {
    return { status: 'error', message: 'Could not save your profile. Please try again.' };
  }

  revalidatePath('/dashboard/profile');
  return { status: 'success', message: 'Profile saved.' };
}

export async function saveMentorProfile(
  _previous: FormState,
  form: FormData
): Promise<FormState> {
  /**
   * Availability arrives as parallel arrays — one entry per row in the form.
   * Rows the mentor left blank are dropped rather than sent as empty windows.
   */
  const days = form.getAll('day_of_week').map(String);
  const starts = form.getAll('start_time').map(String);
  const ends = form.getAll('end_time').map(String);

  const availability = days
    .map((day, index) => ({
      day_of_week: day,
      start_time: starts[index] ?? '',
      end_time: ends[index] ?? '',
    }))
    .filter(
      (slot) =>
        DAYS.includes(slot.day_of_week) &&
        slot.start_time !== '' &&
        slot.end_time !== '' &&
        slot.start_time < slot.end_time
    );

  const experience = value(form, 'experience_years');
  const sessionMinutes = value(form, 'session_minutes');

  const result = await cmsFetchAsUser('/mentor-profiles/me', {
    method: 'PUT',
    body: JSON.stringify({
      data: {
        headline: value(form, 'headline'),
        bio: value(form, 'bio'),
        languages: value(form, 'languages'),
        experience_years: experience ? Number(experience) : undefined,
        session_minutes: sessionMinutes ? Number(sessionMinutes) : undefined,
        is_accepting_bookings: form.get('is_accepting_bookings') === 'on',
        availability,
      },
    }),
  });

  if (!result.ok) {
    return { status: 'error', message: 'Could not save your mentor profile.' };
  }

  revalidatePath('/dashboard/mentor');
  // The public directory and this mentor's page are cached, so they have to be
  // dropped too or the change would not show for up to a day.
  revalidateTag(collectionTag('mentor-profile'), 'max');

  return { status: 'success', message: 'Mentor profile saved.' };
}
