'use client';

import { useActionState, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

import {
  CheckboxField,
  CONTROL,
  FormMessage,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/forms/field';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { MentorOwnProfile, StudentProfile } from '@/lib/auth/dashboard';
import { saveMentorProfile, saveStudentProfile } from '@/lib/auth/profile-actions';
import type { TaxonomyTerm } from '@/lib/cms/repositories/taxonomy';
import { IDLE, type FormState } from '@/lib/form-state';

const EDUCATION_LEVELS = [
  { value: 'class-10', label: 'In class 10' },
  { value: 'class-12', label: 'In class 12' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'working', label: 'Working professional' },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

interface AvailabilityRow {
  id: number;
  day: string;
  start: string;
  end: string;
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save changes'}
    </Button>
  );
}

export function StudentProfileForm({
  profile,
  streams,
}: {
  profile: StudentProfile | null;
  streams: TaxonomyTerm[];
}) {
  const [state, formAction] = useActionState<FormState, FormData>(saveStudentProfile, IDLE);
  const selected = new Set(profile?.interested_streams.map((stream) => stream.slug) ?? []);

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage status={state.status} message={state.message} />

      <TextField
        name="full_name"
        label="Full name"
        defaultValue={profile?.full_name ?? ''}
        autoComplete="name"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="phone"
          label="Phone"
          type="tel"
          defaultValue=""
          autoComplete="tel"
          hint={
            profile?.has_phone
              ? 'A number is saved. Leave blank to keep it, or type a new one.'
              : 'Kept private; only advisors you book see it.'
          }
        />
        <TextField
          name="city"
          label="City"
          defaultValue={profile?.city ?? ''}
          autoComplete="address-level2"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          name="education_level"
          label="Where are you now?"
          options={EDUCATION_LEVELS}
          defaultValue={profile?.education_level ?? 'class-12'}
        />

        <TextField
          name="target_year"
          label="Target admission year"
          type="number"
          min={2020}
          max={2100}
          defaultValue={profile?.target_year ?? ''}
        />
      </div>

      {streams.length > 0 ? (
        <fieldset>
          <legend className="text-sm font-semibold text-ink-800">Interested streams</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {streams.map((stream) => (
              <label
                key={stream.documentId}
                className="inline-flex cursor-pointer items-center gap-2 rounded-pill border border-ink-300 px-3 py-1.5 text-sm text-ink-700 has-checked:border-brand-600 has-checked:bg-brand-50 has-checked:text-brand-800"
              >
                <input
                  type="checkbox"
                  name="interested_streams"
                  value={stream.slug}
                  defaultChecked={selected.has(stream.slug)}
                  className="size-3.5 accent-brand-800"
                />
                {stream.name}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <SaveButton />
    </form>
  );
}

export function MentorProfileForm({ profile }: { profile: MentorOwnProfile }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveMentorProfile, IDLE);

  // Rows are local state so a mentor can add or remove windows before saving;
  // the server rebuilds the list from the submitted arrays regardless.
  //
  // The id is what the row is keyed on. The three controls are uncontrolled, so
  // defaultValue applies on mount only — keyed by array index, removing the
  // first of three rows would leave the survivors showing the values of the
  // rows above them, and the mentor would save windows they never picked.
  const [rows, setRows] = useState<AvailabilityRow[]>(() =>
    profile.availability.length > 0
      ? profile.availability.map((slot, index) => ({
          id: index,
          day: slot.day_of_week ?? 'monday',
          start: (slot.start_time ?? '10:00').slice(0, 5),
          end: (slot.end_time ?? '17:00').slice(0, 5),
        }))
      : [{ id: 0, day: 'monday', start: '10:00', end: '17:00' }]
  );
  const nextRowId = useRef(rows.length);

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage status={state.status} message={state.message} />

      <TextField
        name="headline"
        label="Headline"
        defaultValue={profile.headline ?? ''}
        hint="One line students see first, e.g. what you specialise in."
      />

      <TextAreaField name="bio" label="About you" rows={5} defaultValue={profile.bio ?? ''} />

      <div className="grid gap-5 sm:grid-cols-3">
        <TextField
          name="experience_years"
          label="Years advising"
          type="number"
          min={0}
          max={60}
          defaultValue={profile.experience_years ?? ''}
        />
        <TextField
          name="session_minutes"
          label="Session length (min)"
          type="number"
          min={15}
          max={120}
          step={15}
          defaultValue={profile.session_minutes}
        />
        <TextField
          name="languages"
          label="Languages"
          defaultValue={profile.languages ?? ''}
          placeholder="English, Hindi"
        />
      </div>

      <CheckboxField
        name="is_accepting_bookings"
        label="I am currently accepting bookings"
        defaultChecked={profile.is_accepting_bookings}
      />

      <fieldset className="border-t border-ink-100 pt-5">
        <legend className="text-sm font-semibold text-ink-800">Weekly availability (IST)</legend>

        <div className="mt-3 space-y-3">
          {rows.map((row, index) => {
            // Every row carries the same three names, so the position is the
            // only thing that tells one apart from another out loud.
            const window = `window ${index + 1}`;

            return (
              <div key={row.id} className="flex flex-wrap items-center gap-2">
                <select
                  name="day_of_week"
                  defaultValue={row.day}
                  aria-label={`Day, ${window}`}
                  className={cn(CONTROL, 'w-36')}
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  name="start_time"
                  defaultValue={row.start}
                  aria-label={`Start time, ${window}`}
                  className={cn(CONTROL, 'w-32')}
                />
                <span className="text-sm text-ink-500">to</span>
                <input
                  type="time"
                  name="end_time"
                  defaultValue={row.end}
                  aria-label={`End time, ${window}`}
                  className={cn(CONTROL, 'w-32')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRows(rows.filter((other) => other.id !== row.id))}
                >
                  Remove<span className="sr-only"> {window}</span>
                </Button>
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() =>
            setRows([
              ...rows,
              { id: nextRowId.current++, day: 'monday', start: '10:00', end: '17:00' },
            ])
          }
        >
          Add a window
        </Button>
      </fieldset>

      <SaveButton />
    </form>
  );
}
