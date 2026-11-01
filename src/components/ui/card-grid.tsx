import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * Shared with CardSkeleton, which has to occupy exactly this grid — two copies
 * of the ramp would drift and the placeholder would stop predicting the layout
 * it stands in for.
 */
export const GRID_COLS = {
  /** Pages with a 16rem filter rail — xl rather than lg, because the rail eats the width. */
  rail: 'md:grid-cols-2 xl:grid-cols-3',
  /** Full width, compact cards: a thumbnail and a title, readable at 290px. */
  wide: 'sm:grid-cols-2 lg:grid-cols-3',
  /**
   * Full width, information-dense cards. A university card carries a logo, a
   * badge row, a two-column fact table and two side-by-side buttons, and stops
   * being readable much below 350px — so it waits for md before doubling up.
   */
  dense: 'md:grid-cols-2 lg:grid-cols-3',
} as const;

export type GridCols = keyof typeof GRID_COLS;

/**
 * Results grid.
 *
 * A list, not a bare div of sibling articles: assistive tech otherwise never
 * announces "list, 12 items" on a page whose entire purpose is a set of
 * results. `<article>` inside `<li>` is valid, so the cards need no change.
 */
export function CardGrid<T>({
  items,
  getKey,
  children,
  cols = 'rail',
  label,
  className,
}: {
  items: T[];
  getKey: (item: T) => string;
  children: (item: T) => ReactNode;
  cols?: GridCols;
  label?: string;
  className?: string;
}) {
  return (
    <ul aria-label={label} className={cn('grid gap-5 lg:gap-6', GRID_COLS[cols], className)}>
      {items.map((item) => (
        <li key={getKey(item)}>{children(item)}</li>
      ))}
    </ul>
  );
}
