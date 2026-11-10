'use client';

import { useActionState, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Calendar,
  Clock,
  Video,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

import { FormMessage, TextAreaField, TextField } from '@/components/forms/field';
import { FormSuccess } from '@/components/forms/form-success';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { bookSession } from '@/lib/auth/booking-actions';
import type { BookableSlot } from '@/lib/cms/repositories/mentor';
import { IDLE, type FormState } from '@/lib/form-state';
import { cn } from '@/lib/cn';

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="accent"
      size="lg"
      disabled={pending || disabled}
      className="w-full rounded-xl font-bold py-3.5 shadow-md transition-all duration-200"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <svg className="size-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Confirming Session…
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <span>Confirm Free 1-on-1 Session</span>
          <ArrowRight className="size-4" />
        </span>
      )}
    </Button>
  );
}

export function BookingForm({
  mentorSlug,
  mentorName,
  sessionMinutes,
  slots,
}: {
  mentorSlug: string;
  mentorName: string;
  sessionMinutes: number;
  slots: BookableSlot[];
}) {
  const [state, formAction] = useActionState<FormState, FormData>(bookSession, IDLE);
  const [selected, setSelected] = useState<string | null>(null);

  // Group slots by day
  const byDay = useMemo(() => {
    const groups = new Map<string, BookableSlot[]>();
    for (const slot of slots) {
      const existing = groups.get(slot.dayLabel);
      if (existing) existing.push(slot);
      else groups.set(slot.dayLabel, [slot]);
    }
    return [...groups.entries()].slice(0, 7);
  }, [slots]);

  const [activeDayIndex, setActiveDayIndex] = useState(0);

  if (state.status === 'success') {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-8 text-center shadow-lg animate-fade-in">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-ink-950">
          Counselling Session Requested!
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-ink-600 sm:text-sm">
          {state.message} You will receive an instant Google Meet confirmation invite with {mentorName}.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <ButtonLink href="/dashboard" variant="accent" size="md" className="rounded-xl font-bold">
            View My Booked Sessions
          </ButtonLink>
          <ButtonLink href="/compare" variant="outline" size="md" className="rounded-xl">
            Compare Online Universities Meanwhile
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-card">
        <EmptyState
          tone="dashed"
          title={`${mentorName} has no open slots this week`}
          description="All slots are currently booked. Browse other certified mentors or fill the application form."
          action={
            <ButtonLink href="/mentors" variant="outline">
              Browse Other Advisors
            </ButtonLink>
          }
          secondaryAction={
            <ButtonLink href="/common-application-form">
              Direct Application Form
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const activeDay = byDay[activeDayIndex] || byDay[0];

  return (
    <div className="rounded-3xl border border-brand-200 bg-white p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-100 pb-4 mb-4">
        <div>
          <span className="inline-flex items-center gap-1 text-3xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <Sparkles className="size-3" />
            100% Free · 0 University Bias
          </span>
          <h2 className="mt-1.5 font-display text-base sm:text-lg font-bold text-ink-950">
            Book 1-on-1 Consultation
          </h2>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-xl">
          <Clock className="size-3.5 text-brand-700" />
          <span>{sessionMinutes} Mins</span>
        </div>
      </div>

      <form action={formAction} className="space-y-5" noValidate>
        <input type="hidden" name="mentor" value={mentorSlug} />
        <input type="hidden" name="scheduled_at" value={selected ?? ''} />

        {/* Mode Indicator */}
        <div className="flex items-center gap-2 rounded-xl bg-ink-50 p-2.5 text-2xs text-ink-700 border border-ink-200/60">
          <Video className="size-3.5 text-brand-700 shrink-0" />
          <span>Mode: <strong>1-on-1 Google Meet Video / Phone Call</strong></span>
        </div>

        {/* Day Selector Tabs */}
        <div>
          <label className="text-xs font-bold text-ink-900 block mb-2">
            1. Select Preferred Day (IST)
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {byDay.map(([day], idx) => {
              const isActive = activeDayIndex === idx;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDayIndex(idx)}
                  className={cn(
                    'shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-brand-800 text-white shadow-sm font-bold'
                      : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots for Selected Day */}
        {activeDay ? (
          <div>
            <label className="text-xs font-bold text-ink-900 block mb-2">
              2. Select Available Time Slot
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {activeDay[1].map((slot) => {
                const isSelected = selected === slot.iso;
                return (
                  <button
                    key={slot.iso}
                    type="button"
                    onClick={() => setSelected(slot.iso)}
                    aria-pressed={isSelected}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-150 text-center flex items-center justify-center gap-1.5',
                      isSelected
                        ? 'border-brand-700 bg-brand-700 text-white shadow-sm font-bold ring-2 ring-brand-700/20'
                        : 'border-ink-200 bg-white text-ink-800 hover:border-brand-300 hover:bg-brand-50/50'
                    )}
                  >
                    <Clock className={cn('size-3', isSelected ? 'text-white' : 'text-brand-700')} />
                    <span>{slot.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Form Inputs */}
        <div className="space-y-4 border-t border-ink-150 pt-4">
          <FormMessage status={state.status} message={state.message} />

          <TextField
            name="topic"
            label="What would you like guidance on?"
            placeholder="e.g. Comparing TNAU vs PAU B.Sc. Agriculture or ICAR Accreditation"
            required
          />

          <TextAreaField
            name="notes"
            label="Your Academic Background / Goals (Optional)"
            rows={3}
            placeholder="Mention your graduation marks, current work profile, budget, or preferred universities..."
          />

          <SubmitButton disabled={!selected} />

          {!selected ? (
            <p className="text-center text-2xs text-ink-500 font-medium">
              👉 Please select an available date and time slot above to proceed.
            </p>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-3xs text-emerald-800 font-semibold bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200/60">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              <span>Free Consultation · No hidden admission fees</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
