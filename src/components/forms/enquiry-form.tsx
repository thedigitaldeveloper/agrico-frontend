'use client';

import { useActionState, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Check, LoaderCircle } from 'lucide-react';
import { submitEnquiry } from '@/lib/actions';
import { IDLE, type FormState } from '@/lib/form-state';
import './enquiry-form.css';

type Source = 'application-form' | 'counselling' | 'brochure' | 'contact' | 'sidebar';
export interface EnquiryFormProps {
  source?: Source;
  universitySlug?: string;
  programSlug?: string;
  courseName?: string;
  submitLabel?: string;
  compact?: boolean;
}
const errors: Record<string, string> = {
  name: 'Enter your full name (at least 2 characters).',
  phone: 'Enter a valid mobile number.',
  email: 'Enter a valid email address.',
  consent: 'Please accept the consent terms to proceed.',
};
const fields = [
  { name: 'name', label: 'Full name', type: 'text', auto: 'name', placeholder: 'Enter your full name', max: 120, required: true },
  { name: 'phone', label: 'Mobile number', type: 'tel', auto: 'tel', placeholder: 'Enter your mobile number', max: 20, required: true },
  { name: 'email', label: 'Email address', type: 'email', auto: 'email', placeholder: 'Enter your email address', max: 180, required: true },
  { name: 'city', label: 'City / state', type: 'text', auto: 'address-level2', placeholder: 'Enter your city or state', max: 80, required: false },
] as const;

export function EnquiryForm({
  source = 'application-form',
  universitySlug,
  programSlug,
  courseName,
  submitLabel = 'Send enquiry',
  compact = false,
}: EnquiryFormProps) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const summary = useRef<HTMLDivElement>(null);
  const success = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState({ name: '', phone: '', email: '', city: '', message: '' });
  const [consent, setConsent] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(submitEnquiry, IDLE);
  const [dismissed, setDismissed] = useState<{ state: FormState; fields: string[] } | null>(null);
  const invalid = (field: string) =>
    state.status === 'error' &&
    Boolean(state.invalid?.includes(field)) &&
    !(dismissed?.state === state && dismissed.fields.includes(field));
  const invalidFields = (state.invalid || []).filter(invalid);
  const hasError = state.status === 'error' && (!state.invalid?.length || invalidFields.length > 0);
  const edit = (field: string) =>
    setDismissed(current => ({
      state,
      fields: current?.state === state ? [...new Set([...current.fields, field])] : [field],
    }));

  useEffect(() => {
    if (state.status === 'success') {
      success.current?.focus();
      return;
    }
    if (state.status !== 'error') return;
    const target = state.invalid?.[0] ? form.current?.elements.namedItem(state.invalid[0]) : null;
    if (target instanceof HTMLElement) target.focus();
    else summary.current?.focus();
  }, [state]);

  if (state.status === 'success') {
    return (
      <div ref={success} tabIndex={-1} className="sm-enquiry-success" role="status">
        <span>
          <Check size={25} aria-hidden="true" />
        </span>
        <h3>Thank you. We have your enquiry.</h3>
        <p>{state.message}</p>
        <Link href="/#universities">
          Explore agriculture universities
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <form ref={form} className="sm-enquiry-form" action={action} noValidate aria-busy={pending}>
      <input type="hidden" name="source" value={source} />
      {universitySlug ? <input type="hidden" name="university" value={universitySlug} /> : null}
      {programSlug ? (
        <input type="hidden" name="program" value={programSlug} />
      ) : courseName ? (
        <input type="hidden" name="course" value={courseName} />
      ) : null}
      {hasError ? (
        <div ref={summary} className="sm-enquiry-errors" role="alert" tabIndex={-1}>
          <AlertCircle size={19} aria-hidden="true" />
          <div>
            <strong>{invalidFields.length ? 'Please review these fields.' : 'Your enquiry could not be sent.'}</strong>
            {invalidFields.length ? (
              <ul>
                {invalidFields.map(field => (
                  <li key={field}>
                    <a
                      href={`#${id}-${field}`}
                      onClick={event => {
                        event.preventDefault();
                        const target = form.current?.elements.namedItem(field);
                        if (target instanceof HTMLElement) target.focus();
                      }}
                    >
                      {errors[field] || state.message}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{state.message}</p>
            )}
          </div>
        </div>
      ) : null}
      <div className="sm-enquiry-form-grid">
        {fields.map(field => (
          <div className="sm-enquiry-field" key={field.name}>
            <label htmlFor={`${id}-${field.name}`}>
              {field.label} <span>({field.required ? 'required' : 'optional'})</span>
            </label>
            <input
              id={`${id}-${field.name}`}
              name={field.name}
              type={field.type}
              autoComplete={field.auto}
              inputMode={field.name === 'phone' ? 'tel' : field.name === 'email' ? 'email' : 'text'}
              required={field.required}
              minLength={field.name === 'name' ? 2 : undefined}
              maxLength={field.max}
              disabled={pending}
              placeholder={field.placeholder}
              value={values[field.name]}
              aria-invalid={invalid(field.name)}
              aria-describedby={invalid(field.name) ? `${id}-${field.name}-error` : undefined}
              onChange={event => {
                setValues(current => ({ ...current, [field.name]: event.target.value }));
                edit(field.name);
              }}
            />
            {invalid(field.name) ? (
              <p className="sm-enquiry-field-error" id={`${id}-${field.name}-error`}>
                {errors[field.name]}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {!compact ? (
        <div className="sm-enquiry-field sm-enquiry-message">
          <label htmlFor={`${id}-message`}>
            What would you like help with? <span>(optional)</span>
          </label>
          <textarea
            id={`${id}-message`}
            name="message"
            rows={3}
            maxLength={1800}
            disabled={pending}
            placeholder="Tell us about your agriculture programme interests or admission questions"
            value={values.message}
            onChange={event => setValues(current => ({ ...current, message: event.target.value }))}
          />
        </div>
      ) : null}
      <div className="sm-enquiry-consent">
        <label htmlFor={`${id}-consent`}>
          <input
            id={`${id}-consent`}
            type="checkbox"
            name="consent"
            required
            checked={consent}
            disabled={pending}
            aria-invalid={invalid('consent')}
            aria-describedby={invalid('consent') ? `${id}-consent-error` : undefined}
            onChange={event => {
              setConsent(event.target.checked);
              edit('consent');
            }}
          />
          <span>
            I agree to receive admission updates &amp; fee structure assistance via Call/WhatsApp as per the{' '}
            <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {invalid('consent') ? (
          <p className="sm-enquiry-field-error" id={`${id}-consent-error`}>
            {errors.consent}
          </p>
        ) : null}
      </div>
      <button className="sm-enquiry-submit" type="submit" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="sm-enquiry-spinner" size={18} aria-hidden="true" />
            Sending enquiry…
          </>
        ) : (
          <>
            {submitLabel}
            <ArrowRight size={18} aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
