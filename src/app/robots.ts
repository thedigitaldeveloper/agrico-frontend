import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/env';

/**
 * Staging and preview deployments must not be indexed — a duplicate copy of the
 * catalogue competing with the live site is worse than not being crawled at
 * all. Indexing is therefore allowed only when the canonical origin is the one
 * this build is serving.
 */
const isIndexingAllowed = process.env.SITE_INDEXING_ENABLED !== 'false';

export default function robots(): MetadataRoute.Robots {
  if (!isIndexingAllowed) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Search result pages are infinite, thin and duplicate the listings.
          '/search',
          // Comparison URLs are combinatorial; the underlying pages are indexed.
          '/compare',
          // Nothing user-facing lives under the API.
          '/api/', '/login', '/register', '/forgot-password', '/reset-password', '/dashboard', '/design-preview',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
