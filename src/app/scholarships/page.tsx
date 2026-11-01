import type { Metadata } from 'next';

import { ScholarshipCard } from '@/components/scholarship/scholarship-card';
import { ActiveFilters } from '@/components/ui/active-filters';
import { ButtonLink } from '@/components/ui/button';
import { CardGrid } from '@/components/ui/card-grid';
import { EmptyState } from '@/components/ui/empty-state';
import { ListSearch } from '@/components/ui/list-search';
import { PageHeader } from '@/components/ui/page-header';
import {
  Pagination,
  buildListHref,
  one,
  type SearchParams,
} from '@/components/ui/pagination';
import { listScholarships } from '@/lib/cms/repositories/scholarship';
import { buildMetadata } from '@/lib/metadata';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema } from '@/lib/seo/schemas';

const BASE = '/scholarships';

/** One array for the visible trail and the JSON-LD, so the two cannot drift. */
const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Scholarships', path: BASE },
];

export const metadata: Metadata = buildMetadata({
  title: 'Scholarships in India — Eligibility, Amount & How to Apply',
  description:
    'Browse government and private scholarships for Indian students. Check eligibility, amounts and application deadlines.',
  path: BASE,
});

export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(one(params.page) ?? 1) || 1);
  const state = one(params.state);

  // Under two characters a query matches most of the catalogue, so it counts as
  // no query at all — the threshold /search set and the repository repeats.
  const typed = one(params.q)?.trim() ?? '';
  const query = typed.length >= 2 ? typed : undefined;

  const { scholarships, pagination } = await listScholarships({
    page,
    state,
    search: query,
    pageSize: 12,
  });

  // This listing has no rail, so a shared ?state= link would otherwise reduce
  // the results with nothing on the page to say so and no way back out. The
  // state is stored as its own display name, so it needs no lookup.
  const applied = [
    // Coarsest cut first: a query reaches across the whole catalogue, a state
    // only sorts it.
    ...(query ? [{ param: 'q', label: 'Search', display: query }] : []),
    ...(state ? [{ param: 'state', label: 'State', display: state }] : []),
  ];

  // Two narrowings that read differently — "3 scholarships matching “merit” in
  // Kerala" — so each earns its own clause rather than one shared one.
  const focus = `${query ? ` matching “${query}”` : ''}${state ? ` in ${state}` : ''}`;

  const description =
    `${pagination.total} ${pagination.total === 1 ? 'scholarship' : 'scholarships'}` +
    `${focus} with eligibility, amounts and deadlines.`;

  return (
    <div className="container-page rs-listing">
      <JsonLdGraph items={[breadcrumbSchema(CRUMBS)]} />

      <PageHeader
        title="Scholarships"
        description={description}
        crumbs={CRUMBS}
        count={{
          total: pagination.total,
          page: pagination.page,
          pageSize: pagination.pageSize,
          noun: ['scholarship', 'scholarships'],
        }}
      >
        <ActiveFilters basePath={BASE} current={params} applied={applied} />
      </PageHeader>

      <div className="mt-8">
        <ListSearch
          basePath={BASE}
          current={params}
          label="Search scholarships"
          placeholder="Search scholarships by name"
          className="mt-0 mb-6"
        />

        {scholarships.length > 0 ? (
          <CardGrid
            items={scholarships}
            getKey={(scholarship) => scholarship.documentId}
            cols="wide"
            label="Scholarships"
          >
            {(scholarship) => <ScholarshipCard scholarship={scholarship} />}
          </CardGrid>
        ) : pagination.total > 0 ? (
          <EmptyState
            title="That page is past the end of the results"
            description={`This listing only goes up to page ${pagination.pageCount}.`}
            action={
              <ButtonLink href={buildListHref(BASE, params, { page: null })} variant="outline">
                Back to the first page
              </ButtonLink>
            }
          />
        ) : query ? (
          // Ahead of the state branch: when a query is what emptied the page,
          // naming the state points at the wrong control and its Clear filters
          // throws the state away too.
          <EmptyState
            title={`Nothing matches “${query}”`}
            description="Try a shorter term, or a different spelling — schemes are often listed under their formal name."
            action={
              <ButtonLink href={buildListHref(BASE, params, { q: null })} variant="outline">
                Clear the search
              </ButtonLink>
            }
          />
        ) : state ? (
          <EmptyState
            title="No scholarships match these filters"
            description={`Nothing is listed for ${state} yet. National schemes are open to students everywhere.`}
            action={
              <ButtonLink href={BASE} variant="outline">
                Clear filters
              </ButtonLink>
            }
          />
        ) : (
          <EmptyState
            title="No scholarships have been published yet"
            description="This section is still being filled in. University pages list the funding each one offers."
            secondaryAction={
              <ButtonLink href="/universities" variant="outline">
                Browse universities
              </ButtonLink>
            }
          />
        )}

        <Pagination basePath={BASE} page={pagination.page} pageCount={pagination.pageCount} current={params} />
      </div>
    </div>
  );
}
