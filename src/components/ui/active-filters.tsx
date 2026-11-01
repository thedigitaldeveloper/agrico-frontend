import Link from 'next/link';

import { buildListHref, type SearchParams } from '@/components/ui/pagination';
import { cn } from '@/lib/cn';

interface AppliedFilter {
  /** The query parameter this chip clears. */
  param: string;
  /** Human group name, e.g. "Stream". */
  label: string;
  /** Human value name, e.g. "Engineering". */
  display: string;
}

/**
 * Visible, removable feedback for the filters currently in the URL.
 *
 * Arriving at /universities?stream=engineering from a header dropdown is
 * otherwise indistinguishable from the unfiltered listing: the heading and the
 * count read the same, and the only signal is an aria-current highlight on a
 * sidebar link that a phone keeps behind a collapsed panel.
 *
 * Resolving each slug to its human name is the caller's job — it already holds
 * the taxonomy list — so this stays free of CMS lookups.
 */
export function ActiveFilters({
  basePath,
  current,
  applied,
  className,
}: {
  basePath: string;
  current: SearchParams;
  applied: AppliedFilter[];
  className?: string;
}) {
  if (applied.length === 0) return null;

  return (
    <div className={cn('mt-6 flex flex-wrap items-center gap-2', className)}>
      <span className="text-xs font-semibold tracking-wide text-ink-500 uppercase">
        Filtered by
      </span>

      {applied.map(({ param, label, display }) => (
        <Link
          key={param}
          href={buildListHref(basePath, current, { [param]: null })}
          aria-label={`Remove ${label} filter: ${display}`}
          className="inline-flex items-center gap-1.5 rounded-pill bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-inset ring-brand-200 transition-colors hover:bg-brand-100"
        >
          {display}
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-3 fill-none stroke-current stroke-2"
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </Link>
      ))}

      <Link
        href={basePath}
        className="text-xs font-semibold text-ink-600 underline underline-offset-2 hover:text-brand-800"
      >
        Clear all
      </Link>
    </div>
  );
}
