import { buildSegment } from '@/lib/seo/sitemap-data';
import { SITEMAP_SEGMENTS, type SitemapSegment } from '@/lib/seo/sitemap-segments';
import { urlSetXml, xmlResponse } from '@/lib/seo/sitemap-xml';

/**
 * One sitemap segment, served at /sitemap/{segment}.xml.
 *
 * Prerendered at build time and revalidated by the CMS webhook, since every
 * underlying read is tagged.
 */
export const dynamic = 'force-static';

export function generateStaticParams() {
  return SITEMAP_SEGMENTS.map((segment) => ({ segment: `${segment}.xml` }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ segment: string }> }
) {
  const { segment } = await params;
  const name = segment.replace(/\.xml$/, '');

  if (!(SITEMAP_SEGMENTS as readonly string[]).includes(name)) {
    return new Response('Not found', { status: 404 });
  }

  const urls = await buildSegment(name as SitemapSegment);
  return xmlResponse(urlSetXml(urls));
}
