import { Button } from '@/components/ui/button';
import { one, type SearchParams } from '@/components/ui/pagination';
import { cn } from '@/lib/cn';

/**
 * The text search that sits on top of a listing.
 *
 * A plain GET form, the same shape /search and the homepage hero already use:
 * the query lands in the URL as `q`, so a search is shareable, survives a
 * reload and costs no client JavaScript. Filtering is not this component's
 * job — the listing reads `q` back out of searchParams and hands it to its
 * repository, which is also where a query under two characters is treated as
 * no query at all.
 */
export function ListSearch({
  basePath,
  current,
  placeholder = 'Search…',
  label = 'Search',
  className,
}: {
  basePath: string;
  current: SearchParams;
  placeholder?: string;
  /** The accessible name; each listing says what it searches. */
  label?: string;
  className?: string;
}) {
  // The label has to point at an id, and a Server Component has no useId to
  // mint one; the base path is already unique to the listing rendering this.
  const inputId = `list-search-${basePath.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '')}`;

  return (
    <form
      action={basePath}
      method="get"
      role="search"
      // Names the landmark, so a screen reader's landmark list says which
      // catalogue this box searches rather than just "search".
      aria-label={label}
      className={cn('mt-6 flex flex-col gap-2 sm:flex-row', className)}
    >
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>

      <div className="relative w-full">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 fill-none stroke-current stroke-2 text-ink-400"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          id={inputId}
          type="search"
          name="q"
          defaultValue={one(current.q) ?? ''}
          placeholder={placeholder}
          // h-12/text-base rather than the shared control scale: the input is
          // half of a single control with the Button beside it, and the two
          // have to agree on a height to read as one.
          className="h-12 w-full rounded-lg border border-ink-300 bg-white pr-4 pl-11 text-base placeholder:text-ink-400 focus-visible:border-brand-600"
        />
      </div>

      <Button type="submit" size="lg" className="shrink-0">
        Search
      </Button>

      {/* A form submits its own fields and nothing else, so every other filter
          in the URL is re-sent by hand — searching inside a filtered listing
          would otherwise throw the filter away. `page` is the deliberate
          exception: page 4 of the old result set is an empty page of the new. */}
      {Object.entries(current).flatMap(([key, value]) => {
        if (key === 'q' || key === 'page' || value === undefined) return [];

        // One input per value. No listing emits a multi-value link today — the
        // pages read filters through `one()` — but a hand-edited or shared URL
        // can carry one, and a form that silently halved it would be the last
        // place anyone would look.
        return (Array.isArray(value) ? value : [value])
          .filter((entry) => entry !== '')
          .map((entry, index) => (
            <input key={`${key}-${index}`} type="hidden" name={key} value={entry} />
          ));
      })}
    </form>
  );
}
