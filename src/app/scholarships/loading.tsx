import { CardSkeleton } from '@/components/ui/card-skeleton';

/**
 * The listing reads searchParams, so it is dynamic: without this, clicking a
 * page number left the previous results on screen with nothing to say the
 * click had landed. No rail here, so the grid runs the full width.
 */
export default function Loading() {
  return (
    <div aria-hidden="true" className="container-page py-10 lg:py-14">
      <div className="mb-6 h-5 w-48 max-w-full animate-pulse rounded-md bg-ink-100" />
      <div className="h-9 w-72 max-w-full animate-pulse rounded-lg bg-ink-200" />
      <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded-md bg-ink-100" />

      <div className="mt-8">
        <CardSkeleton count={6} cols="wide" />
      </div>
    </div>
  );
}
