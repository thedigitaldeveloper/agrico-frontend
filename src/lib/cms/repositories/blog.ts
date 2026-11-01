import type { BlocksContent } from '../blocks';
import { cmsCollection, cmsFetch, cmsFetchOptional, searchTerm, type CmsQuery } from '../client';
import { collectionTag, entryTag } from '../tags';
import type { Media, Pagination, Seo, StrapiEntry } from '../types';
import type { Taxonomy } from './university';

/**
 * Editorial content lives in one `blog` collection, discriminated by `type`.
 * Agrico presents inherited articles and newer blog posts together as
 * Blogs; the legacy article routes remain available for existing links.
 */

export type BlogType = 'Articles' | 'News' | 'Press release' | 'Blog';

/**
 * Maps a URL segment to the CMS enum values it serves.
 *
 * Blogs includes inherited Articles so publishing either type keeps the post
 * discoverable. The articles key retains its narrower legacy filter. News and
 * press releases remain in their own listing.
 */
export const BLOG_SECTIONS = {
  articles: ['Articles'],
  news: ['News', 'Press release'],
  blogs: ['Blog'],
} as const satisfies Record<string, readonly BlogType[]>;

export type BlogSection = keyof typeof BLOG_SECTIONS;

export interface BlogCard extends StrapiEntry {
  name: string;
  slug: string;
  description: string | null;
  type: BlogType | null;
  dateTime: string | null;
  image: Media | null;
  thumbnail: Media | null;
  tags: Taxonomy[];
}

export interface BlogDetail extends BlogCard {
  editorial_content?: unknown;
  body_html?: import('@/components/cms/html-section').HtmlSectionBlock | null;
  author_name?: string | null;
  reviewed_at?: string | null;
  universities?: Taxonomy[];
  programs?: Taxonomy[];
  long_description: BlocksContent | null;
  seo: Seo | null;
  download: Media | null;
  courses: Taxonomy[];
  exams: Taxonomy[];
  streams: Taxonomy[];
}

export function postSection(type: BlogType | null): BlogSection {
  return type === 'Articles' ? 'articles' : type === 'Blog' ? 'blogs' : 'news';
}

export const canonicalPostPath = (post: Pick<BlogCard, 'slug' | 'type'>) => '/' + postSection(post.type) + '/' + post.slug;

export interface BlogListParams {
  section?: BlogSection;
  page?: number;
  pageSize?: number;
  search?: string;
}

const DEFAULT_PAGE_SIZE = 12;

function buildFilters(params: BlogListParams): CmsQuery['filters'] {
  const filters: Record<string, unknown> = {};

  if (params.section) filters.type = { $in: [...BLOG_SECTIONS[params.section]] };

  const term = searchTerm(params.search);
  if (term) {
    filters.$or = [{ name: { $containsi: term } }, { description: { $containsi: term } }];
  }

  return filters;
}

export async function listBlogs(
  params: BlogListParams = {}
): Promise<{ posts: BlogCard[]; pagination: Pagination }> {
  const term = searchTerm(params.search);

  const { data, meta } = await cmsCollection<BlogCard>(
    '/blogs',
    {
      filters: buildFilters(params),
      // Editors backdate posts, so publication order follows dateTime and only
      // falls back to creation order when it is unset.
      sort: ['dateTime:desc', 'createdAt:desc'],
      pagination: {
        page: params.page ?? 1,
        pageSize: Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, 50),
      },
    },
    {
      tags: [collectionTag('blog')],
      // A typed query is one-off and unbounded in variety, so caching one
      // would fill the data cache with single-use entries. 0 prevents that;
      // `false` would mean the opposite — cache it forever.
      revalidate: term ? 0 : undefined,
    }
  );

  return { posts: data, pagination: meta.pagination };
}

export async function getBlogBySlug(slug: string): Promise<BlogDetail | null> {
  try {
    const json = await cmsFetch<{ data: BlogDetail }>(
      `/blogs/slug/${encodeURIComponent(slug)}`,
      undefined,
      { tags: [collectionTag('blog'), entryTag('blog', slug)] }
    );
    return json.data ?? null;
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 404) return null;
    throw error;
  }
}

export async function getBlogSlugs(section?: BlogSection, limit = 100): Promise<string[]> {
  return cmsFetchOptional(async () => {
    const { data } = await cmsCollection<{ slug: string }>(
      '/blogs',
      {
        fields: ['slug'],
        filters: section ? { type: { $in: [...BLOG_SECTIONS[section]] } } : undefined,
        sort: 'updatedAt:desc',
        pagination: { pageSize: limit },
      },
      { tags: [collectionTag('blog')] }
    );
    return data.map((entry) => entry.slug).filter(Boolean);
  }, []);
}

/** Related reading for the foot of a post, excluding the post itself. */
export async function getRelatedPosts(
  post: Pick<BlogDetail, 'slug' | 'type'>,
  limit = 3
): Promise<BlogCard[]> {
  return cmsFetchOptional(async () => {
    const { data } = await cmsCollection<BlogCard>(
      '/blogs',
      {
        filters: {
          slug: { $ne: post.slug },
          ...(post.type ? { type: { $eq: post.type } } : {}),
        },
        sort: ['dateTime:desc'],
        pagination: { pageSize: limit },
      },
      { tags: [collectionTag('blog')] }
    );
    return data;
  }, []);
}
