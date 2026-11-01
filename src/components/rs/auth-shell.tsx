import Image from 'next/image';
import type { ReactNode } from 'react';
import { BRAND } from '@/lib/brand';
export function AuthShell({
  children,
  register = false,
  heading,
  description,
  label,
}: {
  children: ReactNode;
  register?: boolean;
  heading?: string;
  description?: string;
  label?: string;
}) {
  return (
    <div className="rs-auth">
      <div className="rs-container rs-auth-grid">
        <aside className="rs-auth-story">
          <Image
            src="/images/rs/student-life.png"
            fill
            alt="Students planning their next chapter"
            sizes="(max-width:760px) 100vw, 50vw"
            className="rs-cover"
            loading="eager" fetchPriority="high"
          />
          <div>
            <Image
              src="/branding/rs-education-logo-inverse.svg"
              width={204}
              height={40}
              alt={BRAND.name}
            />
            <span className="rs-eyebrow">Your student space</span>
            <h2>
              Your plans.
              <br />
              Your possibilities.
              <br />
              <em>Your next chapter.</em>
            </h2>
            <p>
              Keep your profile and counselling sessions together as you explore
              what comes next.
            </p>
          </div>
        </aside>
        <section className="rs-auth-panel">
          <span className="rs-eyebrow">
            {label || `Agrico · Student ${register ? 'registration' : 'login'}`}
          </span>
          <h1>{heading || (register ? 'A new chapter starts here.' : 'Welcome back.')}</h1>
          <p>
            {description || (register
              ? 'Create your account to manage your profile and counselling sessions.'
              : 'Sign in to continue your journey with Agrico.')}
          </p>
          {children}
        </section>
      </div>
    </div>
  );
}
