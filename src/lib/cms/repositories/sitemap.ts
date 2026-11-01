import { cmsCollection, cmsFetch, cmsFetchOptional } from '../client';
import { collectionTag, type Model } from '../tags';

/**
 * Sitemap source data.
 *
 * Separate from the page repositories because a sitemap needs only two fields
 * across thousands of rows — pulling full card payloads to build one would be
 * enormously wasteful.
 */

export interface SitemapEntry {
  slug: string;
  updatedAt: string;
}

/** Strapi's REST maximum; config/api.ts caps `maxLimit` at 240. */
const PAGE_SIZE = 200;

/**
 * Pages through a collection until it is exhausted. A sitemap has to be
 * complete — silently truncating at the first page would drop most of a large
 * catalogue from the index.
 */
async function allEntries(path: string, model: Model): Promise<SitemapEntry[]> {
  return cmsFetchOptional(async () => {
    const entries: SitemapEntry[] = [];

    for (let page = 1; ; page += 1) {
      const { data, meta } = await cmsCollection<SitemapEntry>(
        path,
        {
          fields: ['slug', 'updatedAt'],
          sort: 'updatedAt:desc',
          pagination: { page, pageSize: PAGE_SIZE },
        },
        { tags: [collectionTag(model)] }
      );

      entries.push(...data.filter((entry) => entry.slug));

      if (page >= meta.pagination.pageCount || data.length === 0) break;
      // A guard against a pageCount that never terminates.
      if (page > 100) break;
    }

    return entries;
  }, []);
}

export const getUniversityEntries = () => allEntries('/universities', 'university');
export const getProgramEntries = () => allEntries('/programs', 'program');
export const getExamEntries = () => allEntries('/examinations', 'examination');
export const getScholarshipEntries = () => allEntries('/schemes', 'scheme');
export const getQuestionEntries = () => allEntries('/questions', 'question');
export const getLegalEntries = () => allEntries('/legals', 'legal');
export const getMasterEntries = () => allEntries('/masters', 'master');

/** Blog posts, split by the `type` that decides which route serves them. */
export async function getBlogEntries(): Promise<
  { section: 'articles' | 'news' | 'blogs'; entries: SitemapEntry[] }[]
> {
  return cmsFetchOptional(async () => {
    const byType: Record<string, SitemapEntry[]> = {};

    for (let page = 1; ; page += 1) {
      const { data, meta } = await cmsCollection<SitemapEntry & { type: string | null }>(
        '/blogs',
        {
          fields: ['slug', 'updatedAt', 'type'],
          sort: 'updatedAt:desc',
          pagination: { page, pageSize: PAGE_SIZE },
        },
        { tags: [collectionTag('blog')] }
      );

      for (const entry of data) {
        if (!entry.slug || !entry.type) continue;
        (byType[entry.type] ??= []).push({ slug: entry.slug, updatedAt: entry.updatedAt });
      }

      if (page >= meta.pagination.pageCount || data.length === 0) break;
      if (page > 100) break;
    }

    // Matches BLOG_SECTIONS: press releases are served by the news route, so
    // they belong under that prefix in the sitemap too.
    return [
      { section: 'articles' as const, entries: byType.Articles ?? [] },
      {
        section: 'news' as const,
        entries: [...(byType.News ?? []), ...(byType['Press release'] ?? [])],
      },
      { section: 'blogs' as const, entries: byType.Blog ?? [] },
    ];
  }, []);
}

export interface SectionEntry {
  ownerSlug: string;
  sectionSlug: string;
  updatedAt: string;
}

/**
 * Section slugs for one entity's tab pages. These are real, indexable URLs, so
 * leaving them out would hide most of the site's content from search engines.
 *
 * Uses the CMS's dedicated index route: the ordinary find route carries the
 * detail populate preset, which would drag every section's dynamic zone across
 * the wire just to build a list of paths.
 */
export async function getContentSectionEntries(
  owner: 'university' | 'program' | 'examination' | 'scheme'
): Promise<SectionEntry[]> {
  return cmsFetchOptional(async () => {
    const json = await cmsFetch<{ data: SectionEntry[] }>(
      '/university-contents/index',
      { owner },
      { tags: [collectionTag('university-content')] }
    );
    return json.data ?? [];
  }, []);
}
