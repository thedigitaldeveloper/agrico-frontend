/**
 * Sitemap XML.
 *
 * Written by hand rather than through Next's metadata sitemap because that API
 * reserves /sitemap.xml for itself while only emitting the index automatically
 * on Vercel — self-hosted, the URL robots.txt advertises would 404.
 */

export interface SitemapUrl {
  loc: string;
  lastModified?: Date | string;
  images?: string[];
  changeFrequency?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
}

/** XML text escaping. Slugs are tame, but titles and paths are CMS-authored. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isoDate(value: Date | string | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function urlSetXml(urls: SitemapUrl[]): string {
  const entries = urls.map((url) => {
    const parts = [`    <loc>${escapeXml(url.loc)}</loc>`];

    const lastmod = isoDate(url.lastModified);
    if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);
    for (const image of new Set(url.images || [])) parts.push(`    <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`);
    if (url.changeFrequency) parts.push(`    <changefreq>${url.changeFrequency}</changefreq>`);
    if (url.priority !== undefined) {
      parts.push(`    <priority>${url.priority.toFixed(1)}</priority>`);
    }

    return `  <url>\n${parts.join('\n')}\n  </url>`;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries,
    '</urlset>',
  ].join('\n');
}

export function sitemapIndexXml(locations: { loc: string; lastModified?: Date }[]): string {
  const entries = locations.map((location) => {
    const lastmod = isoDate(location.lastModified);
    return [
      '  <sitemap>',
      `    <loc>${escapeXml(location.loc)}</loc>`,
      ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
      '  </sitemap>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</sitemapindex>',
  ].join('\n');
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Crawlers refetch often; an hour at the edge with a day of
      // stale-while-revalidate keeps that cheap without going stale.
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
