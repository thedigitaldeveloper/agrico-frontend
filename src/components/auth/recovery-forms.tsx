'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { requestPasswordReset } from '@/lib/auth/recovery-actions';
import { IDLE, type FormState } from '@/lib/form-state';

function Result({ state }: { state: FormState }) {
  if (!state.message) return null;
  return <p className={state.status === 'error' ? 'rs-form-error' : 'text-sm leading-relaxed text-brand-900'}
    role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p>;
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, IDLE);
  const [email, setEmail] = useState('');
  return <form action={action} className="rs-auth-form">
    {state.status !== 'success' ? <>
      <label className="rs-auth-field" htmlFor="rs-recovery-email">
        Email address
        <input id="rs-recovery-email" name="email" type="email" autoComplete="email" required maxLength={180}
          value={email} onChange={event => setEmail(event.target.value)} aria-invalid={state.invalid?.includes('email')} />
      </label>
      <button className="rs-button" type="submit" disabled={pending}>
        {pending ? 'Sending request…' : 'Send reset link'}<ArrowRight size={18} aria-hidden="true" />
      </button>
    </> : null}
    <Result state={state} />
    <p className="rs-auth-alternative"><Link href="/login">Back to sign in</Link></p>
  </form>;
}

function NewPasswordField({ confirmation = false, invalid = false }: { confirmation?: boolean; invalid?: boolean }) {
  const [visible, setVisible] = useState(false);
  const id = confirmation ? 'rs-reset-confirmation' : 'rs-reset-password';
  return <label className="rs-auth-field" htmlFor={id}>
    {confirmation ? 'Confirm new password' : 'New password'}
    <div className="rs-password">
      <input id={id} name={confirmation ? 'passwordConfirmation' : 'password'} type={visible ? 'text' : 'password'}
        autoComplete="new-password" minLength={10} maxLength={128} required aria-invalid={invalid}
        aria-describedby={confirmation ? undefined : 'rs-reset-password-hint'} />
      <button type="button" aria-label={`${visible ? 'Hide' : 'Show'} ${confirmation ? 'password confirmation' : 'new password'}`}
        aria-pressed={visible} onClick={() => setVisible(current => !current)}>
        {visible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
      </button>
    </div>
    {!confirmation ? <small id="rs-reset-password-hint">Use 10–128 characters.</small> : null}
  </label>;
}

export function ResetPasswordForm({ action }: { action: (previous: FormState, form: FormData) => Promise<FormState> }) {
  const [state, submit, pending] = useActionState(action, IDLE);
  return <form action={submit} className="rs-auth-form">
    {state.status !== 'success' ? <>
      <NewPasswordField invalid={state.invalid?.includes('password')} />
      <NewPasswordField confirmation invalid={state.invalid?.includes('passwordConfirmation')} />
      <button className="rs-button" type="submit" disabled={pending}>
        {pending ? 'Updating password…' : 'Update password'}<ArrowRight size={18} aria-hidden="true" />
      </button>
    </> : null}
    <Result state={state} />
    {state.status === 'success' ? <p className="rs-auth-alternative"><Link href="/login">Sign in</Link></p>
      : <p className="rs-auth-alternative"><Link href="/forgot-password">Request a new reset link</Link></p>}
  </form>;
}
