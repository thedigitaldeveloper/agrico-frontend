'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

import { FormMessage } from '@/components/forms/field';
import { Button } from '@/components/ui/button';
import { submitEnquiry } from '@/lib/actions';
import { IDLE, type FormState } from '@/lib/form-state';
import { cn } from '@/lib/cn';

type Source = 'application-form' | 'counselling' | 'brochure' | 'contact' | 'sidebar';

interface EnquiryFormProps {
  /** Where the form sits, so leads can be attributed in the CMS. */
  source?: Source;
  /** Prefilled context, carried through as hidden fields. */
  universitySlug?: string;
  programSlug?: string;
  submitLabel?: string;
  compact?: boolean;
}

const SUCCESS_TITLE: Record<Source, string> = {
  'application-form': 'Admission Application Received!',
  counselling: 'Counselling Request Confirmed!',
  brochure: 'Brochure Request Confirmed!',
  contact: 'Message Received Successfully!',
  sidebar: 'Enquiry Received!',
};

export function EnquiryForm({
  source = 'application-form',
  universitySlug,
  programSlug,
  submitLabel = 'Submit Application',
  compact = false,
}: EnquiryFormProps) {
  const [state, formAction] = useActionState<FormState, FormData>(submitEnquiry, IDLE);
  const invalid = (field: string) => state.invalid?.includes(field);

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6 text-center animate-fade-in">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner">
          <CheckCircle2 className="size-6" />
        </div>
        <h3 className="mt-3 font-display text-base sm:text-lg font-bold text-ink-950">
          {SUCCESS_TITLE[source]}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-600 max-w-sm mx-auto">
          {state.message}
        </p>

<div className="mt-5 flex items-center justify-center gap-2.5">
          <Link
            href="/universities"
            className="inline-flex items-center gap-1 rounded-xl bg-brand-800 px-4 py-2 text-xs font-bold text-white shadow hover:bg-brand-900 transition-colors"
          >
            <span>Explore Universities</span>
            <ArrowRight className="size-3" />
          </Link>
          <Link
            href="/compare"
            className="inline-flex items-center rounded-xl border border-ink-300 bg-white px-4 py-2 text-xs font-bold text-ink-700 hover:bg-ink-50 transition-colors"
          >
            <span>Compare</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3.5" noValidate>
      <input type="hidden" name="source" value={source} />
      {universitySlug ? <input type="hidden" name="university" value={universitySlug} /> : null}
      {programSlug ? <input type="hidden" name="program" value={programSlug} /> : null}

      <FormMessage status={state.status} message={state.message} />

      <div className="grid gap-3.5 sm:grid-cols-2">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="enquiry-name" className="flex items-center gap-0.5 text-xs font-semibold text-ink-800">
            <span>Full Name</span>
            <span className="text-danger-500 font-bold">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
              <User className="size-4" />
            </div>
            <input
              id="enquiry-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="e.g. Vikram Verma"
              aria-invalid={invalid('name')}
              className={cn(
                'w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-sm text-ink-900 placeholder:text-ink-400 shadow-2xs transition-all',
                'focus:border-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-800/15',
                invalid('name') ? 'border-danger-500 bg-danger-50/50' : 'border-ink-250 hover:border-ink-300'
              )}
            />
          </div>
          {invalid('name') ? (
            <p className="text-xs font-medium text-danger-600">Enter your full name.</p>
          ) : null}
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label htmlFor="enquiry-phone" className="flex items-center gap-0.5 text-xs font-semibold text-ink-800">
            <span>Mobile Number</span>
            <span className="text-danger-500 font-bold">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
              <Phone className="size-4" />
            </div>
            <input
              id="enquiry-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              placeholder="98765 43210"
              aria-invalid={invalid('phone')}
              className={cn(
                'w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-sm text-ink-900 placeholder:text-ink-400 shadow-2xs transition-all',
                'focus:border-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-800/15',
                invalid('phone') ? 'border-danger-500 bg-danger-50/50' : 'border-ink-250 hover:border-ink-300'
              )}
            />
          </div>
          {invalid('phone') ? (
            <p className="text-xs font-medium text-danger-600">Enter a 10-digit mobile number.</p>
          ) : null}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label htmlFor="enquiry-email" className="flex items-center gap-0.5 text-xs font-semibold text-ink-800">
            <span>Email Address</span>
            <span className="text-danger-500 font-bold">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
              <Mail className="size-4" />
            </div>
            <input
              id="enquiry-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              aria-invalid={invalid('email')}
              className={cn(
                'w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-sm text-ink-900 placeholder:text-ink-400 shadow-2xs transition-all',
                'focus:border-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-800/15',
                invalid('email') ? 'border-danger-500 bg-danger-50/50' : 'border-ink-250 hover:border-ink-300'
              )}
            />
          </div>
          {invalid('email') ? (
            <p className="text-xs font-medium text-danger-600">Enter a valid email address.</p>
          ) : null}
        </div>

        {/* City / State */}
        <div className="space-y-1.5">
          <label htmlFor="enquiry-city" className="text-xs font-semibold text-ink-800 block">
            Current City / State
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
              <MapPin className="size-4" />
            </div>
            <input
              id="enquiry-city"
              name="city"
              type="text"
              autoComplete="address-level2"
              placeholder="e.g. Delhi, Mumbai"
              className="w-full rounded-xl border border-ink-250 bg-white py-2.5 pl-10 pr-3.5 text-sm text-ink-900 placeholder:text-ink-400 shadow-2xs transition-all focus:border-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-800/15 hover:border-ink-300"
            />
          </div>
        </div>
      </div>

      {!compact ? (
        <div className="space-y-1.5 pt-1">
          <label htmlFor="enquiry-message" className="text-xs font-semibold text-ink-800 block">
            What would you like assistance with? (Optional)
          </label>
          <textarea
            id="enquiry-message"
            name="message"
            rows={2}
            placeholder="Target specialization, budget, or preferred semester installment plans..."
            className="w-full rounded-xl border border-ink-250 bg-white p-3 text-sm text-ink-900 placeholder:text-ink-400 shadow-2xs transition-all focus:border-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-800/15"
          />
        </div>
      ) : null}

      {/* Consent Checkbox */}
      <div className="pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-0.5 size-4 rounded border-ink-300 text-brand-800 focus:ring-brand-800/30"
          />
          <span className="text-xs leading-normal text-ink-600">
            I agree to receive admission updates &amp; fee structure assistance via Call/WhatsApp as per the{' '}
            <Link
              href="/privacy-policy"
              className="font-semibold text-brand-800 underline hover:text-brand-900"
              target="_blank"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {invalid('consent') ? (
          <p className="mt-1 text-xs font-medium text-danger-600">Please accept the consent terms to proceed.</p>
        ) : null}
      </div>

      <div className="pt-2">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="accent"
      size="md"
      disabled={pending}
      className="w-full rounded-xl font-bold py-2.5 sm:py-3 text-xs sm:text-sm shadow-md bg-brand-800 hover:bg-brand-900 text-white transition-all duration-200"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="size-3.5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Submitting…
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <span>{label}</span>
          <ArrowRight className="size-3.5" />
        </span>
      )}
    </Button>
  );
}
