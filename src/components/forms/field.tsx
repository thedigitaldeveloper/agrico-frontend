import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * Shared control surface. Exported so the dashboard's selects can use it rather
 * than keeping a second copy that drifts.
 *
 * No `outline-none` here: in Tailwind v4 that emits `outline-style: none` from
 * the utilities layer, which beats the site-wide `:focus-visible` rule and
 * leaves every input on the site without a focus ring.
 */
export const CONTROL =
  'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 ' +
  'transition-colors border-ink-300 focus-visible:outline-offset-1 ' +
  'focus-visible:border-brand-600 aria-invalid:border-danger-500 aria-invalid:bg-danger-50';

interface FieldShellProps {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  invalid?: boolean;
  children: ReactNode;
}

function FieldShell({
  name,
  label,
  hint,
  error,
  required,
  invalid,
  children,
}: FieldShellProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-ink-800">
        {label}
        {required ? (
          <span className="ml-0.5 text-danger-500" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        // The error replaces the hint rather than stacking under it: two lines of
        // small text below a red box is where people stop reading either.
        <p id={`${name}-error`} className="mt-1.5 text-xs font-medium text-danger-700">
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${name}-hint`}
          className={cn('mt-1.5 text-xs', invalid ? 'text-danger-700' : 'text-ink-500')}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Points the control at whichever of the two descriptions is actually rendered. */
function describedBy(name: string, error?: string, hint?: string) {
  if (error) return `${name}-error`;
  if (hint) return `${name}-hint`;
  return undefined;
}

type InputProps = Omit<ComponentProps<'input'>, 'id' | 'name' | 'className'> & {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  invalid?: boolean;
};

export function TextField({
  name,
  label,
  hint,
  error,
  invalid,
  required,
  ...props
}: InputProps) {
  return (
    <FieldShell
      name={name}
      label={label}
      hint={hint}
      error={error}
      required={required}
      invalid={invalid}
    >
      <input
        id={name}
        name={name}
        required={required}
        aria-invalid={invalid || Boolean(error) || undefined}
        aria-describedby={describedBy(name, error, hint)}
        className={CONTROL}
        {...props}
      />
    </FieldShell>
  );
}

type TextAreaProps = Omit<ComponentProps<'textarea'>, 'id' | 'name' | 'className'> & {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  invalid?: boolean;
};

export function TextAreaField({
  name,
  label,
  hint,
  error,
  invalid,
  required,
  rows = 4,
  ...props
}: TextAreaProps) {
  return (
    <FieldShell
      name={name}
      label={label}
      hint={hint}
      error={error}
      required={required}
      invalid={invalid}
    >
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        aria-invalid={invalid || Boolean(error) || undefined}
        aria-describedby={describedBy(name, error, hint)}
        className={cn(CONTROL, 'resize-y')}
        {...props}
      />
    </FieldShell>
  );
}

type SelectProps = Omit<ComponentProps<'select'>, 'id' | 'name' | 'className' | 'children'> & {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  hint?: string;
  error?: string;
  invalid?: boolean;
  required?: boolean;
  defaultValue?: string;
  /** Rendered as a disabled first option, so "nothing chosen" cannot be submitted. */
  placeholder?: string;
};

export function SelectField({
  name,
  label,
  options,
  hint,
  error,
  invalid,
  required,
  defaultValue,
  placeholder,
  ...props
}: SelectProps) {
  return (
    <FieldShell
      name={name}
      label={label}
      hint={hint}
      error={error}
      required={required}
      invalid={invalid}
    >
      <div className="relative">
        <select
          id={name}
          name={name}
          required={required}
          defaultValue={defaultValue ?? (placeholder ? '' : undefined)}
          aria-invalid={invalid || Boolean(error) || undefined}
          aria-describedby={describedBy(name, error, hint)}
          // appearance-none drops the native arrow, which no browser lets us
          // recolour; pr-9 keeps the value clear of the one drawn below.
          className={cn(CONTROL, 'appearance-none pr-9')}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2 text-ink-500"
          aria-hidden="true"
        >
          <path d="m2 4.5 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </FieldShell>
  );
}

export function CheckboxField({
  name,
  label,
  error,
  invalid,
  required,
  defaultChecked,
}: {
  name: string;
  label: ReactNode;
  error?: string;
  invalid?: boolean;
  required?: boolean;
  /**
   * Must be passed for any checkbox that edits existing state. Rendering a
   * ticked setting as unticked means the next save silently turns it off.
   */
  defaultChecked?: boolean;
}) {
  const failed = invalid || Boolean(error);

  return (
    <div>
      <div className="flex items-start gap-2.5">
        <input
          id={name}
          name={name}
          type="checkbox"
          required={required}
          defaultChecked={defaultChecked}
          aria-invalid={failed || undefined}
          aria-describedby={describedBy(name, error)}
          className="mt-0.5 size-4 shrink-0 rounded border-ink-300 accent-brand-800 aria-invalid:border-danger-500"
        />
        <label
          htmlFor={name}
          className={cn('text-sm leading-relaxed', failed ? 'text-danger-700' : 'text-ink-600')}
        >
          {label}
        </label>
      </div>
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-xs font-medium text-danger-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Live region so screen readers announce the outcome of a submission. A failure
 * interrupts — it is the reason the submit did nothing — while a success is
 * polite, so it does not cut across whatever is being read at the time.
 */
export function FormMessage({
  status,
  message,
}: {
  status: 'idle' | 'success' | 'error';
  message: string;
}) {
  if (status === 'idle' || !message) return null;

  const success = status === 'success';

  return (
    <p
      role={success ? 'status' : 'alert'}
      aria-live={success ? 'polite' : undefined}
      className={cn(
        'rounded-lg px-4 py-3 text-sm font-medium',
        success ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'
      )}
    >
      {message}
    </p>
  );
}
