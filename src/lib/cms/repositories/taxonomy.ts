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

export async function listTaxonomy(
  path: TaxonomyPath,
  limit = 100
): Promise<TaxonomyTerm[]> {
  return cmsFetchOptional(async () => {
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
