'use client';

import { ErrorState } from '@/components/ui/error-state';

/**
 * The route boundary for everything below the root layout. Because it sits
 * inside that layout, a failed read loses the page body and keeps the header,
 * the footer and the skip link — the visitor is still somewhere they can
 * navigate from.
 *
 * There is deliberately no global-error.tsx beside it: the root layout renders
 * no data of its own and has nothing to throw.
 */
export default function RouteError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="container-page">
      <ErrorState onRetry={retry} />
    </div>
  );
}
