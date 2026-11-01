import type { Metadata } from 'next';

import { OfferingCard } from '@/components/rs/offering-card';
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
import { listRsOfferings } from '@/lib/cms/repositories/rs-catalogue';
import { listTaxonomy } from '@/lib/cms/repositories/taxonomy';
import { cn } from '@/lib/cn';
import { buildMetadata } from '@/lib/metadata';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema } from '@/lib/seo/schemas';

const BASE = '/programs';

/** One array for the visible trail and the JSON-LD, so the two cannot drift. */
const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Programs', path: BASE },
];

export const metadata: Metadata = buildMetadata({
  title: 'Programs & Courses — Compare Fees, Duration & Eligibility',
  description:
    'Browse degree, diploma and certificate programs across India. Compare fees, duration, mode and placement outcomes side by side.',
  path: BASE,
});

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const requestedPage = Number(one(params.page) ?? 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const stream = one(params.stream);
  const course = one(params.course);
  const program = one(params.program);
  const mode = one(params.mode);
  const level = one(params.level);

  // Under two characters a query matches most of the catalogue, so it counts as
  // no query at all — the line /search and the repositories already draw.
  const typed = one(params.q)?.trim() ?? '';
  const query = typed.length >= 2 ? typed : undefined;

  const [{ offerings, pagination }, streams, courses, modes, levels] = await Promise.all([
    listRsOfferings({ page, stream, course, program, mode, level, search: query, pageSize: 12 }),
    listTaxonomy('streams', 20),
    listTaxonomy('courses', 20),
    listTaxonomy('course-modes', 10),
    // Undergraduate/postgraduate. Recorded on the course, so the repository
    // matches it two hops out; the chip here is the same as any other.
    listTaxonomy('levels', 10),
  ]);

  const courseLabel = courses.find(term => term.slug === course)?.name ?? course;

  // The taxonomy reads are optional, so a slug that resolves to nothing still
  // gets a readable chip: itself. Never an empty one.
  const applied = [
    // First: a query cuts across every taxonomy the chips after it name.
    ...(query ? [{ param: 'q', label: 'Search', display: query }] : []),
    ...(program ? [{ param: 'program', label: 'Programme', display: offerings.find(offering => offering.programSlug === program)?.degree ?? program }] : []),
    ...(stream
      ? [
          {
            param: 'stream',
            label: 'Stream',
            display: streams.find((term) => term.slug === stream)?.name ?? stream,
          },
        ]
      : []),
    ...(course
      ? [
          {
            param: 'course',
            label: 'Course',
            display: courseLabel ?? course,
          },
        ]
      : []),
    ...(mode
      ? [
          {
            param: 'mode',
            label: 'Mode',
            display: modes.find((term) => term.slug === mode)?.name ?? mode,
          },
        ]
      : []),
    ...(level
      ? [
          {
            param: 'level',
            label: 'Level',
            display: levels.find((term) => term.slug === level)?.name ?? level,
          },
        ]
      : []),
  ];

  // The rail's own filters. The query is a chip like any other, but it sits
  // above the results rather than in the panel and earns its own clause in the
  // sentence below, so neither the panel's count nor the "in …" reading counts
  // it — a search inside a filtered listing would otherwise drop the reading.
  const facets = applied.filter((chip) => chip.param !== 'q');

  // FilterGroup renders nothing on an empty options array, so without this the
  // rail would reserve a 16rem column of blank space whenever the CMS is down.
  const hasFilters =
    streams.length > 0 || courses.length > 0 || modes.length > 0 || levels.length > 0;

  // A stream or a course reads naturally after "in"; the mode does not
  // ("in Online"), so it leaves the sentence alone.
  const focus =
    facets.length === 1 && facets[0].param !== 'mode' ? ` in ${facets[0].display}` : '';

  const description =
    `${pagination.total} ${pagination.total === 1 ? 'university programme' : 'university programmes'}` +
    `${focus}${query ? ` matching “${query}”` : ''}, ` +
    'with university-specific fees, duration and eligibility.';

  return (
    <div className="container-page rs-listing rs-programme-listing">
      <JsonLdGraph items={[breadcrumbSchema(CRUMBS)]} />

      <PageHeader
        title={courseLabel ? `${courseLabel} programmes` : 'Programmes & Courses'}
        description={description}
        crumbs={CRUMBS}
        count={{
          total: pagination.total,
          page: pagination.page,
          pageSize: pagination.pageSize,
          noun: ['university programme', 'university programmes'],
        }}
      >
        <ActiveFilters basePath={BASE} current={params} applied={applied} />
      </PageHeader>

      <div className={cn('rs-listing-layout grid', hasFilters && 'lg:grid-cols-[16rem_1fr]')}>
        {hasFilters ? (
          <FilterPanel activeCount={facets.length}>
            {/* First in the rail: level is the coarsest cut and the one a
                visitor already knows the answer to before they arrive. */}
            <FilterGroup basePath={BASE} title="Level" param="level" active={level} options={levels} current={params} />
            <FilterGroup basePath={BASE} title="Stream" param="stream" active={stream} options={streams} current={params} />
            <FilterGroup basePath={BASE} title="Course" param="course" active={course} options={courses} current={params} />
            <FilterGroup basePath={BASE} title="Mode" param="mode" active={mode} options={modes} current={params} />
          </FilterPanel>
        ) : null}

        <div>
          {/* Top of the results column, not the page: on a phone that puts the
              box under the collapsed Filters trigger and above the first card,
              and its own top margin would double the grid gap there. */}
          <ListSearch
            basePath={BASE}
            current={params}
            placeholder="Search programs by name"
            label="Search programs"
            className="mt-0 mb-6"
          />

          {offerings.length > 0 ? (
            <CardGrid
              items={offerings}
              getKey={(offering) => offering.id}
              cols="rail"
              label="University programmes"
              className="rs-programme-listing-grid"
            >
              {(offering) => <OfferingCard offering={offering} />}
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
            /* Before the filter branch: when a query is what emptied the page,
               "no programs match these filters" names the wrong culprit and
               offers a Clear all that throws the query away with everything. */
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
              title="No programs match these filters"
              description="Removing one of them usually brings results back."
              action={
                <ButtonLink href={BASE} variant="outline">
                  Clear filters
                </ButtonLink>
              }
            />
          ) : (
            <EmptyState
              title="No programs published yet"
              description="This section is still being filled in. The universities listing already names what each one offers."
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
    </div>
  );
}
