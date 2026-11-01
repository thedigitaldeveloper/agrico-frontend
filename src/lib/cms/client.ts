import 'server-only';

import qs from 'qs';

import { CMS_INTERNAL_URL } from '@/lib/env';
import type { CollectionResponse, SingleResponse } from './types';
import { MEDIA_TAG } from './tags';

export interface CmsQuery {
  filters?: Record<string, unknown>;
  sort?: string | string[];
  fields?: string[];
  populate?: unknown;
  pagination?: { page?: number; pageSize?: number; limit?: number; start?: number };
  status?: 'published' | 'draft';
  locale?: string;
  [key: string]: unknown;
}

export interface FetchOptions {
  /** Cache tags to attach, for on-demand revalidation. */
  tags?: string[];
  /**
   * Seconds before the entry is considered stale. Tags are the primary
   * invalidation mechanism; this is a backstop for anything the webhook misses.
   */
  revalidate?: number | false;
}

/** In development, always fetch fresh data (0s). In production, use tag-based ISR. */
const DEFAULT_REVALIDATE = process.env.NODE_ENV === 'development' ? 0 : 60 * 60 * 24;
let reportedOptionalOutage = false;
let cmsUnavailableUntil = 0;

/**
 * A listing's free-text query, normalised.
 *
 * Below two characters a query matches most of any catalogue, so it counts as
 * no query at all — the same line /search draws. Kept here rather than in each
 * repository so the six listings cannot end up drawing it in six places.
 */
export function searchTerm(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length >= 2 ? trimmed : undefined;
}

export class CmsError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string
  ) {
    super(message);
    this.name = 'CmsError';
  }
}

function buildUrl(path: string, query?: CmsQuery): string {
  if (!path.startsWith('/')) {
    throw new Error(`CMS path must start with "/": received "${path}"`);
  }
  const search = query
    ? // Indexed arrays, not bare brackets: Strapi reads `filters[$or][0][...]`
      // and silently ignores `filters[$or][][...]`, which turns an $or lookup
      // into an unfiltered query.
      qs.stringify(query, { encodeValuesOnly: true, arrayFormat: 'indices' })
    : '';
  return `${CMS_INTERNAL_URL}/api${path}${search ? `?${search}` : ''}`;
}

/**
 * Low-level CMS read. Everything here is a GET: the site never mutates content,
 * so there is no write path to secure or cache-bust.
 *
 * Sent unauthenticated, on purpose. Everything the site renders is public, and
 * the CMS grants exactly that to its public role — including the custom
 * /{plural}/slug/:slug routes the detail pages are built on.
 *
 * Attaching CMS_API_TOKEN here made it strictly worse. Strapi authorises a
 * request against the token's own permissions rather than the public role's, and
 * a read-only token covers only the generated find/findOne — so every findBySlug
 * came back 403 and the build died on the first detail page. The token's one
 * legitimate use is reading leads, which the public role must never be able to
 * do; see repositories/enquiry.ts.
 *
 * Note there is deliberately no AbortSignal. Attaching one opts the request out
 * of Next's Data Cache entirely, which in the previous build silently forced
 * every page that used it to render dynamically on each request.
 */
export async function cmsFetch<T>(
  path: string,
  query?: CmsQuery,
  options: FetchOptions = {}
): Promise<T> {
  const url = buildUrl(path, query);
  if (Date.now() < cmsUnavailableUntil) throw new CmsError('CMS temporarily unavailable', 503, path);
  const { tags = [], revalidate = DEFAULT_REVALIDATE } = options;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { tags: [...new Set([...tags, MEDIA_TAG])], revalidate },
    });
  } catch (error) {
    if (error instanceof TypeError && error.message === 'fetch failed') {
      cmsUnavailableUntil = Date.now() + 10000;
      throw new CmsError('CMS temporarily unavailable', 503, path);
    }
    throw error;
  }

  if (!response.ok) {
    throw new CmsError(
      `CMS responded ${response.status} ${response.statusText}`,
      response.status,
      path
    );
  }

  return response.json() as Promise<T>;
}

/** Fetches a collection. Returns entries and pagination together. */
export async function cmsCollection<T>(
  path: string,
  query?: CmsQuery,
  options?: FetchOptions
): Promise<CollectionResponse<T>> {
  return cmsFetch<CollectionResponse<T>>(path, query, options);
}

/** Fetches a single type, or one entry by documentId. */
export async function cmsSingle<T>(
  path: string,
  query?: CmsQuery,
  options?: FetchOptions
): Promise<T | null> {
  const json = await cmsFetch<SingleResponse<T>>(path, query, options);
  return json.data ?? null;
}

/**
 * Fetches the first entry matching a filter — the standard "look up by slug"
 * shape, since Strapi has no by-slug route.
 */
export async function cmsFirst<T>(
  path: string,
  query: CmsQuery,
  options?: FetchOptions
): Promise<T | null> {
  const json = await cmsCollection<T>(
    path,
    { ...query, pagination: { pageSize: 1 } },
    options
  );
  return json.data[0] ?? null;
}

/**
 * A read whose failure should degrade the page rather than break it — a
 * sidebar, a related-items rail. Detail pages should let CmsError propagate so
 * the route can decide between notFound() and an error boundary.
 */
export async function cmsFetchOptional<T>(
  read: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await read();
  } catch (error) {
    if (error instanceof CmsError) {
      if (error.status !== 503 || !reportedOptionalOutage) console.warn(`[cms] optional read fallback (${error.status}) ${error.path}`);
      if (error.status === 503) reportedOptionalOutage = true;
      return fallback;
    }
    if (error instanceof TypeError && error.message === 'fetch failed') {
      if (!reportedOptionalOutage) {
        console.warn('[cms] optional content unavailable; using the prepared fallback');
        reportedOptionalOutage = true;
      }
      return fallback;
    }
    throw error;
  }
}
