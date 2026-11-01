import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface FactItem {
  documentId: string;
  name: string;
  slug?: string;
}

interface FactCardProps {
  title: string;
  items?: FactItem[];
  /**
   * Returning null keeps a chip as plain text — taxonomy terms without a landing
   * page of their own would otherwise become links to nowhere.
   */
  hrefFor?: (item: { slug?: string }) => string | null;
  children?: ReactNode;
  className?: string;
}

/**
 * Exported so the two pages that need a chip list outside a FactCard — the
 * mentor profile and the Q&A footer, both of which own their own heading — can
 * use it rather than keeping copies that drift.
 */
export const CHIP = 'rounded-pill bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700';

/** The hover treatment a chip only earns once it actually navigates somewhere. */
export const CHIP_LINK = 'block transition-colors hover:bg-brand-50 hover:text-brand-800';

/**
 * Sidebar fact card — an uppercase title over a chip list, prose, or both.
 * Renders nothing at all when it has neither, so callers stop guarding it.
 */
export function FactCard({ title, items = [], hrefFor, children, className }: FactCardProps) {
  if (items.length === 0 && !children) return null;

  return (
    <div className={cn('rounded-card border border-ink-200 bg-white p-5', className)}>
      <h3 className="font-display text-sm font-bold tracking-wide text-ink-900 uppercase">
        {title}
      </h3>

      {items.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {items.map((item) => {
            const href = hrefFor?.(item) ?? null;

            // The padded box has to be the link itself: put the chip class on the
            // list item instead and only the label text would be clickable inside
            // something that looks clickable edge to edge.
            return href ? (
              <li key={item.documentId}>
                <Link href={href} className={cn(CHIP, CHIP_LINK)}>
                  {item.name}
                </Link>
              </li>
            ) : (
              <li key={item.documentId} className={CHIP}>
                {item.name}
              </li>
            );
          })}
        </ul>
      ) : null}

      {children}
    </div>
  );
}
