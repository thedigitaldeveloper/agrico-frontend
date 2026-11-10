import { cmsCollection, cmsFetchOptional } from '../client';
import { GLOBAL_TAG, collectionTag } from '../tags';
import type { StrapiEntry } from '../types';

/**
 * Lookup lists used by navigation and filter sidebars.
 *
 * These are read on nearly every page, so they carry the shared GLOBAL_TAG as
 * well as their own collection tag: editing a stream drops the layout cache
 * once, rather than leaving stale menus behind on every cached page.
 */

export interface TaxonomyTerm extends StrapiEntry {
  name: string;
  slug: string;
}

type TaxonomyPath =
  | 'streams'
  | 'courses'
  | 'exams'
  | 'approvals'
  | 'affiliations'
  | 'rankings'
  | 'ownership-types'
  | 'course-modes'
  | 'course-types'
  | 'levels'
  | 'duration-types'
  | 'institute-tiers'
  | 'tags';

/** Maps a REST path back to the model name the cache tags are keyed on. */
const MODEL_FOR_PATH = {
  streams: 'stream',
  courses: 'course',
  exams: 'exam',
  approvals: 'approval',
  affiliations: 'affiliation',
  rankings: 'ranking',
  'ownership-types': 'ownership-type',
  'course-modes': 'course-mode',
  'course-types': 'course-type',
  levels: 'level',
  'duration-types': 'duration-type',
  'institute-tiers': 'institute-tier',
  tags: 'tag',
} as const;

const TS = '2026-10-30T00:00:00.000Z';

function term(id: number, documentId: string, name: string, slug: string): TaxonomyTerm {
  return { id, documentId, name, slug, createdAt: TS, updatedAt: TS, publishedAt: TS };
}

const FALLBACK_TAXONOMIES: Partial<Record<TaxonomyPath, TaxonomyTerm[]>> = {
  streams: [
    term(9101, 'stream-agri', 'Agriculture & Allied Sciences', 'agriculture-allied-sciences'),
    term(9102, 'stream-hort', 'Horticulture & Forestry', 'horticulture-forestry'),
    term(9103, 'stream-eng', 'Agricultural Engineering & Tech', 'agricultural-engineering'),
    term(9104, 'stream-abm', 'Agribusiness Management', 'agribusiness-management'),
    term(9105, 'stream-vet', 'Veterinary, Dairy & Fisheries', 'veterinary-dairy-fisheries'),
  ],
  'ownership-types': [
    term(9201, 'own-sau', 'State Agricultural University (SAU)', 'state-agricultural-university'),
    term(9202, 'own-central-icar', 'Central / ICAR Deemed University', 'central-icar-deemed-university'),
    term(9203, 'own-private', 'Private University / College', 'private-university'),
    term(9204, 'own-public', 'Public Agricultural Institution', 'public-state-university'),
  ],
  approvals: [
    term(9301, 'app-icar', 'ICAR Accredited', 'icar'),
    term(9302, 'app-ugc', 'UGC Recognized', 'ugc'),
    term(9303, 'app-aicte', 'AICTE Approved', 'aicte'),
    term(9304, 'app-vci', 'VCI Recognized', 'vci'),
  ],
  'course-modes': [
    term(9601, 'mode-regular', 'On-Campus (Regular)', 'regular'),
  ],
  levels: [
    term(9701, 'lvl-ug', 'Undergraduate (UG)', 'undergraduate'),
    term(9702, 'lvl-pg', 'Postgraduate (PG)', 'postgraduate'),
    term(9703, 'lvl-diploma', 'Diploma', 'diploma'),
    term(9704, 'lvl-phd', 'Doctoral (Ph.D.)', 'doctoral'),
  ],
  courses: [
    term(9801, 'crs-bsc-agri', 'B.Sc. (Hons.) Agriculture', 'bsc-agriculture'),
    term(9802, 'crs-btech-ag', 'B.Tech. Agricultural Engineering', 'btech-agricultural-engineering'),
    term(9803, 'crs-bsc-hort', 'B.Sc. (Hons.) Horticulture', 'bsc-horticulture'),
    term(9804, 'crs-mba-abm', 'MBA Agribusiness Management', 'mba-agribusiness'),
    term(9805, 'crs-msc-agro', 'M.Sc. Agriculture (Agronomy)', 'msc-agronomy'),
    term(9806, 'crs-bvsc', 'B.V.Sc. & A.H.', 'bvsc-animal-husbandry'),
  ],
};

export async function listTaxonomy(
  path: TaxonomyPath,
  limit = 100
): Promise<TaxonomyTerm[]> {
  const cmsTerms = await cmsFetchOptional(async () => {
    const { data } = await cmsCollection<TaxonomyTerm>(
      `/${path}`,
      {
        fields: ['name', 'slug'],
        sort: 'name:asc',
        pagination: { pageSize: limit },
      },
      { tags: [collectionTag(MODEL_FOR_PATH[path]), GLOBAL_TAG] }
    );
    return data;
  }, []);

  if (cmsTerms.length > 0) return cmsTerms;
  return (FALLBACK_TAXONOMIES[path] ?? []).slice(0, limit);
}

/** Everything the header and footer need, in one pass. */
export async function getNavigationData() {
  const [streamsData, coursesData, exams, modes, ownership] = await Promise.all([
    listTaxonomy('streams', 20),
    listTaxonomy('courses', 20),
    listTaxonomy('exams', 12),
    listTaxonomy('course-modes', 10),
    listTaxonomy('ownership-types', 10),
  ]);

  const streams = streamsData;
  const courses = coursesData;

  return { streams, courses, exams, modes, ownership };
}
