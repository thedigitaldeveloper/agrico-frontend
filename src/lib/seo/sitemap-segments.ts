/**
 * The sitemap is split by content type. Both the segment generator
 * (app/sitemap.ts) and the index (app/sitemap.xml/route.ts) read this list, so
 * adding a segment in one place cannot leave it missing from the other.
 */
export const SITEMAP_SEGMENTS = [
  'static',
  'universities',
  'programs',
  'exams',
  'scholarships',
  'posts',
  'qna',
  'pages',
] as const;

export type SitemapSegment = (typeof SITEMAP_SEGMENTS)[number];
