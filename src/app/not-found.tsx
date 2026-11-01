import { Button, ButtonLink } from '@/components/ui/button';

/**
 * Serves both halves of a 404: the routes that call notFound() for a mistyped
 * or de-published slug, and every URL that matches no route at all. That second
 * audience is why the copy stays generic — it cannot assume the visitor was
 * after a university rather than an exam or an article.
 */
export default function NotFound() {
  return (
    <div className="container-page py-14 lg:py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">Error 404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-balance lg:text-4xl">
          We could not find that page
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-600">
          The address may be mistyped, or the page may have moved since the link was made. Search
          for what you were after, or pick up from one of the catalogues below.
        </p>

        {/* A plain GET form onto /search, so the page that catches every dead
            link costs no client JavaScript to render. */}
        <form
          action="/search"
          method="get"
          role="search"
          className="mt-8 flex max-w-lg gap-2"
        >
          <input
            type="search"
            name="q"
            placeholder="Universities, courses, exams, scholarships…"
            aria-label="Search"
            // The same h-12/text-base as /search: the input and the Button
            // beside it are halves of one control and have to agree on a height.
            className="h-12 w-full rounded-lg border border-ink-300 bg-white px-4 text-base placeholder:text-ink-400 focus-visible:border-brand-600"
          />
          <Button type="submit" size="lg">
            Search
          </Button>
        </form>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/universities">Browse universities</ButtonLink>
          <ButtonLink href="/programs" variant="outline">
            Browse programs
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
