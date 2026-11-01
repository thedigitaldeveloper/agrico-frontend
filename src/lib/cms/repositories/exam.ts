import { cmsCollection, cmsFetch, cmsFetchOptional, searchTerm, type CmsQuery } from '../client';
import { collectionTag, entryTag } from '../tags';
import type { Media, Pagination, Seo, StrapiEntry } from '../types';
import type { ContentSectionRef, Taxonomy, UniversityCard } from './university';

/**
 * Entrance exams. The CMS calls this content type `examination`; `exam` is a
 * separate, much smaller taxonomy used to tag universities and programs.
 */

export interface ExamCard extends StrapiEntry {
  name: string;
  slug: string;
  full_name: string | null;
  exam_mode: 'Online' | 'Offline' | null;
  form_start_date: string | null;
  form_closing_date: string | null;
  admit_card_date: string | null;
  examination_date: string | null;
  registration_fee: string | null;
  position: number | null;
  logo: Media | null;
  streams: Taxonomy[];
  courses: Taxonomy[];
  tags: Taxonomy[];
}

export interface ImportantLink {
  id: number;
  name: string | null;
  link: string | null;
}

export interface ExamDetail extends ExamCard {
  description: string | null;
  eligibility: string | null;
  seo: Seo | null;
  important_links: ImportantLink[];
  universities: UniversityCard[];
  university_contents: ContentSectionRef[];
}

export interface ExamListParams {
  page?: number;
  pageSize?: number;
  stream?: string;
  search?: string;
}

const DEFAULT_PAGE_SIZE = 24;

function buildFilters(params: ExamListParams): CmsQuery['filters'] {
  const filters: Record<string, unknown> = {};

  if (params.stream) filters.streams = { slug: { $eq: params.stream } };

  const term = searchTerm(params.search);
  if (term) {
    filters.$or = [{ name: { $containsi: term } }, { full_name: { $containsi: term } }];
  }

  return filters;
}

export async function listExams(params: ExamListParams = {}): Promise<{
  exams: ExamCard[];
  pagination: Pagination;
}> {
  const term = searchTerm(params.search);

  const { data, meta } = await cmsCollection<ExamCard>(
    '/examinations',
    {
      filters: buildFilters(params),
      sort: 'position:asc',
      pagination: {
        page: params.page ?? 1,
        pageSize: Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, 100),
      },
    },
    {
      tags: [collectionTag('examination')],
      // A typed query is one-off and unbounded in variety, so caching one
      // would fill the data cache with single-use entries. 0 prevents that;
      // `false` would mean the opposite — cache it forever.
      revalidate: term ? 0 : undefined,
    }
  );

  return { exams: data, pagination: meta.pagination };
}

export async function getExamBySlug(slug: string): Promise<ExamDetail | null> {
  try {
    const json = await cmsFetch<{ data: ExamDetail }>(
      `/examinations/slug/${encodeURIComponent(slug)}`,
      undefined,
      { tags: [collectionTag('examination'), entryTag('examination', slug)] }
    );
    return json.data ?? null;
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 404) return null;
    throw error;
  }
}

export async function getExamSlugs(limit = 100): Promise<string[]> {
  return cmsFetchOptional(async () => {
    const { data } = await cmsCollection<{ slug: string }>(
      '/examinations',
      { fields: ['slug'], sort: 'updatedAt:desc', pagination: { pageSize: limit } },
      { tags: [collectionTag('examination')] }
    );
    return data.map((entry) => entry.slug).filter(Boolean);
  }, []);
}
