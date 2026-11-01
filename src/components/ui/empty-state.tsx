import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  /** An inline `size-6` SVG. Defaults to a magnifier. */
  icon?: ReactNode;
  tone?: 'card' | 'dashed';
  /** ButtonLink/Link elements — the way out of the dead end. */
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

/**
 * The zero-result state for listings, search and dashboard collections.
 *
 * `dashed` is for a collection the visitor is expected to fill themselves (an
 * empty booking list, no saved comparisons) where the border reads as a slot
 * waiting for content; `card` is for a query that simply matched nothing.
 */
export function EmptyState({
  title,
  description,
  icon,
  tone = 'card',
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-card border bg-white px-6 py-12 text-center',
        tone === 'dashed' ? 'border-dashed border-ink-300' : 'border-ink-200',
        className
      )}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-ink-100 text-ink-400">
        {icon ?? <SearchIcon />}
      </div>
      <p className="mt-5 font-display text-base font-bold text-ink-900">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-600">
          {description}
        </p>
      ) : null}
      {action || secondaryAction ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="size-6"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="m13.5 13.5 3.5 3.5" strokeLinecap="round" />
    </svg>
  );
}
