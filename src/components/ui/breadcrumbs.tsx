import Link from 'next/link';
import { Fragment } from 'react';

import { cn } from '@/lib/cn';

const TONES = {
  page: {
    list: 'text-ink-500',
    link: 'hover:text-brand-800',
    leaf: 'text-ink-700',
  },
  hero: {
    list: 'text-white/60',
    link: 'hover:text-white',
    leaf: 'text-white/90',
  },
} as const;

interface BreadcrumbsProps {
  /**
   * Structurally the `Crumb` that `@/lib/seo/schemas` already defines, but with
   * `path` optional so a trail can end on an unlinked leaf. Kept anonymous
   * rather than exported as a second `Crumb`: schemas.ts owns that name, and a
   * page that imported the wrong one would only find out at `breadcrumbSchema`.
   */
  items: { name: string; path?: string }[];
  tone?: keyof typeof TONES;
  className?: string;
}

/**
 * The visible breadcrumb trail. `items` is the shape `breadcrumbSchema` already
 * takes, so a page feeds one array to both and the trail can no longer drift
 * from the JSON-LD the way /qna/[slug] did.
 */
export function Breadcrumbs({ items, tone = 'page', className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  const { list, link, leaf } = TONES[tone];

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={cn('flex flex-wrap items-center gap-2 text-sm', list)}>
        {items.map((item, index) => {
          // The last crumb is the page you are already on, so it stays plain
          // text even though callers pass its path for the schema.
          const isLast = index === items.length - 1;

          return (
            <Fragment key={`${index}-${item.name}`}>
              {index > 0 ? <li aria-hidden="true">/</li> : null}
              {item.path && !isLast ? (
                <li>
                  <Link href={item.path} className={cn('transition-colors', link)}>
                    {item.name}
                  </Link>
                </li>
              ) : (
                <li
                  aria-current={isLast ? 'page' : undefined}
                  // A university's full name can be longer than the viewport;
                  // min-w-0 lets the flex item shrink so `truncate` can bite.
                  className={cn('min-w-0 truncate', isLast && leaf)}
                >
                  {item.name}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
