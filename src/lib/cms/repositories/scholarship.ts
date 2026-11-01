import { cmsCollection, cmsFetch, cmsFetchOptional, searchTerm, type CmsQuery } from '../client';
import { collectionTag, entryTag } from '../tags';
import type { Media, Pagination, Seo, StrapiEntry } from '../types';
import type { ContentSectionRef } from './university';

/**
 * Scholarships. The CMS content type is `scheme`; the site calls them
 * scholarships throughout, so the mapping is contained here.
 */

export interface ScholarshipCard extends StrapiEntry {
  name: string;
  full_name: string | null;
  slug: string;
  city: string | null;
  state: string | null;
  country: string | null;
  establish: string | null;
  rating: number | null;
  show_apply_button: boolean;
  apply_button_text: string | null;
  view_button_text: string | null;
  image: Media | null;
  logo: Media | null;
}

export interface ScholarshipDetail extends ScholarshipCard {
  address: string | null;
  pincode: string | null;
  heading: string | null;
  seo: Seo | null;
  university_contents: ContentSectionRef[];
}

export interface ScholarshipListParams {
  page?: number;
  pageSize?: number;
  state?: string;
  search?: string;
}

const DEFAULT_PAGE_SIZE = 24;

function buildFilters(params: ScholarshipListParams): CmsQuery['filters'] {
  const filters: Record<string, unknown> = {};

  if (params.state) filters.state = { $eqi: params.state };

  const term = searchTerm(params.search);
  if (term) {
    filters.$or = [{ name: { $containsi: term } }, { full_name: { $containsi: term } }];
  }

  return filters;
}

export async function listScholarships(params: ScholarshipListParams = {}): Promise<{
  scholarships: ScholarshipCard[];
  pagination: Pagination;
}> {
  const term = searchTerm(params.search);

  const { data, meta } = await cmsCollection<ScholarshipCard>(
    '/schemes',
    {
      filters: buildFilters(params),
      sort: 'name:asc',
      pagination: {
        page: params.page ?? 1,
        pageSize: Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, 100),
      },
    },
    {
      tags: [collectionTag('scheme')],
      // A typed query is one-off and unbounded in variety, so caching one
      // would fill the data cache with single-use entries. 0 prevents that;
      // `false` would mean the opposite — cache it forever.
      revalidate: term ? 0 : undefined,
    }
  );

  return { scholarships: data, pagination: meta.pagination };
}

export async function getScholarshipBySlug(slug: string): Promise<ScholarshipDetail | null> {
  try {
    const json = await cmsFetch<{ data: ScholarshipDetail }>(
      `/schemes/slug/${encodeURIComponent(slug)}`,
      undefined,
      { tags: [collectionTag('scheme'), entryTag('scheme', slug)] }
    );
    return json.data ?? null;
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 404) return null;
    throw error;
  }
}

export async function getScholarshipSlugs(limit = 100): Promise<string[]> {
  return cmsFetchOptional(async () => {
    const { data } = await cmsCollection<{ slug: string }>(
      '/schemes',
      { fields: ['slug'], sort: 'updatedAt:desc', pagination: { pageSize: limit } },
      { tags: [collectionTag('scheme')] }
    );
    return data.map((entry) => entry.slug).filter(Boolean);
  }, []);
}
