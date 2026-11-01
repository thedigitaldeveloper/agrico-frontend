import { cmsCollection, cmsFetch, cmsFetchOptional, searchTerm, type CmsQuery } from '../client';
import { collectionTag, entryTag } from '../tags';
import type { Media, Pagination, Seo, StrapiEntry } from '../types';
import { listContentSectionRefs } from './content';
import type { ContentSectionRef, Highlight, Taxonomy, UniversityCard } from './university';

/**
 * A course, with the one relation it carries.
 *
 * Undergraduate/postgraduate is recorded once on the course rather than on
 * every program under it, so a program's level is read through here. The CMS's
 * card preset populates it; nothing else nests inside a lookup.
 */
export interface CourseRef extends Taxonomy {
  level: Taxonomy | null;
  icon?: Media | null;
}

/**
 * One line of a fee breakdown — "Tuition, ₹1,80,000"; "Exam fee, ₹5,000".
 *
 * A component row, so it carries `id` and no documentId.
 */
export interface FeeLine {
  id: number;
  amount: number | null;
  note: string | null;
  fee_type: Taxonomy | null;
}

/** Display adapter for University.program_fees rows joined to a program. */
export interface ProgramOffering extends StrapiEntry {
  fee: number | null;
  /** A waiver the university already applies, subtracted from `fee`. */
  subsidy_amount: number | null;
  position: number | null;
  university: UniversityCard | null;
  fee_lines: FeeLine[];
}

export interface ProgramCard extends StrapiEntry {
  universities?: Array<Pick<UniversityCard, 'name' | 'slug' | 'documentId'>>;
  name: string;
  full_name: string | null;
  slug: string;
  duration: number | null;
  duration_text?: string | null;
  fee: number | null;
  average_package: string | null;
  rating: number | null;
  position: number | null;
  course_code: string | null;
  show_apply_button: boolean;
  apply_button_text: string | null;
  view_button_text: string | null;
  program_icon: Media | null;
  course: CourseRef | null;
  stream: Taxonomy | null;
  course_mode: Taxonomy | null;
  course_type: Taxonomy | null;
  duration_type: Taxonomy | null;
  tag: Taxonomy | null;
}

export interface ProgramDetail extends ProgramCard {
  brochure: Media | null;
  syllabus?: Media | null;
  short_description?: import('../blocks').BlocksContent | null;
  seo: Seo | null;
  highlights: Highlight[];
  eligibilities: Taxonomy[];
  exams: Taxonomy[];
  universities: Array<UniversityCard & Pick<import('./university').UniversityDetail, 'program_fees'>>;
  program_offerings: ProgramOffering[];
  university_contents: ContentSectionRef[];
}

export interface ProgramListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  stream?: string;
  course?: string;
  mode?: string;
  type?: string;
  /** Undergraduate/postgraduate, matched through the program's course. */
  level?: string;
  /** Slug of a university that offers the program. */
  university?: string;
  search?: string;
  /** Inclusive annual-fee bounds, in rupees. */
  feeMin?: number;
  feeMax?: number;
}

const DEFAULT_PAGE_SIZE = 24;

function buildFilters(params: ProgramListParams): CmsQuery['filters'] {
  const filters: Record<string, unknown> = {};

  if (params.stream) filters.stream = { slug: { $eq: params.stream } };
  if (params.course) filters.course = { slug: { $eq: params.course } };
  if (params.mode) filters.course_mode = { slug: { $eq: params.mode } };
  if (params.type) filters.course_type = { slug: { $eq: params.type } };
  if (params.university) filters.universities = { slug: { $eq: params.university } };
  // Two hops, because the level lives on the course. Merged into any `course`
  // filter already set rather than replacing it — the two are combined by the
  // /programs sidebar, and an assignment here would drop the first one.
  if (params.level) {
    filters.course = { ...(filters.course as object), level: { slug: { $eq: params.level } } };
  }

  const term = searchTerm(params.search);
  if (term) {
    // `full_name` alongside `name` for the same reason the other listings pair
    // them: programs are stored under an abbreviation ("B.Tech") and searched
    // for by the expansion ("Bachelor of Technology"), or the other way round.
    filters.$or = [{ name: { $containsi: term } }, { full_name: { $containsi: term } }, { course_code: { $containsi: term } }, { course: { name: { $containsi: term } } }];
  }

  if (params.feeMin !== undefined || params.feeMax !== undefined) {
    filters.fee = {
      ...(params.feeMin !== undefined ? { $gte: params.feeMin } : {}),
      ...(params.feeMax !== undefined ? { $lte: params.feeMax } : {}),
    };
  }

  return filters;
}

export async function listPrograms(params: ProgramListParams = {}): Promise<{
  programs: ProgramCard[];
  pagination: Pagination;
}> {
  const term = searchTerm(params.search);

  try {
    const { data, meta } = await cmsCollection<ProgramCard>(
      '/programs',
      {
        filters: buildFilters(params),
        sort: params.sort ?? 'position:asc',
        populate: {
          program_icon: true,
          course: {
            populate: {
              icon: true,
              level: true,
            },
          },
          stream: true,
          course_mode: true,
          course_type: true,
          duration_type: true,
          tag: true,
          universities: true,
        },
        pagination: {
          page: params.page ?? 1,
          pageSize: Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, 100),
        },
      },
      {
        tags: [collectionTag('program')],
        revalidate: term ? 0 : undefined,
      }
    );

    return { programs: data ?? [], pagination: meta?.pagination ?? { page: 1, pageSize: 12, pageCount: 1, total: 0 } };
  } catch (err) {
    if (!(err && typeof err === 'object' && 'status' in err && err.status === 503)) console.warn('[cms] listPrograms fallback:', (err as Error).message);
    return {
      programs: [],
      pagination: { page: 1, pageSize: 12, pageCount: 1, total: 0 },
    };
  }
}

