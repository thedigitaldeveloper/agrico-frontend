import { cmsCollection, cmsFetch, cmsFetchOptional } from '../client';
import type { BlocksContent } from '../blocks';
import { collectionTag, entryTag } from '../tags';
import type { Media, Seo, StrapiEntry } from '../types';
import type { ProgramCard } from './program';
import type { Taxonomy } from './university';

/**
 * A course is the page above a set of programs — "Online MBA", with Finance,
 * HR and Data Science underneath it.
 *
 * The distinction that matters: a course is what someone searches for, a
 * program is what they enrol in. Undergraduate/postgraduate is recorded here
 * rather than on every program below, which is why `program.course.level`
 * exists and `program.level` does not.
 */
export interface CourseCard extends StrapiEntry {
  name: string;
  slug: string;
  full_name: string | null;
  icon: Media | null;
  stream: Taxonomy | null;
  level: Taxonomy | null;
}

export interface CourseDetail extends CourseCard {
  short_description: BlocksContent | null;
  seo: Seo | null;
  /** Sorted by `position` server-side; see PRESETS.course.detail in the CMS. */
  programs: ProgramCard[];
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  return cmsFetchOptional(async () => {
    try {
      const json = await cmsFetch<{ data: CourseDetail }>(
        `/courses/slug/${encodeURIComponent(slug)}`,
        undefined,
        { tags: [collectionTag('course'), entryTag('course', slug)] }
      );
      return json.data ?? null;
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 404) return null;
      throw error;
    }
  }, null);
}

export async function listCourses(pageSize = 100): Promise<CourseCard[]> {
  return cmsFetchOptional(async () => {
    const { data } = await cmsCollection<CourseCard>(
      '/courses',
      {
        populate: {
          icon: true,
          stream: true,
          level: true,
        },
        sort: 'name:asc',
        pagination: { pageSize },
      },
      { tags: [collectionTag('course')] }
    );
    return data;
  }, []);
}

export async function getCourseSlugs(limit = 100): Promise<string[]> {
  return cmsFetchOptional(async () => {
    const { data } = await cmsCollection<{ slug: string }>(
      '/courses',
      { fields: ['slug'], sort: 'updatedAt:desc', pagination: { pageSize: limit } },
      { tags: [collectionTag('course')] }
    );
    return data.map((entry) => entry.slug).filter(Boolean);
  }, []);
}
