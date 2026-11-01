import Link from 'next/link';

import { PostCard } from '@/components/blog/post-card';
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
import { listBlogs, type BlogSection } from '@/lib/cms/repositories/blog';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema } from '@/lib/seo/schemas';

/** Blogs and news remain distinct feeds from the shared CMS collection. */
const SECTIONS: {
  section: BlogSection;
  label: string;
  noun: [singular: string, plural: string];
}[] = [
  { section: 'news', label: 'News', noun: ['story', 'stories'] },
  { section: 'blogs', label: 'Blogs', noun: ['blog', 'blogs'] },
];

const PILL =
  'inline-flex min-h-11 items-center rounded-lg border border-ink-200 bg-white px-5 py-2.5 text-sm text-ink-700 ' +
  'transition-colors hover:border-brand-300 hover:text-brand-800 ' +
  'aria-[current]:border-brand-800 aria-[current]:bg-brand-800 aria-[current]:font-semibold aria-[current]:text-white';

/** Editorial listing with section-specific search, pagination and empty states. */
export async function PostListing({
  section,
  title,
  description,
  searchParams,
}: {
  section: BlogSection;
  title: string;
  description: string;
  searchParams: SearchParams;
}) {
  const base = `/${section}`;
  const page = Math.max(1, Number(one(searchParams.page) ?? 1) || 1);

  // Below two characters a query matches most of the archive, so it counts as
  // no query at all — the same line /search and the repository both draw.
  const typed = one(searchParams.q)?.trim() ?? '';
  const query = typed.length >= 2 ? typed : undefined;

  const { posts, pagination } = await listBlogs({
    section,
    page,
    pageSize: 12,
    search: query,
  });

  const active = SECTIONS.find((item) => item.section === section) ?? SECTIONS[0];
  const others = SECTIONS.filter((item) => item.section !== section);
  const trail = [
    { name: 'Home', path: '/' },
    { name: title, path: base },
  ];

  const applied = query ? [{ param: 'q', label: 'Search', display: query }] : [];

  // The caller's blurb describes the whole section, which reads as if the
  // search did nothing once one is running.
  const blurb = query
    ? `${description} Showing only ${active.noun[1]} matching “${query}”.`
    : description;

  return (
    <div className="container-page rs-listing rs-editorial-listing">
      <JsonLdGraph items={[breadcrumbSchema(trail)]} />

      <PageHeader
        title={title}
        description={blurb}
        crumbs={trail}
        count={{
          total: pagination.total,
          page: pagination.page,
          pageSize: pagination.pageSize,
          noun: active.noun,
        }}
      >
        <ActiveFilters basePath={base} current={searchParams} applied={applied} />
      </PageHeader>

      <nav aria-label="Editorial sections" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {SECTIONS.map((item) => (
            <li key={item.section}>
              <Link
                href={`/${item.section}`}
                aria-current={item.section === section ? 'page' : undefined}
                className={PILL}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* The search is scoped to the section above it, so it belongs under the
          switcher rather than beside the heading. */}
      <ListSearch
        basePath={base}
        current={searchParams}
        label={`Search ${active.noun[1]}`}
        placeholder={`Search ${active.noun[1]} by title`}
      />

      <div className="mt-8">
        {posts.length === 0 && pagination.total > 0 ? (
          <EmptyState
            title="That page is past the end of the results"
            description={`This listing only goes up to page ${pagination.pageCount}.`}
            action={
              <ButtonLink
                href={buildListHref(base, searchParams, { page: null })}
                variant="outline"
              >
                Back to the first page
              </ButtonLink>
            }
          />
        ) : posts.length === 0 && query ? (
          <EmptyState
            title={`Nothing matches “${query}”`}
            description={
              `No ${active.noun[1]} in this section mention that — each section is ` +
              'searched on its own, so the rest of the site may still have something.'
            }
            action={
              <ButtonLink
                href={buildListHref(base, searchParams, { q: null })}
                variant="outline"
              >
                Clear the search
              </ButtonLink>
            }
            secondaryAction={
              <ButtonLink
                href={`/search?q=${encodeURIComponent(query)}`}
                variant="outline"
              >
                Search the whole site
              </ButtonLink>
            }
          />
        ) : posts.length === 0 ? (
          <EmptyState
            title="Nothing published here yet"
            description="Explore the other editorial section or browse programmes while new posts are being prepared."
            action={
              <ButtonLink href={`/${others[0].section}`} variant="outline">
                Read {others[0].label}
              </ButtonLink>
            }
            secondaryAction={
              <ButtonLink href="/programs" variant="outline">
                Explore programmes
              </ButtonLink>
            }
          />
        ) : (
          <CardGrid
            items={posts}
            getKey={(post) => post.documentId}
            cols="wide"
            label={title}
            className="gap-6 lg:gap-8 [&>li]:min-w-0"
          >
            {(post) => <PostCard post={post} section={section} />}
          </CardGrid>
        )}

        <Pagination
          basePath={base}
          page={pagination.page}
          pageCount={pagination.pageCount}
          current={searchParams}
        />
      </div>
    </div>
  );
}