/**
 * Fetches every published program across all pages.
 *
 * Used by discovery engines (CourseFinder on homepage, sitemap) that need the
 * complete catalogue of all course specialisations rather than just the first page.
 */
export async function listAllPrograms(params: ProgramListParams = {}): Promise<ProgramCard[]> {
  const all: ProgramCard[] = [];
  let page = 1;

  while (true) {
    const { programs, pagination } = await listPrograms({ ...params, page, pageSize: 100 });
    if (!programs || programs.length === 0) break;
    all.push(...programs);
    if (page >= (pagination?.pageCount ?? 1)) break;
    page++;
  }

  return all;
}

export async function getProgramBySlug(slug: string): Promise<ProgramDetail | null> {
  try {
    const json = await cmsFetch<{ data: ProgramDetail }>(
      `/programs/slug/${encodeURIComponent(slug)}`,
      undefined,
      { tags: [collectionTag('program'), entryTag('program', slug)] }
    );
    const prog = json.data ?? null;
    if (prog) {
      // Fee rows are edited on the university; there is no program-offering
      // collection in this CMS. Join the actual component rows by program slug.
      prog.program_offerings = prog.universities.flatMap((university) =>
        (university.program_fees ?? [])
          .filter((row) => row.program?.slug === prog.slug)
          .map((row) => ({
            id: row.id, documentId: `${university.documentId}:${row.id}`,
            createdAt: university.createdAt, updatedAt: university.updatedAt,
            publishedAt: university.publishedAt, fee: row.fee,
            subsidy_amount: null, position: null, university, fee_lines: [],
          }))
      );
    }
    if (prog && (!prog.university_contents || prog.university_contents.length === 0)) {
      const secRefs = await listContentSectionRefs('program', slug);
      prog.university_contents = secRefs as unknown as ContentSectionRef[];
    }
    return prog;
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 404) return null;
    throw error;
  }
}

export async function getProgramSlugs(limit = 200): Promise<string[]> {
  return cmsFetchOptional(async () => {
    const { data } = await cmsCollection<{ slug: string }>(
      '/programs',
      { fields: ['slug'], sort: 'updatedAt:desc', pagination: { pageSize: limit } },
      { tags: [collectionTag('program')] }
    );
    return data.map((entry) => entry.slug).filter(Boolean);
  }, []);
}

/**
 * Other programs in the same stream, for the rail at the foot of a detail page.
 *
 * Streams are the axis a visitor actually browses sideways along — someone
 * looking at MBA Finance is choosing between specialisations, not between an
 * MBA and a B.Sc. A program with no stream gets nothing rather than a rail of
 * whatever happened to sort first.
 */
export async function listRelatedPrograms(
  program: Pick<ProgramDetail, 'slug' | 'stream'>,
  limit = 6
): Promise<ProgramCard[]> {
  const stream = program.stream?.slug;
  if (!stream) return [];

  // One over the limit, because the program itself is in its own stream and is
  // filtered out below — asking for exactly `limit` would return five.
  const { programs } = await listPrograms({ stream, pageSize: limit + 1 });
  return programs.filter((entry) => entry.slug !== program.slug).slice(0, limit);
}

/**
 * Every program a university offers, for the fee table on its page.
 *
 * Not read off the university itself: `programs` is a real relation in the CMS
 * but the detail preset does not populate it, and the server overwrites any
 * populate a caller sends — by design, since that is the deep traversal this
 * layer exists to prevent. A filtered read of /programs costs one query and
 * returns the card preset, which already carries fee, duration and course.
 *
 * Not listPrograms either, for the tags: which programs a university offers is
 * editable from both ends of the relation, and attaching one inside the
 * university's own edit screen fires a `university` webhook and nothing else.
 * A table tagged only for programs would serve the old rows until the daily
 * backstop expired.
 *
 * The whole set on one page rather than paginated — a fee table is read by
 * scanning it, and a "next 24" control turns that into tab-switching. Optional,
 * like the other secondary reads on a detail page: a table that cannot load
 * should leave the page standing.
 */
export async function listUniversityPrograms(
  slug: string,
  limit = 100
): Promise<ProgramCard[]> {
  return cmsFetchOptional(async () => {
    const programs: ProgramCard[] = [];
    let page = 1;
    while (true) {
      const { data, meta } = await cmsCollection<ProgramCard>(
        '/programs',
        {
          filters: buildFilters({ university: slug }),
          // `position` is the rank every other listing sorts by, but it is
          // nullable and not unique, so name breaks the ties — otherwise two
          // unranked programs can swap rows between one render and the next for
          // no reason a reader could explain.
          sort: ['position:asc', 'name:asc'],
          pagination: { page, pageSize: Math.min(limit, 100) },
        },
        { tags: [collectionTag('program'), entryTag('university', slug)] }
      );
      programs.push(...data);
      if (!data.length || page >= (meta?.pagination?.pageCount ?? 1)) break;
      page++;
    }
    return programs;
  }, []);
}
