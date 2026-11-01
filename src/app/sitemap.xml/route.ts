import { SITE_URL } from '@/lib/env';
import { SITEMAP_SEGMENTS } from '@/lib/seo/sitemap-segments';
import { sitemapIndexXml, xmlResponse } from '@/lib/seo/sitemap-xml';

/**
 * Sitemap index — the URL robots.txt advertises and the one search consoles
 * expect. Points at each per-type segment.
 */
export const dynamic = 'force-static';

export function GET() {
  return xmlResponse(
    sitemapIndexXml(
      SITEMAP_SEGMENTS.map((segment) => ({
        loc: `${SITE_URL}/sitemap/${segment}.xml`,
      }))
    )
  );
}
