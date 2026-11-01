import { CardSkeleton } from '@/components/ui/card-skeleton';

/**
 * The listing reads searchParams, so it is dynamic: without this, clicking a
 * filter or a page number left the previous results on screen with nothing to
 * say the click had landed. The shape mirrors the page's — crumbs, heading,
 * rail, grid — so the real content lands where the placeholder stood.
 */
export default function Loading() {
  return (
    <div aria-hidden="true" className="container-page py-10 lg:py-14">
      <div className="mb-6 h-5 w-48 max-w-full animate-pulse rounded-md bg-ink-100" />
      <div className="h-9 w-72 max-w-full animate-pulse rounded-lg bg-ink-200" />
      <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded-md bg-ink-100" />

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
        {/* Matches FilterPanel on both sides of `lg`: the 44px trigger a
            phone gets, the open rail on desktop. Hiding it below `lg` left
            the results jumping up by the height of that trigger. */}
        <div className="h-11 animate-pulse rounded-lg bg-ink-100 lg:h-96 lg:rounded-card" />
        <CardSkeleton count={6} cols="rail" />
      </div>
    </div>
  );
}
