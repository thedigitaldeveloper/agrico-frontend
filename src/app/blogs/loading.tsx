import { CardSkeleton } from '@/components/ui/card-skeleton';

/**
 * The listing reads searchParams and is therefore dynamic: without this, a click
 * on page 2 left the previous results on screen, unchanged, until the CMS
 * answered. The block below stands in for the real header, section switcher and
 * grid, so nothing jumps when the posts arrive.
 */
export default function Loading() {
  return (
    <div className="container-page py-10 lg:py-14">
      <div aria-hidden="true" className="animate-pulse">
        <div className="h-4 w-44 rounded-md bg-ink-200" />
        <div className="mt-6 h-9 w-3/4 max-w-md rounded-md bg-ink-200" />
        <div className="mt-4 h-4 w-full max-w-xl rounded-md bg-ink-100" />
        <div className="mt-2.5 h-3 w-40 rounded-md bg-ink-100" />

        <div className="mt-6 flex gap-2">
          <div className="h-10 w-24 rounded-pill bg-ink-100" />
          <div className="h-10 w-20 rounded-pill bg-ink-100" />
          <div className="h-10 w-20 rounded-pill bg-ink-100" />
        </div>
      </div>

      <CardSkeleton count={6} cols="wide" variant="media" className="mt-8 gap-6" />
    </div>
  );
}
