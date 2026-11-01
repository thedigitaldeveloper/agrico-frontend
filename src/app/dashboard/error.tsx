'use client';

import { ErrorState } from '@/components/ui/error-state';

/**
 * Scoped to the dashboard segment, so a failed CMS read keeps the tabs, the
 * account header and the sign-out button on screen — everything the layout
 * rendered before the failure — instead of dropping the visitor onto the
 * framework's own blank error page.
 *
 * Next 16 passes `retry`; the older `reset` name is silently ignored, which
 * would leave the button dead exactly when it is needed.
 */
export default function DashboardError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <ErrorState
      title="That did not load"
      description="Your session data could not be fetched. This is usually temporary."
      onRetry={retry}
      // The layout survives the failure, so the way out is back into the
      // dashboard rather than off it — and its own h1 is still on screen.
      homeHref="/dashboard"
      homeLabel="Back to the dashboard"
      headingLevel={2}
    />
  );
}
