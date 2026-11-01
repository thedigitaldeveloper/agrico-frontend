import { GRID_COLS, type GridCols } from '@/components/ui/card-grid';
import { cn } from '@/lib/cn';

const SHELL = 'animate-pulse rounded-card border border-ink-200 bg-white';
const BAR = 'rounded-md bg-ink-100';

/**
 * Placeholder grid for a listing that is still resolving.
 *
 * Every listing reads searchParams and is therefore dynamic, so a filter or
 * page click otherwise leaves the previous results on screen, unchanged, with
 * nothing to say the click landed. The heights are chosen to match the real
 * cards, so adopting the skeleton does not make the page jump when the data
 * arrives.
 *
 * Hidden from assistive tech: the route transition already announces itself,
 * and a dozen empty boxes announced as content would only talk over it.
 */
export function CardSkeleton({
  count = 6,
  cols = 'rail',
  variant = 'card',
  className,
}: {
  count?: number;
  cols?: GridCols;
  variant?: 'card' | 'media' | 'row';
  className?: string;
}) {
  return (
    <ul aria-hidden="true" className={cn('grid gap-5', GRID_COLS[cols], className)}>
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <Placeholder variant={variant} />
        </li>
      ))}
    </ul>
  );
}

function Placeholder({ variant }: { variant: 'card' | 'media' | 'row' }) {
  if (variant === 'row') {
    return <div className={cn(SHELL, 'h-24')} />;
  }

  if (variant === 'media') {
    return (
      <div className={cn(SHELL, 'overflow-hidden')}>
        <div className="aspect-16/9 bg-ink-100" />
        <div className="p-5">
          <div className={cn(BAR, 'h-4 w-3/4')} />
          <div className={cn(BAR, 'mt-3 h-3')} />
          <div className={cn(BAR, 'mt-2.5 h-3 w-2/3')} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(SHELL, 'flex h-72 flex-col overflow-hidden')}>
      <div className="flex items-start justify-between gap-3 bg-ink-50 px-5 pt-5 pb-4">
        <div className="size-14 shrink-0 rounded-xl bg-ink-100" />
        <div className={cn(BAR, 'h-5 w-16 rounded-pill')} />
      </div>
      <div className="flex-1 px-5 pt-4">
        <div className={cn(BAR, 'h-4 w-4/5')} />
        <div className={cn(BAR, 'mt-2.5 h-3 w-1/2')} />
        <div className={cn(BAR, 'mt-4 h-5 w-3/4 rounded-pill')} />
      </div>
      <div className="border-t border-ink-100 bg-ink-50 px-5 py-4">
        <div className={cn(BAR, 'h-3 w-20')} />
        <div className={cn(BAR, 'mt-2 h-4 w-1/3')} />
      </div>
    </div>
  );
}
