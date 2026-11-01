import { Button, ButtonLink } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  /** Wired to the error boundary's retry. Omitted, the retry button is not shown. */
  onRetry?: () => void;
  homeHref?: string;
  homeLabel?: string;
  /**
   * Drops to h2 for a boundary nested inside a layout that survives the error
   * and already renders an h1 of its own.
   */
  headingLevel?: 1 | 2;
}

/**
 * Shared body for the route error boundaries.
 *
 * Deliberately free of hooks and of its own 'use client' directive so a client
 * boundary can render it and a server component can too — the only client-side
 * thing about it is the retry callback the boundary passes in.
 */
export function ErrorState({
  title = 'Something went wrong',
  description = 'That page could not be loaded. It is usually temporary — trying again often works.',
  onRetry,
  homeHref = '/',
  homeLabel = 'Go to the homepage',
  headingLevel = 1,
}: ErrorStateProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center lg:py-24">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-danger-50 text-danger-700">
        <WarningIcon />
      </div>

      <Heading className="mt-6 text-2xl font-bold text-ink-900">{title}</Heading>
      <p className="mt-3 text-base leading-relaxed text-ink-600">{description}</p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {onRetry ? <Button onClick={onRetry}>Try again</Button> : null}
        <ButtonLink href={homeHref} variant="outline">
          {homeLabel}
        </ButtonLink>
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-6"
      aria-hidden="true"
    >
      <path d="M12 3.5 2.5 20h19L12 3.5Z" strokeLinejoin="round" />
      <path d="M12 9.5v4" strokeLinecap="round" />
      <path d="M12 17h.01" strokeLinecap="round" />
    </svg>
  );
}
