import Link from 'next/link';
import { Fragment } from 'react';

import { cn } from '@/lib/cn';

export type SearchParams = Record<string, string | string[] | undefined>;

/** Reads a single value from a searchParams entry that may be an array. */
export const one = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

/**
 * Builds a listing URL, carrying every current filter except the ones being
 * changed. Paging always resets on a filter change: page 4 of the old result
 * set is usually an empty page of the new one.
 */
export function buildListHref(
  basePath: string,
  current: SearchParams,
  changes: Record<string, string | null>
): string {
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(current)) {
    const single = one(value);
    if (single && key !== 'page' && !(key in changes)) next.set(key, single);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value) next.set(key, value);
  }

  const query = next.toString();
  return `${basePath}${query ? `?${query}` : ''}`;
}

/** Neighbours of the current page that stay visible either side of it. */
const WINDOW = 1;

/**
 * The pages worth rendering: the two ends, plus a window around the current
 * one. A catalogue twenty pages deep is otherwise nineteen round trips away
 * from its last page.
 */
function pageWindow(page: number, pageCount: number): number[] {
  const shown = new Set<number>([1, pageCount]);
  for (let target = page - WINDOW; target <= page + WINDOW; target += 1) {
    if (target >= 1 && target <= pageCount) shown.add(target);
  }
  return [...shown].sort((a, b) => a - b);
}

export function Pagination({
  basePath,
  page,
  pageCount,
  current,
  className,
}: {
  basePath: string;
  page: number;
  pageCount: number;
  current: SearchParams;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  const hrefFor = (target: number) =>
    buildListHref(basePath, current, { page: target > 1 ? String(target) : null });

  const linkClass =
    'rounded-lg border border-ink-300 px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-800';
  // Kept in the row rather than dropped at the ends, so the numbers stay under
  // the same pixels between page 1 and page 2 instead of the row re-centring.
  const disabledClass = cn(linkClass, 'pointer-events-none opacity-40');

  const pages = pageWindow(page, pageCount);

  return (
    <nav
      aria-label="Pagination"
      className={cn('mt-10 flex flex-wrap items-center justify-center gap-2', className)}
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={linkClass}>
          ← Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          ← Previous
        </span>
      )}

      {pages.map((target, index) => (
        <Fragment key={target}>
          {index > 0 && target - pages[index - 1] > 1 ? (
            <span aria-hidden="true" className="px-1 text-sm text-ink-500">
              …
            </span>
          ) : null}
          <Link
            href={hrefFor(target)}
            aria-label={`Page ${target}`}
            aria-current={target === page ? 'page' : undefined}
            className={cn(
              linkClass,
              target === page && 'border-brand-800 bg-brand-50 text-brand-800'
            )}
          >
            {target}
          </Link>
        </Fragment>
      ))}

      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} rel="next" className={linkClass}>
          Next →
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          Next →
        </span>
      )}
    </nav>
  );
}

/** Sidebar filter list. Plain links, so the URL stays the source of truth. */
export function FilterGroup({
  basePath,
  title,
  param,
  active,
  options,
  current,
  className,
}: {
  basePath: string;
  title: string;
  param: string;
  active: string | undefined;
  options: { documentId: string; name: string; slug: string }[];
  current: SearchParams;
  className?: string;
}) {
  if (options.length === 0) return null;

  const itemClass =
    'block rounded-md px-3 py-2 text-sm text-ink-600 transition-colors hover:bg-ink-100 aria-[current]:bg-brand-50 aria-[current]:font-semibold aria-[current]:text-brand-800';

  return (
    <div className={className}>
      <h2 className="font-display text-sm font-bold tracking-wide text-ink-900 uppercase">
        {title}
      </h2>
      <ul className="mt-3 space-y-1">
        <li>
          <Link
            href={buildListHref(basePath, current, { [param]: null })}
            aria-current={!active ? 'page' : undefined}
            className={itemClass}
          >
            All
          </Link>
        </li>
        {options.map((option) => (
          <li key={option.documentId}>
            <Link
              href={buildListHref(basePath, current, { [param]: option.slug })}
              aria-current={active === option.slug ? 'page' : undefined}
              className={itemClass}
            >
              {option.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
