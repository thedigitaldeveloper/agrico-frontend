import { CardSkeleton } from '@/components/ui/card-skeleton';
import { cn } from '@/lib/cn';

const BAR = 'rounded-md bg-ink-100';

/**
 * The listing reads searchParams and is therefore dynamic, so picking a stream
 * or a page otherwise leaves the old questions on screen with nothing to say the
 * click landed.
 *
 * The rail placeholder matches FilterPanel on both sides of `lg`: a single
 * 44px trigger on a phone, the open rail on desktop.
 */
export default function QnaLoading() {
  return (
    <div aria-hidden="true" className="container-page py-10 lg:py-14">
      <div className="max-w-3xl animate-pulse">
        <div className={cn(BAR, 'h-4 w-32')} />
        <div className={cn(BAR, 'mt-6 h-9 w-3/4 lg:h-10')} />
        <div className={cn(BAR, 'mt-4 h-4')} />
        <div className={cn(BAR, 'mt-2.5 h-4 w-2/3')} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
        <div className={cn(BAR, 'h-11 animate-pulse rounded-lg lg:h-72 lg:rounded-card')} />
        {/* Questions stack full width rather than tiling, so the skeleton has to
            drop back to one column or the page jumps when the data lands. */}
        <CardSkeleton
          count={6}
          cols="wide"
          variant="row"
          className="sm:grid-cols-1 lg:grid-cols-1"
        />
      </div>
    </div>
  );
}
