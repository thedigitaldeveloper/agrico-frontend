import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * Sidebar filter rail.
 *
 * Two problems in one wrapper. On a phone the rail is pushed above the results
 * and cannot be collapsed — /programs stacks fifty-odd link rows before the
 * first card — so it becomes a native `<details>` there, which costs no client
 * JavaScript. On desktop the rail is taller than the viewport on those same
 * pages, so a sticky rail pinned at 96px can never be scrolled to its end;
 * bounding its height and letting it scroll internally fixes that.
 *
 * The `lg:block` on the body is what keeps the panel open at desktop whatever
 * the details' open state is, and `lg:hidden` on the summary hides the trigger
 * there. 7rem is the 6rem sticky offset plus breathing room.
 */
export function FilterPanel({
  children,
  activeCount = 0,
  label = 'Filters',
  className,
}: {
  children: ReactNode;
  activeCount?: number;
  label?: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn(
        'scrollbar-none lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:self-start lg:overflow-y-auto lg:pr-2',
        className
      )}
    >
      <details className="group details-open-lg">
        <summary className="flex h-11 cursor-pointer list-none items-center justify-between rounded-lg border border-ink-300 bg-white px-4 text-sm font-semibold text-ink-900 marker:content-none lg:hidden [&::-webkit-details-marker]:hidden">
          <span>
            {label}
            {activeCount > 0 ? ` (${activeCount})` : ''}
          </span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-3 fill-none stroke-current stroke-2 transition-transform group-open:rotate-180"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>

        <div className="mt-4 hidden space-y-8 group-open:block lg:mt-0 lg:block">{children}</div>
      </details>
    </nav>
  );
}
