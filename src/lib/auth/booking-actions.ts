'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

import { entryTag } from '@/lib/cms/tags';
import type { FormState } from '@/lib/form-state';
import { cmsFetchAsUser } from './session';

/**
 * Booking actions.
 *
 * Each forwards to the CMS as the signed-in user, so the ownership and slot
 * rules in the CMS controller apply. Nothing here is a security boundary — it
 * is the presentation layer for the checks that live in
 * src/api/session-booking on the CMS side.
 */

interface CmsError {
  error?: { message?: string };
}

const value = (form: FormData, key: string): string =>
  (form.get(key) as string | null)?.trim() ?? '';

function messageFrom(data: unknown, fallback: string): string {
  const message = (data as CmsError | null)?.error?.message;
  return message && message.length < 200 ? message : fallback;
}

export async function bookSession(
  _previous: FormState,
  form: FormData
): Promise<FormState> {
  const mentor = value(form, 'mentor');
  const scheduledAt = value(form, 'scheduled_at');

  if (!mentor || !scheduledAt) {
    return { status: 'error', message: 'Pick a time slot to continue.' };
  }

  const result = await cmsFetchAsUser('/session-bookings', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        mentor,
        scheduled_at: scheduledAt,
        topic: value(form, 'topic') || undefined,
        notes: value(form, 'notes') || undefined,
      },
    }),
  });

  if (result.status === 401) {
    // The mentor page is static and does not know who is looking at it, so an
    // unauthenticated booking is resolved here — sending the visitor to sign in
    // and straight back to the mentor they were about to book.
    redirect(`/login?next=${encodeURIComponent(`/mentors/${mentor}`)}`);
  }
  if (!result.ok) {
    return {
      status: 'error',
      message: messageFrom(result.data, 'Could not book that slot. Please try another.'),
    };
  }

  revalidatePath('/dashboard');
  // The slot this booking just took has to disappear from the mentor's picker,
  // or the next student picks it and is refused at submit.
  revalidateTag(entryTag('mentor-profile', mentor), 'max');

  return {
    status: 'success',
    message: 'Requested. The mentor will confirm shortly and you will see it on your dashboard.',
  };
}

export async function changeBookingStatus(
  _previous: FormState,
  form: FormData
): Promise<FormState> {
  const documentId = value(form, 'documentId');
  const status = value(form, 'status');

  if (!documentId || !status) {
    return { status: 'error', message: 'Missing session details.' };
  }

  const result = await cmsFetchAsUser(`/session-bookings/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({
      data: {
        status,
        cancellation_reason: value(form, 'cancellation_reason') || undefined,
      },
    }),
  });

  if (!result.ok) {
    return {
      status: 'error',
      message: messageFrom(result.data, 'Could not update that session.'),
    };
  }

  revalidatePath('/dashboard');
  // A cancellation frees the slot again, so the picker has to be re-read too.
  const mentorSlug = value(form, 'mentorSlug');
  if (mentorSlug) revalidateTag(entryTag('mentor-profile', mentorSlug), 'max');

  const past = { confirmed: 'confirmed', cancelled: 'cancelled', completed: 'marked complete' };
  return {
    status: 'success',
    message: `Session ${past[status as keyof typeof past] ?? 'updated'}.`,
  };
}
