import { cn } from '@/lib/cn';

const BAR = 'rounded-md bg-ink-100';

/**
 * Search is dynamic on `q`, so a submit otherwise leaves the previous results
 * on screen while the CMS is queried. The shape mirrors the page — centred
 * header, the search control, then result rows — so nothing moves when the real
 * results land.
 *
 * Hidden from assistive tech: the route transition announces itself, and a
 * handful of empty boxes read as content would only talk over it.
 */
export default function SearchLoading() {
  return (
    <div className="container-page py-10 lg:py-14">
      <div aria-hidden="true" className="mx-auto max-w-3xl animate-pulse">
        <div className={cn(BAR, 'mx-auto h-9 w-40 lg:h-10')} />
        <div className={cn(BAR, 'mx-auto mt-4 h-4 w-full max-w-lg')} />
        <div className={cn(BAR, 'mx-auto mt-2.5 h-4 w-2/3')} />

        <div className={cn(BAR, 'mt-6 h-12')} />

        <div className="mt-8 space-y-3">
          {[0, 1, 2].map((row) => (
            <div key={row} className="h-14 rounded-card border border-ink-200 bg-white" />
          ))}
        </div>
      </div>
    </div>
  );
}
