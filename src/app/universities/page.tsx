import type { Metadata } from 'next';

import { ActiveFilters } from '@/components/ui/active-filters';
import { ButtonLink } from '@/components/ui/button';
import { CardGrid } from '@/components/ui/card-grid';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterPanel } from '@/components/ui/filter-panel';
import { ListSearch } from '@/components/ui/list-search';
import { PageHeader } from '@/components/ui/page-header';
import {
  FilterGroup,
  Pagination,
  buildListHref,
  one,
  type SearchParams,
} from '@/components/ui/pagination';
import { UniversityCard } from '@/components/university/university-card';
import { listTaxonomy } from '@/lib/cms/repositories/taxonomy';
import { listUniversities } from '@/lib/cms/repositories/university';
import { cn } from '@/lib/cn';
import { buildMetadata } from '@/lib/metadata';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema } from '@/lib/seo/schemas';

const BASE = '/universities';

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Universities', path: BASE },
];

export const metadata: Metadata = buildMetadata({
  title: 'Universities in India — Compare Fees, Rankings & Approvals',
  description:
    'Browse verified universities across India. Filter by stream, ownership and approval, and compare them on the factors that matter.',
  path: BASE,
});

export default async function UniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const page = Math.max(1, Number(one(params.page) ?? 1) || 1);
  const stream = one(params.stream);
  const ownership = one(params.ownership);
  const approval = one(params.approval);
  const sort = one(params.sort) ?? 'position:asc';

  const typed = one(params.q)?.trim() ?? '';
  const query = typed.length >= 2 ? typed : undefined;

  const [{ universities, pagination }, streams, ownershipTypes, approvals] = await Promise.all([
    listUniversities({
      page,
      stream,
      ownership,
      approval,
      sort,
      search: query,
      pageSize: 12,
    }),
    listTaxonomy('streams', 20),
    listTaxonomy('ownership-types', 10),
    listTaxonomy('approvals', 12),
  ]);

  const applied = [
    ...(query ? [{ param: 'q', label: 'Search', display: query }] : []),
    ...(stream
      ? [
          {
            param: 'stream',
            label: 'Stream',
            display: streams.find((term) => term.slug === stream)?.name ?? stream,
          },
        ]
      : []),
    ...(ownership
      ? [
          {
            param: 'ownership',
            label: 'Ownership',
            display:
              ownershipTypes.find((term) => term.slug === ownership)?.name ?? ownership,
          },
        ]
      : []),
    ...(approval
      ? [
          {
            param: 'approval',
            label: 'Approval',
            display:
              approvals.find((term) => term.slug === approval)?.name ?? approval,
          },
        ]
      : []),
  ];

  const facets = applied.filter((chip) => chip.param !== 'q');
  const hasFilters = streams.length > 0 || ownershipTypes.length > 0 || approvals.length > 0;

  const focus =
    facets.length === 1 && facets[0].param === 'stream' ? ` in ${facets[0].display}` : '';

  const description =
    `${pagination.total} verified ${pagination.total === 1 ? 'university' : 'universities'}` +
    `${focus}${query ? ` matching “${query}”` : ''}` +
    ', compared on fees, approvals, rankings and outcomes.';

  return (
    <div className="container-page rs-listing rs-university-listing">
      <JsonLdGraph items={[breadcrumbSchema(CRUMBS)]} />

      <PageHeader
        title="Universities in India"
        description={description}
        crumbs={CRUMBS}
        count={{
          total: pagination.total,
          page: pagination.page,
          pageSize: pagination.pageSize,
          noun: ['university', 'universities'],
        }}
      >
        <ActiveFilters basePath={BASE} current={params} applied={applied} />
      </PageHeader>

      <div className={cn('rs-listing-layout grid', hasFilters && 'lg:grid-cols-[16rem_1fr]')}>
        {hasFilters ? (
          <FilterPanel activeCount={facets.length}>
            <FilterGroup
              basePath={BASE}
              title="Stream"
              param="stream"
              active={stream}
              options={streams}
              current={params}
            />
            <FilterGroup
              basePath={BASE}
              title="Ownership"
              param="ownership"
              active={ownership}
              options={ownershipTypes}
              current={params}
            />
            <FilterGroup
              basePath={BASE}
              title="Approvals & Accreditation"
              param="approval"
              active={approval}
              options={approvals}
              current={params}
            />
          </FilterPanel>
        ) : null}

        <div>
          <ListSearch
            basePath={BASE}
            current={params}
            placeholder="Search universities by name"
            label="Search universities"
            className="mt-0 mb-6"
          />

          {universities.length > 0 ? (
            <CardGrid
              items={universities}
              getKey={(university) => university.documentId}
              cols="rail"
              label="Universities"
            >
              {(university) => <UniversityCard university={university} />}
            </CardGrid>
          ) : pagination.total > 0 ? (
            <EmptyState
              title="That page is past the end of the results"
              description={`This listing only goes up to page ${pagination.pageCount}.`}
              action={
                <ButtonLink
                  href={buildListHref(BASE, params, { page: null })}
                  variant="outline"
                >
                  Back to the first page
                </ButtonLink>
              }
            />
          ) : query ? (
            <EmptyState
              title={`Nothing matches “${query}”`}
              description={
                facets.length > 0
                  ? 'Try a different spelling, or clear the search to see the filtered listing again.'
                  : 'Try a shorter query, or a different spelling.'
              }
              action={
                <ButtonLink
                  href={buildListHref(BASE, params, { q: null })}
                  variant="outline"
                >
                  Clear the search
                </ButtonLink>
              }
            />
          ) : applied.length > 0 ? (
            <EmptyState
              title="No universities match these filters"
              description="Removing one of them usually brings results back."
              action={
                <ButtonLink href={BASE} variant="outline">
                  Clear filters
                </ButtonLink>
              }
            />
          ) : (
            <EmptyState
              title="No universities published yet"
              description="This section is still being filled in. The programs listing already covers much of the same ground."
              secondaryAction={
                <ButtonLink href="/programs" variant="outline">
                  Browse programs
                </ButtonLink>
              }
            />
          )}

          <Pagination
            basePath={BASE}
            page={pagination.page}
            pageCount={pagination.pageCount}
            current={params}
          />
        </div>
      </div>
    </div>
  );
}
