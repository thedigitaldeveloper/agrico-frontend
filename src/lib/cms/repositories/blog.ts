import { getPublicationPost, publicationPosts, type PublicationDocument } from '@/lib/agrico/publication';
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
const TS = '2026-10-30T00:00:00.000Z';

function docToBlogDetail(doc: PublicationDocument, idx: number): BlogDetail {
  const id = 86000 + idx;
  const type: BlogType =
    doc.kind === 'Articles' ? 'Articles' : doc.kind === 'News' ? 'News' : 'Blog';
  const dateTime = doc.published_on || doc.event_date || doc.reviewed_on || TS;
  const heroImg = doc.hero_media?.[0];
  const media: Media | null = heroImg?.src
    ? {
        id: id * 10 + 1,
        documentId: `blog-media-${doc.slug}`,
        url: heroImg.src,
        name: heroImg.alt || doc.slug,
        alternativeText: heroImg.alt || doc.title,
        caption: heroImg.caption || null,
        width: heroImg.width ?? 1200,
        height: heroImg.height ?? 630,
        mime: heroImg.src.endsWith('.png') ? 'image/png' : 'image/jpeg',
        size: 64,
        formats: null,
        createdAt: TS,
        updatedAt: TS,
        publishedAt: TS,
      }
    : null;

  return {
    id,
    documentId: `pub-blog-${doc.slug}`,
    createdAt: dateTime,
    updatedAt: doc.reviewed_on || TS,
    publishedAt: dateTime,
    name: doc.title,
    slug: doc.slug,
    description: doc.description || doc.summary,
    type,
    dateTime,
    image: media,
    thumbnail: media,
    tags: [
      {
        id: 87001,
        documentId: 'tag-agri-ed',
        name: doc.eyebrow || 'Agriculture Education',
        slug: 'agriculture-education',
        createdAt: TS,
        updatedAt: TS,
        publishedAt: TS,
      },
    ],
    editorial_content: doc,
    author_name: doc.byline || 'Agrico Editorial Desk',
    reviewed_at: doc.reviewed_on || null,
    long_description: (doc.sections || []).flatMap((sec) => [
      {
        type: 'heading' as const,
        level: 2 as const,
        children: [{ type: 'text' as const, text: sec.heading }],
      },
      ...(sec.paragraphs || []).map((p) => ({
        type: 'paragraph' as const,
        children: [{ type: 'text' as const, text: p }],
      })),
    ]),
    seo: {
      metaTitle: doc.meta_title || `${doc.title} | Agrico`,
      metaDescription: doc.description || doc.summary,
      keywords: `${doc.slug.replace(/-/g, ', ')}, agriculture education`,
      metaRobots: 'index,follow',
      metaViewport: null,
      canonicalURL: `https://agrico.in${doc.path}`,
      structuredData: null,
      metaImage: media,
    },
    download: null,
    courses: [],
    exams: [],
    streams: [],
  };
}

const LOCAL_BLOG_DETAILS: BlogDetail[] = publicationPosts.map((doc, idx) => docToBlogDetail(doc, idx));

function filterLocalBlogs(params: BlogListParams): { posts: BlogCard[]; pagination: Pagination } {
  const term = searchTerm(params.search)?.toLowerCase();
  const allowedTypes = params.section ? (BLOG_SECTIONS[params.section] as readonly string[]) : null;

  const filtered = LOCAL_BLOG_DETAILS.filter((post) => {
    if (allowedTypes && (!post.type || !allowedTypes.includes(post.type))) return false;
    if (term) {
      const hay = `${post.name} ${post.description ?? ''}`.toLowerCase();
      if (!hay.includes(term)) return false;
    }
    return true;
  });

  const pageSize = Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, 50);
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.max(1, params.page ?? 1);
  const start = (page - 1) * pageSize;

  return {
    posts: filtered.slice(start, start + pageSize),
    pagination: { page, pageSize, pageCount, total },
  };
}

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

  try {
    const { data, meta } = await cmsCollection<BlogCard>(
      '/blogs',
      {
        filters: buildFilters(params),
        sort: ['dateTime:desc', 'createdAt:desc'],
        pagination: {
          page: params.page ?? 1,
          pageSize: Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, 50),
        },
      },
      {
        tags: [collectionTag('blog')],
        revalidate: term ? 0 : undefined,
      }
    );

    if (data && data.length > 0) {
      return { posts: data, pagination: meta.pagination };
    }
    return filterLocalBlogs(params);
  } catch {
    return filterLocalBlogs(params);
  }
}

export async function getBlogBySlug(slug: string): Promise<BlogDetail | null> {
  try {
    const json = await cmsFetch<{ data: BlogDetail }>(
      `/blogs/slug/${encodeURIComponent(slug)}`,
      undefined,
      { tags: [collectionTag('blog'), entryTag('blog', slug)] }
    );
    if (json.data) return json.data;
  } catch (error) {
    if (!(error instanceof Error && 'status' in error && error.status === 404)) {
      // Fall through to local publication catalogue
    }
  }
  const local = LOCAL_BLOG_DETAILS.find((b) => b.slug === slug);
  if (local) return local;
  const pub = getPublicationPost(slug);
  return pub ? docToBlogDetail(pub, 999) : null;
}

export async function getBlogSlugs(section?: BlogSection, limit = 100): Promise<string[]> {
  const cmsSlugs = await cmsFetchOptional(async () => {
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

  const localSlugs = LOCAL_BLOG_DETAILS.filter((b) =>
    section ? (BLOG_SECTIONS[section] as readonly string[]).includes(b.type ?? '') : true
  ).map((b) => b.slug);

  return [...new Set([...cmsSlugs, ...localSlugs])].slice(0, limit);
}

/** Related reading for the foot of a post, excluding the post itself. */
export async function getRelatedPosts(
  post: Pick<BlogDetail, 'slug' | 'type'>,
  limit = 3
): Promise<BlogCard[]> {
  const cmsRelated = await cmsFetchOptional(async () => {
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

  if (cmsRelated.length > 0) return cmsRelated;
  return LOCAL_BLOG_DETAILS.filter(
    (b) => b.slug !== post.slug && (!post.type || b.type === post.type)
  ).slice(0, limit);
}
