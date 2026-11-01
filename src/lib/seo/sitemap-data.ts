import 'server-only';

import { SITE_URL } from '@/lib/env';
import {
  getBlogEntries,
  getContentSectionEntries,
  getExamEntries,
  getLegalEntries,
  getMasterEntries,
  getProgramEntries,
  getQuestionEntries,
  getScholarshipEntries,
  getUniversityEntries,
  type SitemapEntry,
} from '@/lib/cms/repositories/sitemap';
import type { SitemapSegment } from './sitemap-segments';
import type { SitemapUrl } from './sitemap-xml';
import { publicationUniversities, publicationUniversityTabs, publicationPosts, publicationStates } from '@/lib/agrico/publication';

/**
 * Builds the URL list for one sitemap segment.
 *
 * The sitemap is split by content type because a single file is capped at
 * 50,000 URLs, and this catalogue — universities and programs each with several
 * indexable section pages — passes that quickly. Splitting also means a change
 * to one type does not invalidate the whole thing.
 */

const abs = (path: string) => `${SITE_URL}${path}`;

function entryUrls(
  entries: SitemapEntry[],
  prefix: string,
  priority: number,
  changeFrequency: SitemapUrl['changeFrequency']
): SitemapUrl[] {
  return entries.map((entry) => ({
    loc: abs(`${prefix}/${entry.slug}`),
    lastModified: entry.updatedAt,
    changeFrequency,
    priority,
  }));
}

async function sectionUrls(
  owner: 'university' | 'program' | 'examination' | 'scheme',
  prefix: string
): Promise<SitemapUrl[]> {
  const sections = await getContentSectionEntries(owner);
  return (
    sections
      // The first section is served by the bare detail route, which is already
      // listed; emitting /overview too would duplicate it.
      .filter((section) => section.sectionSlug !== 'overview')
      .map((section) => ({
        loc: abs(`${prefix}/${section.ownerSlug}/${section.sectionSlug}`),
        lastModified: section.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }))
  );
}

const STATIC_ROUTES: SitemapUrl[] = [
  { loc: abs('/agriculture-colleges'), changeFrequency: 'weekly', priority: 0.9 },
  { loc: abs('/'), changeFrequency: 'daily', priority: 1 },
  { loc: abs('/universities'), changeFrequency: 'daily', priority: 0.9 },
  { loc: abs('/programs'), changeFrequency: 'daily', priority: 0.9 },
  { loc: abs('/exams'), changeFrequency: 'daily', priority: 0.8 },
  { loc: abs('/scholarships'), changeFrequency: 'weekly', priority: 0.8 },
  { loc: abs('/articles'), changeFrequency: 'daily', priority: 0.7 },
  { loc: abs('/news'), changeFrequency: 'daily', priority: 0.7 },
  { loc: abs('/blogs'), changeFrequency: 'weekly', priority: 0.6 },
  { loc: abs('/common-application-form'), changeFrequency: 'monthly', priority: 0.8 },
  { loc: abs('/about-us'), changeFrequency: 'yearly', priority: 0.5 },
  { loc: abs('/contact-us'), changeFrequency: 'yearly', priority: 0.5 },
  { loc: abs('/editorial-policy'), changeFrequency: 'yearly', priority: 0.5 },
];

export async function buildSegment(segment: SitemapSegment): Promise<SitemapUrl[]> {
  switch (segment) {
    case 'static':
      // No invented modification date: these routes do not have a content log.
      return STATIC_ROUTES;

    case 'universities': {
      const [entries, sections] = await Promise.all([
        getUniversityEntries(),
        sectionUrls('university', '/university'),
      ]);
      const documents = [...publicationUniversities, ...publicationUniversityTabs, ...publicationStates];
      const deferred = new Set(documents.filter(doc => doc.indexing?.index === false).map(doc => abs(doc.path)));
      const prepared: SitemapUrl[] = documents.filter(doc => !deferred.has(abs(doc.path))).map(doc => ({ loc: abs(doc.path), lastModified: doc.reviewed_on, changeFrequency: 'monthly', priority: 0.8, images: publicationUniversities.find(university => university.slug === doc.slug)?.hero_media?.filter(image => image.role.startsWith('campus')).map(image => abs(image.src)) }));
      return [...new Map([...entryUrls(entries, '/university', 0.8, 'weekly'), ...sections, ...prepared].filter(row => !deferred.has(row.loc)).map(row => [row.loc, row])).values()];
    }

    case 'programs': {
      const [entries, sections] = await Promise.all([
        getProgramEntries(),
        sectionUrls('program', ''),
      ]);
      return [...entryUrls(entries, '', 0.8, 'weekly'), ...sections];
    }

    case 'exams': {
      const [entries, sections] = await Promise.all([
        getExamEntries(),
        sectionUrls('examination', '/exams'),
      ]);
      // Exam dates move, so these are worth recrawling more often.
      return [...entryUrls(entries, '/exams', 0.8, 'daily'), ...sections];
    }

    case 'scholarships': {
      const [entries, sections] = await Promise.all([
        getScholarshipEntries(),
        sectionUrls('scheme', '/scholarship'),
      ]);
      return [...entryUrls(entries, '/scholarship', 0.7, 'weekly'), ...sections];
    }

    case 'posts': {
      const groups = await getBlogEntries();
      const cms = groups.flatMap((group) =>
        entryUrls(
          group.entries,
          `/${group.section}`,
          group.section === 'news' ? 0.6 : 0.7,
          group.section === 'news' ? 'daily' : 'monthly'
        )
      );
      const prepared: SitemapUrl[] = publicationPosts.map(doc => ({ loc: abs(doc.path), lastModified: doc.reviewed_on, changeFrequency: 'monthly', priority: 0.7, images: doc.hero_media?.filter(image => image.role.startsWith('campus')).map(image => abs(image.src)) }));
      return [...new Map([...prepared, ...cms].map(row => [row.loc, row])).values()];
    }

    case 'qna':
      return [];

    case 'pages': {
      const [legal, master] = await Promise.all([getLegalEntries(), getMasterEntries()]);
      // Both resolve from the root-level /[slug] catch-all.
      return [...entryUrls(legal, '', 0.3, 'yearly'), ...entryUrls(master, '', 0.5, 'monthly')];
    }

    default:
      return [];
  }
}
