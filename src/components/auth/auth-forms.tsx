'use client';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { ArrowRight, Eye, EyeOff, LogOut } from 'lucide-react';
import { login, register } from '@/lib/auth/actions';
import { IDLE } from '@/lib/form-state';
function Password({
  newPassword = false,
  invalid = false,
}: {
  newPassword?: boolean;
  invalid?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="rs-auth-field" htmlFor="rs-auth-password">
      Password
      <div className="rs-password">
        <input
          id="rs-auth-password"
          name="password"
          type={visible ? 'text' : 'password'}
          autoComplete={newPassword ? 'new-password' : 'current-password'}
          required
          minLength={newPassword ? 10 : undefined}
          maxLength={128}
          aria-invalid={invalid}
          aria-describedby={newPassword ? 'rs-password-hint' : undefined}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
      {newPassword ? (
        <small id="rs-password-hint">Use at least 10 characters.</small>
      ) : null}
    </label>
  );
}
export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, IDLE);
  const [email, setEmail] = useState('');
  return (
    <form action={action} className="rs-auth-form">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <label className="rs-auth-field" htmlFor="rs-auth-email">
        Email address
        <input
          id="rs-auth-email"
          name="identifier"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="username"
          required
        />
      </label>
      <Password />
      <Link href="/forgot-password" className="rs-text-link self-start text-sm">
        Forgot your password?
      </Link>
      {state.message ? (
        <p className="rs-form-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button className="rs-button" type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
        <ArrowRight size={18} />
      </button>
      <p className="rs-auth-alternative">
        New to Agrico?{' '}
        <Link
          href={
            next ? '/register?next=' + encodeURIComponent(next) : '/register'
          }
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(register, IDLE);
  const invalid = (field: string) => state.invalid?.includes(field);
  const [fields, setFields] = useState<Record<string, string>>({
    username: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    course: '',
    qualification: '',
  });
  return (
    <form action={action} className="rs-auth-form">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div className="rs-auth-fields">
        {[
          {
            name: 'username',
            id: 'name',
            label: 'Full name',
            type: 'text',
            auto: 'name',
          },
          {
            name: 'email',
            id: 'email',
            label: 'Email address',
            type: 'email',
            auto: 'email',
          },
          {
            name: 'phone',
            id: 'phone',
            label: 'Mobile number',
            type: 'tel',
            auto: 'tel',
          },
        ].map((f) => (
          <label
            className="rs-auth-field"
            htmlFor={'rs-register-' + f.id}
            key={f.id}
          >
            {f.label}
            <input
              id={'rs-register-' + f.id}
              name={f.name}
              value={fields[f.name]}
              onChange={(e) =>
                setFields((current) => ({
                  ...current,
                  [f.name]: e.target.value,
                }))
              }
              type={f.type}
              autoComplete={f.auto}
              required
              minLength={f.id === 'name' ? 2 : undefined}
              maxLength={f.id === 'phone' ? 20 : f.id === 'name' ? 120 : 180}
              aria-invalid={invalid(f.id)}
            />
          </label>
        ))}
        <Password newPassword invalid={invalid('password')} />
      </div>
      <details className="rounded-xl border border-ink-200 bg-brand-50 px-4">
        <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold text-brand-800">
          Education preferences <span className="font-normal text-ink-600">(optional)</span>
        </summary>
        <p className="mb-4 text-sm leading-relaxed text-ink-600">
          Share these details if you would like admission guidance.
        </p>
        <div className="rs-auth-fields pb-4">
          {[
            { name: 'city', label: 'City', auto: 'address-level2', placeholder: 'Your city' },
            { name: 'state', label: 'State', auto: 'address-level1', placeholder: 'Your state' },
            { name: 'course', label: 'Programme interest', auto: 'off', placeholder: 'Programme or help choosing' },
          ].map((field) => (
            <label className="rs-auth-field" htmlFor={`rs-register-${field.name}`} key={field.name}>
              {field.label}
              <input
                id={`rs-register-${field.name}`}
                name={field.name}
                type="text"
                autoComplete={field.auto}
                maxLength={160}
                placeholder={field.placeholder}
                value={fields[field.name]}
                onChange={(event) => setFields((current) => ({ ...current, [field.name]: event.target.value }))}
              />
            </label>
          ))}
          <label className="rs-auth-field min-w-0" htmlFor="rs-register-qualification">
            Highest qualification
            <select
              id="rs-register-qualification"
              name="qualification"
              className="mt-2 block min-h-[49px] w-full min-w-0 max-w-full rounded-md border border-ink-200 bg-white px-3.5 py-3 text-base font-normal text-ink-700"
              value={fields.qualification}
              onChange={(event) => setFields((current) => ({ ...current, qualification: event.target.value }))}
            >
              <option value="">Select if you would like to share</option>
              <option>12th Pass (HSC / Intermediate)</option>
              <option>3-Year Polytechnic Diploma</option>
              <option>Graduation (Completed / Pursuing)</option>
              <option>Post Graduation (Master’s Degree)</option>
              <option>Other</option>
            </select>
          </label>
        </div>
      </details>
      <label className="rs-consent">
        <input
          type="checkbox"
          name="consent"
          required
          aria-invalid={invalid('consent')}
        />
        <span>
          I agree to the <Link href="/terms-and-conditions">terms of use</Link>{' '}
          and <Link href="/privacy-policy">privacy policy</Link>.
        </span>
      </label>
      <label className="rs-consent">
        <input type="checkbox" name="counselling_consent" />
        <span>
          I would also like Agrico to contact me for admission guidance.
          (Optional)
        </span>
      </label>
      {state.message ? (
        <p className="rs-form-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button className="rs-button" type="submit" disabled={pending}>
        {pending ? 'Creating your account…' : 'Create student account'}
        <ArrowRight size={18} />
      </button>
      <p className="rs-auth-alternative">
        Already have an account?{' '}
        <Link
          href={next ? '/login?next=' + encodeURIComponent(next) : '/login'}
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
export function LogoutButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action}>
      <button type="submit" className="rs-text-link">
        <LogOut size={16} />
        Sign out
      </button>
    </form>
  );
}
