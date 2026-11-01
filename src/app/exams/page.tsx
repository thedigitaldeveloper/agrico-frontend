import type { Metadata } from 'next';

import { ExamCard } from '@/components/exam/exam-card';
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
import { listExams } from '@/lib/cms/repositories/exam';
import { listTaxonomy } from '@/lib/cms/repositories/taxonomy';
import { cn } from '@/lib/cn';
import { buildMetadata } from '@/lib/metadata';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema } from '@/lib/seo/schemas';

const BASE = '/exams';

/** One array for the visible trail and the JSON-LD, so the two cannot drift. */
const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Exams', path: BASE },
];

export const metadata: Metadata = buildMetadata({
  title: 'Entrance Exams — Dates, Eligibility & Application',
  description:
    'Track entrance exam dates, eligibility, registration fees and application windows for India’s major university entrance tests.',
  path: BASE,
});

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(one(params.page) ?? 1) || 1);
  const stream = one(params.stream);

  // Under two characters a query matches most of the catalogue, so it counts as
  // no query at all — the threshold /search set and the repository repeats.
  const typed = one(params.q)?.trim() ?? '';
  const query = typed.length >= 2 ? typed : undefined;

  const [{ exams, pagination }, streams] = await Promise.all([
    listExams({ page, stream, search: query, pageSize: 12 }),
    listTaxonomy('streams', 20),
  ]);

  // The taxonomy read is optional, so a slug that resolves to nothing still
  // gets a readable chip: itself. Never an empty one.
  const streamLabel = stream
    ? (streams.find((term) => term.slug === stream)?.name ?? stream)
    : undefined;

  const applied = [
    // Coarsest cut first: a query reaches across the whole catalogue, a stream
    // only sorts it.
    ...(query ? [{ param: 'q', label: 'Search', display: query }] : []),
    ...(streamLabel ? [{ param: 'stream', label: 'Stream', display: streamLabel }] : []),
  ];

  // FilterGroup renders nothing on an empty options array, so without this the
  // rail would reserve a 16rem column of blank space whenever the CMS is down.
  const hasFilters = streams.length > 0;

  // Two narrowings that read differently — "3 exams matching “cuet” in
  // Engineering" — so each earns its own clause rather than one shared one.
  const focus = `${query ? ` matching “${query}”` : ''}${streamLabel ? ` in ${streamLabel}` : ''}`;

  const description =
    `${pagination.total} ${pagination.total === 1 ? 'exam' : 'exams'}${focus} with ` +
    'application windows, eligibility and important dates in one place.';

  return (
    <div className="container-page rs-listing">
      <JsonLdGraph items={[breadcrumbSchema(CRUMBS)]} />

      <PageHeader
        title="Entrance Exams"
        description={description}
        crumbs={CRUMBS}
        count={{
          total: pagination.total,
          page: pagination.page,
          pageSize: pagination.pageSize,
          noun: ['exam', 'exams'],
        }}
      >
        <ActiveFilters basePath={BASE} current={params} applied={applied} />
      </PageHeader>

      <div className={cn('rs-listing-layout grid', hasFilters && 'lg:grid-cols-[16rem_1fr]')}>
        {hasFilters ? (
          // Counts what the panel itself holds rather than `applied`: the query
          // lives in the box above the results, so counting it here would
          // promise a filter the opened panel does not contain.
          <FilterPanel activeCount={streamLabel ? 1 : 0}>
            <FilterGroup basePath={BASE} title="Stream" param="stream" active={stream} options={streams} current={params} />
          </FilterPanel>
        ) : null}

        <div>
          <ListSearch
            basePath={BASE}
            current={params}
            label="Search exams"
            placeholder="Search exams by name"
            className="mt-0 mb-6"
          />

          {exams.length > 0 ? (
            <CardGrid items={exams} getKey={(exam) => exam.documentId} cols="rail" label="Exams">
              {(exam) => <ExamCard exam={exam} />}
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
            // Ahead of the filter branch: when a query is what emptied the
            // page, "no exams match these filters" points at the wrong control
            // and its Clear filters throws away the stream as well.
            <EmptyState
              title={`Nothing matches “${query}”`}
              description="Try a shorter term, or the exam’s short name — most tests are listed by their acronym."
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
              title="No exams match these filters"
              description="Removing the stream usually brings results back."
              action={
                <ButtonLink href={BASE} variant="outline">
                  Clear filters
                </ButtonLink>
              }
            />
          ) : (
            <EmptyState
              title="No exams published yet"
              description="This section is still being filled in. Program pages list the entrance tests each one accepts."
              secondaryAction={
                <ButtonLink href="/programs" variant="outline">
                  Browse programs
                </ButtonLink>
              }
            />
          )}

          <Pagination basePath={BASE} page={pagination.page} pageCount={pagination.pageCount} current={params} />
        </div>
      </div>
    </div>
  );
}
