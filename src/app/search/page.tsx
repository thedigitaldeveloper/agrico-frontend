import type { Metadata } from 'next';
import Link from 'next/link';

import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { one, type SearchParams } from '@/components/ui/pagination';
import { search, type SearchGroup } from '@/lib/cms/repositories/search';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Search',
  description: 'Search universities, programmes, entrance exams, scholarships and blogs.',
  path: '/search',
});

/**
 * How many hits a group shows before the rest go behind a disclosure. Six
 * groups returning everything they matched buries the last group a screen or
 * two down, and the groups are ranked, so the tail is the least relevant part.
 */
const VISIBLE_PER_GROUP = 5;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = one(params.q) ?? '';
  const { groups, total } = await search(query);

  return (
    <div className="container-page rs-listing">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Search"
          description="Universities, programmes, entrance exams, scholarships and blogs — all in one place."
          align="center"
        />

        {/* A plain GET form: the query lives in the URL, so results are
            shareable and the page needs no client JavaScript. */}
        <form action="/search" method="get" role="search" className="mt-6 flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Universities, courses, exams, scholarships…"
            aria-label="Search"
            // h-12/text-base rather than the shared control scale: this input is
            // half of a single control with the Button beside it, and the two
            // have to agree on a height to read as one.
            className="h-12 w-full rounded-lg border border-ink-300 bg-white px-4 text-base placeholder:text-ink-400 focus-visible:border-brand-600"
          />
          <Button type="submit" size="lg">
            Search
          </Button>
        </form>

        {query.trim().length < 2 ? (
          <p className="mt-8 text-ink-600">Type at least two characters to search.</p>
        ) : total === 0 ? (
          <EmptyState
            className="mt-8"
            title={`No results for “${query}”`}
            description="Try a different spelling, or a broader term — a stream or a course name usually matches more than a full college name does."
            action={<ButtonLink href="/universities">Browse universities</ButtonLink>}
            secondaryAction={
              <ButtonLink href="/programs" variant="outline">
                Browse programs
              </ButtonLink>
            }
          />
        ) : (
          <>
            <p className="mt-6 text-sm text-ink-500">
              {total} {total === 1 ? 'result' : 'results'} for “{query}”
            </p>

            <div className="mt-8 space-y-10">
              {groups.map((group) => {
                const visible = group.results.slice(0, VISIBLE_PER_GROUP);
                const hidden = group.results.slice(VISIBLE_PER_GROUP);

                return (
                  <section key={group.label}>
                    <h2 className="font-display text-sm font-bold tracking-wide text-ink-900 uppercase">
                      {group.label}
                      <span className="text-ink-400"> · {group.results.length}</span>
                    </h2>

                    <div className="mt-3 overflow-hidden rounded-card border border-ink-200 bg-white">
                      <ul className="divide-y divide-ink-100">
                        {visible.map((result) => (
                          <ResultRow key={result.href} result={result} />
                        ))}
                      </ul>

                      {hidden.length > 0 ? (
                        // Native <details>, so the tail costs no client
                        // JavaScript and is still in the document for search
                        // engines and for in-page find.
                        <details className="group border-t border-ink-100">
                          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-sm font-semibold text-brand-800 transition-colors marker:content-none hover:bg-brand-50 [&::-webkit-details-marker]:hidden">
                            <span className="group-open:hidden">Show {hidden.length} more</span>
                            <span className="hidden group-open:inline">Show fewer</span>
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              className="size-3 fill-none stroke-current stroke-2 transition-transform group-open:rotate-180"
                            >
                              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </summary>
                          <ul className="divide-y divide-ink-100 border-t border-ink-100">
                            {hidden.map((result) => (
                              <ResultRow key={result.href} result={result} />
                            ))}
                          </ul>
                        </details>
                      ) : null}
                    </div>
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResultRow({ result }: { result: SearchGroup['results'][number] }) {
  return (
    <li>
      <Link href={result.href} className="block px-5 py-4 transition-colors hover:bg-brand-50">
        <span className="block font-semibold text-ink-900">{result.title}</span>
        {result.subtitle ? (
          <span className="mt-0.5 block line-clamp-1 text-sm text-ink-600">{result.subtitle}</span>
        ) : null}
      </Link>
    </li>
  );
}
