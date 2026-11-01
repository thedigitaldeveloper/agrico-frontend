import type { ReactNode } from 'react';

import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { cn } from '@/lib/cn';
import './listing.css';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  /** Same shape breadcrumbSchema takes, so one array feeds the trail and the JSON-LD. */
  crumbs?: { name: string; path?: string }[];
  count?: {
    total: number;
    page: number;
    pageSize: number;
    noun: [singular: string, plural: string];
  };
  actions?: ReactNode;
  align?: 'start' | 'center';
  className?: string;
  children?: ReactNode;
}

/**
 * Top-of-page heading block for listings and standalone pages.
 *
 * Emits no container and no page padding: every caller already opens a
 * `container-page py-10 lg:py-14`, and swallowing that here would shift the
 * vertical rhythm of eleven pages at once. Section cannot serve this role —
 * it hard-codes an h2 and brings its own container.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  crumbs,
  count,
  actions,
  align = 'start',
  className,
  children,
}: PageHeaderProps) {
  const centred = align === 'center';

  return (
    <>
      {crumbs && crumbs.length > 0 ? (
        <Breadcrumbs items={crumbs} tone="page" className="mb-6" />
      ) : null}

      <header className={cn('rs-page-heading max-w-3xl', centred && 'mx-auto text-center', className)}>
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="font-display text-4xl font-medium text-balance text-brand-800 lg:text-5xl">{title}</h1>

        {description ? (
          <p className="mt-3 text-base leading-relaxed text-ink-600">{description}</p>
        ) : null}

        {count && count.total > 0 ? (
          <p className="mt-2 text-sm text-ink-500">
            Showing {(count.page - 1) * count.pageSize + 1}–
            {Math.min(count.page * count.pageSize, count.total)} of {count.total}{' '}
            {count.total === 1 ? count.noun[0] : count.noun[1]}
          </p>
        ) : null}

        {actions ? (
          <div className={cn('mt-6 flex flex-wrap gap-3', centred && 'justify-center')}>
            {actions}
          </div>
        ) : null}

        {children}
      </header>
    </>
  );
}
