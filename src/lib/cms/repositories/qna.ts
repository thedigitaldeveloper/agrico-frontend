import { cmsCollection, cmsFetch, cmsFetchOptional, searchTerm } from '../client';
import { collectionTag, entryTag } from '../tags';
import type { Pagination, StrapiEntry } from '../types';
import type { Taxonomy } from './university';

/**
 * Q&A reads.
 *
 * Submissions are moderated by draft & publish in the CMS, so these only ever
 * return approved content — there is no "pending" state to filter for here.
 */

export interface Answer {
  id: number;
  documentId: string;
  body: string;
  author_name: string | null;
  is_expert: boolean;
  is_accepted: boolean;
  createdAt: string;
}

export interface QuestionCard extends StrapiEntry {
  title: string;
  slug: string;
  body: string | null;
  author_name: string | null;
  views: number;
  streams: Taxonomy[];
  courses: Taxonomy[];
  answers?: Answer[];
}

export interface QuestionDetail extends QuestionCard {
  answers: Answer[];
  universities: { documentId: string; name: string; slug: string }[];
}

export async function listQuestions({
  page = 1,
  pageSize = 15,
  stream,
  search,
}: {
  page?: number;
  pageSize?: number;
  stream?: string;
  search?: string;
} = {}): Promise<{
  questions: QuestionCard[];
  pagination: Pagination;
}> {
  const term = searchTerm(search);

  const filters: Record<string, unknown> = {};
  if (stream) filters.streams = { slug: { $eq: stream } };
  // The body matters as much as the title here: people search for the wording
  // of their own situation, which is rarely how anyone phrased a headline.
  if (term) {
    filters.$or = [{ title: { $containsi: term } }, { body: { $containsi: term } }];
  }

  const { data, meta } = await cmsCollection<QuestionCard>(
    '/questions',
    {
      filters,
      populate: {
        streams: true,
        courses: true,
        answers: true,
      },
      sort: 'createdAt:desc',
      pagination: { page, pageSize: Math.min(pageSize, 50) },
    },
    {
      tags: [collectionTag('question')],
      // A typed query is one-off and unbounded in variety, so caching one
      // would fill the data cache with single-use entries. 0 prevents that;
      // `false` would mean the opposite — cache it forever.
      revalidate: term ? 0 : undefined,
    }
  );

  return { questions: data, pagination: meta.pagination };
}

export async function getQuestionBySlug(slug: string): Promise<QuestionDetail | null> {
  try {
    const json = await cmsFetch<{ data: QuestionDetail }>(
      `/questions/slug/${encodeURIComponent(slug)}`,
      undefined,
      { tags: [collectionTag('question'), entryTag('question', slug)] }
    );
    return json.data ?? null;
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 404) return null;
    throw error;
  }
}

export async function getQuestionSlugs(limit = 100): Promise<string[]> {
  return cmsFetchOptional(async () => {
    const { data } = await cmsCollection<{ slug: string }>(
      '/questions',
      { fields: ['slug'], sort: 'createdAt:desc', pagination: { pageSize: limit } },
      { tags: [collectionTag('question')] }
    );
    return data.map((entry) => entry.slug).filter(Boolean);
  }, []);
}
