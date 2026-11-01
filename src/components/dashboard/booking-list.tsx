'use client';

import type { ReactNode } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { changeBookingStatus } from '@/lib/auth/booking-actions';
import type { Booking } from '@/lib/auth/dashboard';
import { IDLE, type FormState } from '@/lib/form-state';

// A cancelled session and a completed one are opposite outcomes; sharing the
// grey chip made the list unreadable at a glance.
const STATUS_TONE = {
  requested: 'warning',
  confirmed: 'success',
  completed: 'neutral',
  cancelled: 'danger',
} as const;

/** The CMS enum is lowercase; everything else on the site is title case. */
const STATUS_LABEL = {
  requested: 'Requested',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

type ActionVariant = 'primary' | 'danger-outline';

function formatWhen(iso: string): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return 'Unknown time';
  return at.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
}

function ActionButton({ label, variant }: { label: string; variant: ActionVariant }) {
  const { pending } = useFormStatus();

  return (
    // The label stays put while pending: swapping it for an ellipsis shrinks the
    // button mid-row and leaves a screen reader announcing "…".
    <Button type="submit" size="sm" variant={variant} disabled={pending} aria-busy={pending}>
      {label}
      {pending ? <Spinner /> : null}
    </Button>
  );
}

function StatusAction({
  documentId,
  status,
  label,
  variant,
  mentorSlug,
}: {
  documentId: string;
  status: string;
  label: string;
  variant: ActionVariant;
  mentorSlug: string | null;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(changeBookingStatus, IDLE);

  return (
    <form action={formAction} className="contents">
      <input type="hidden" name="documentId" value={documentId} />
      <input type="hidden" name="status" value={status} />
      {/* Lets the action free this mentor's slot in the booking picker. */}
      {mentorSlug ? <input type="hidden" name="mentorSlug" value={mentorSlug} /> : null}
      <ActionButton label={label} variant={variant} />
      {state.status === 'error' ? (
        <span role="alert" className="w-full text-xs text-danger-700">
          {state.message}
        </span>
      ) : null}
      {state.status === 'success' ? (
        <span role="status" className="w-full text-xs text-success-700">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}

/**
 * Which actions to offer depends on the viewer's side of the booking. The CMS
 * enforces the same rules — this only decides what to render, so a stale page
 * cannot be used to force a transition.
 */
function actionsFor(booking: Booking, viewer: 'student' | 'mentor') {
  if (viewer === 'mentor') {
    if (booking.status === 'requested') {
      return [
        { status: 'confirmed', label: 'Confirm', variant: 'primary' as const },
        { status: 'cancelled', label: 'Decline', variant: 'danger-outline' as const },
      ];
    }
    if (booking.status === 'confirmed') {
      return [
        { status: 'completed', label: 'Mark complete', variant: 'primary' as const },
        { status: 'cancelled', label: 'Cancel', variant: 'danger-outline' as const },
      ];
    }
    return [];
  }

  return booking.status === 'requested' || booking.status === 'confirmed'
    ? [{ status: 'cancelled', label: 'Cancel', variant: 'danger-outline' as const }]
    : [];
}

export function BookingList({
  bookings,
  viewer,
  emptyMessage,
  emptyAction,
}: {
  bookings: Booking[];
  viewer: 'student' | 'mentor';
  emptyMessage: string;
  /** The way out of an empty list — otherwise its only call to action is elsewhere. */
  emptyAction?: ReactNode;
}) {
  if (bookings.length === 0) {
    return <EmptyState tone="dashed" title={emptyMessage} action={emptyAction} />;
  }

  return (
    <ul className="space-y-4">
      {bookings.map((booking) => {
        const actions = actionsFor(booking, viewer);
        const counterpart =
          viewer === 'mentor'
            ? (booking.student?.name ?? 'A student')
            : (booking.mentor?.display_name ?? 'Mentor');

        return (
          <li
            key={booking.documentId}
            className="rounded-card border border-ink-200 bg-white p-5 shadow-card"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display font-bold text-ink-900">{counterpart}</p>
                <p className="mt-1 text-sm text-ink-600">
                  {formatWhen(booking.scheduled_at)} · {booking.duration_minutes} min
                </p>
              </div>
              <Badge tone={STATUS_TONE[booking.status]}>{STATUS_LABEL[booking.status]}</Badge>
            </div>

            {booking.topic ? (
              <p className="mt-3 text-sm text-ink-700">
                <span className="text-ink-500">Topic: </span>
                {booking.topic}
              </p>
            ) : null}

            {booking.status === 'cancelled' && booking.cancellation_reason ? (
              <p className="mt-2 text-sm text-ink-500">
                Reason: {booking.cancellation_reason}
              </p>
            ) : null}

            {actions.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
                {actions.map((action) => (
                  <StatusAction
                    key={action.status}
                    documentId={booking.documentId}
                    status={action.status}
                    label={action.label}
                    variant={action.variant}
                    mentorSlug={booking.mentor?.slug ?? null}
                  />
                ))}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-3.5 animate-spin"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" className="opacity-30" />
      <path d="M14 8a6 6 0 0 0-6-6" strokeLinecap="round" />
    </svg>
  );
}
