'use client';

import { useEffect, useRef } from 'react';

import { ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/cn';

interface SuccessLink {
  href: string;
  label: string;
}

interface FormSuccessProps {
  title: string;
  message: string;
  /** What happens next, one line each — the answer to "so is that it?". */
  next?: string[];
  action?: SuccessLink;
  secondaryAction?: SuccessLink;
  className?: string;
}

/**
 * Confirmation panel that replaces a submitted form.
 *
 * It takes focus on mount because it is almost always shorter than the form it
 * replaced: on a phone the page collapses upwards and the confirmation can end
 * up above the viewport, so a visitor sees the form vanish and nothing appear.
 * Moving focus scrolls it into view and announces it in the same beat.
 */
export function FormSuccess({
  title,
  message,
  next,
  action,
  secondaryAction,
  className,
}: FormSuccessProps) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panel.current?.focus();
  }, []);

  return (
    <div
      ref={panel}
      tabIndex={-1}
      role="status"
      className={cn(
        'rounded-card border border-success-500/30 bg-success-50/40 p-6 text-center lg:p-8',
        className
      )}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-50 text-success-700">
        <CheckMark className="size-6" />
      </div>

      <h2 className="mt-5 font-display text-xl font-bold text-ink-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-600">{message}</p>

      {next && next.length > 0 ? (
        <ul className="mx-auto mt-5 max-w-sm space-y-2 text-left text-sm text-ink-700">
          {next.map((step) => (
            <li key={step} className="flex items-start gap-2">
              <CheckMark className="mt-0.5 size-4 shrink-0 text-success-700" />
              {step}
            </li>
          ))}
        </ul>
      ) : null}

      {action || secondaryAction ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {action ? <ButtonLink href={action.href}>{action.label}</ButtonLink> : null}
          {secondaryAction ? (
            <ButtonLink href={secondaryAction.href} variant="outline">
              {secondaryAction.label}
            </ButtonLink>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CheckMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="m5 10.5 3.5 3.5L15 6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
