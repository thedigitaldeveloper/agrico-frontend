import { cmsCollection, cmsFetch, cmsFetchOptional, searchTerm, type CmsQuery } from '../client';
import { collectionTag, entryTag } from '../tags';
import type { Media, Pagination, Seo, StrapiEntry } from '../types';

/**
 * University reads.
 *
 * Pages call these; they never build a CMS URL themselves. Query shape lives on
 * the server (see the CMS's src/utils/populate.ts), so what a route asks for is
 * just a slug or a filter — not a 2 kB populate string, which is what the old
 * frontend shipped.
 */

export interface Taxonomy extends StrapiEntry {
  name: string;
  slug: string;
}

/**
 * An approval as the detail read returns it.
 *
 * Separate from Taxonomy rather than an optional field on it: only the
 * university *detail* preset populates the logo, so promising one on the shared
 * lookup type would lie to the thirty-odd places — listing cards, filter chips,
 * the compare table — that read approvals from the card preset and get a name
 * and a slug. Same reason CourseRef exists over in program.ts.
 */
export interface ApprovalRef extends Taxonomy {
  logo: Media | null;
}

export interface Highlight {
  id: number;
  /** The home.highlights component names this field "key", not "name". */
  key: string | null;
  value: string | null;
  icon: string | null;
}

/** Fields present on a listing card. */
export interface UniversityCard extends StrapiEntry {
  name: string;
  full_name: string | null;
  slug: string;
  city: string | null;
  state: string | null;
  country: string | null;
  establish: string | null;
  rating: number | null;
  position: number | null;
  show_apply_button: boolean;
  apply_button_text: string | null;
  view_button_text: string | null;
  logo: Media | null;
  card_logo?: Media | null;
  fav_icon?: Media | null;
  ownership_type: Taxonomy | null;
  approvals: Taxonomy[];
  affiliations: Taxonomy[];
  rankings: Taxonomy[];
  streams: Taxonomy[];
  tag: Taxonomy | null;
  course_modes?: Taxonomy[];
}

/** One row of the section index — the tabs across a university page. */
export interface ContentSectionRef {
  id: number;
  documentId: string;
  name: string | null;
  slug: string;
  secondary_slug: string | null;
  display_name: string | null;
  heading: string | null;
  position?: number | null;
}

export interface UniversityDetail extends UniversityCard {
  /** Structured agriculture content prepared by the editorial workflow. */
  agriculture_content?: unknown;
  editorial_posts?: Array<{ name: string; slug: string; description: string | null; type: 'Articles' | 'Blog' | 'News' | 'Press release' | null; publishedAt: string | null }>;
  /** Narrowed from the card's Taxonomy[]: the detail preset adds the logo. */
  approvals: ApprovalRef[];
  address: string | null;
  established_year?: number | null;
  whatsapp_number?: string | null;
  toll_free_number?: string | null;
  program_fees?: Array<{ id: number; program: Taxonomy | null; fee: number | null; note: string | null }>;
  faculties?: Array<{ id: number; documentId: string; name: string; designation: string | null; qualification: string | null; bio: string | null; photo: Media | null; social_link: string | null }>;
  recruiters?: Array<{ id: number; documentId: string; name: string; logo: Media | null }>;
  pincode: string | null;
  heading: string | null;
  show_similar_universities: boolean;
  image: Media | null;
  banners?: Array<{
    id: number;
    heading: string | null;
    media_type: 'image' | 'video' | 'youtube';
    desktop_image: Media | null;
    mobile_image: Media | null;
  }>;
  brochure: Media | null;
  seo: Seo | null;
  highlights: Highlight[];
  exams: Taxonomy[];
  courses: Taxonomy[];
  course_modes: Taxonomy[];
  course_types: Taxonomy[];
  institute_tiers: Taxonomy[];
  university_contents: ContentSectionRef[];
}

export interface UniversityListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  /** Slugs of taxonomies to filter by. */
  stream?: string;
  ownership?: string;
  approval?: string;
  state?: string;
  city?: string;
  search?: string;
}

const DEFAULT_PAGE_SIZE = 24;

function buildFilters(params: UniversityListParams): CmsQuery['filters'] {
  const filters: Record<string, unknown> = {};

  if (params.stream) filters.streams = { slug: { $eq: params.stream } };
  if (params.ownership) filters.ownership_type = { slug: { $eq: params.ownership } };
  if (params.approval) filters.approvals = { slug: { $eq: params.approval } };
  if (params.state) filters.state = { $eqi: params.state };
  if (params.city) filters.city = { $eqi: params.city };

  const term = searchTerm(params.search);
  if (term) {
    filters.$or = [{ name: { $containsi: term } }, { full_name: { $containsi: term } }];
  }

  return filters;
}

export async function listUniversities(params: UniversityListParams = {}): Promise<{
  universities: UniversityCard[];
  pagination: Pagination;
}> {
  const term = searchTerm(params.search);

  try {
    const { data, meta } = await cmsCollection<UniversityCard>(
      '/universities',
      {
        filters: buildFilters(params),
        sort: params.sort ?? 'position:asc',
        pagination: {
          page: params.page ?? 1,
          pageSize: Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, 100),
        },
      },
      {
        tags: [collectionTag('university')],
        revalidate: term ? 0 : undefined,
      }
    );

    return { universities: data ?? [], pagination: meta?.pagination ?? { page: 1, pageSize: 12, pageCount: 1, total: 0 } };
  } catch (err) {
    if (!(err && typeof err === 'object' && 'status' in err && err.status === 503)) console.warn('[cms] listUniversities fallback:', (err as Error).message);
    return {
      universities: [],
      pagination: { page: 1, pageSize: 12, pageCount: 1, total: 0 },
    };
  }
}

/**
 * Resolves a university by slug. Uses the CMS's dedicated by-slug route, which
 * applies the detail populate preset — the collection route would return the
 * lighter card shape.
 */
export async function getUniversityBySlug(slug: string): Promise<UniversityDetail | null> {
  try {
    const json = await cmsFetch<{ data: UniversityDetail }>(
      `/universities/slug/${encodeURIComponent(slug)}`,
      undefined,
      { tags: [collectionTag('university'), entryTag('university', slug)] }
    );
    return json.data ?? null;
  } catch (error) {
    // A 404 here is an ordinary outcome — an unknown slug, not a failure.
    if (error instanceof Error && 'status' in error && error.status === 404) return null;
    throw error;
  }
}

/**
 * Slugs for generateStaticParams. Only the most recently updated are
 * prerendered; the rest are generated on first request and then cached, so a
 * large catalogue does not blow up build time.
 */
export async function getUniversitySlugs(limit = 200): Promise<string[]> {
  return cmsFetchOptional(async () => {
    const { data } = await cmsCollection<{ slug: string }>(
      '/universities',
      {
        fields: ['slug'],
        sort: 'updatedAt:desc',
        pagination: { pageSize: limit },
      },
      { tags: [collectionTag('university')] }
    );
    return data.map((entry) => entry.slug).filter(Boolean);
  }, []);
}

/**
 * Related universities for the foot of a detail page.
 *
 * Tries same state, then same stream, then anything else — a university that
 * happens to be the only one in its state would otherwise show nothing, which
 * on a real catalogue is common rather than rare.
 */
export async function getRelatedUniversities(
  university: Pick<UniversityDetail, 'slug' | 'state' | 'streams'>,
  limit = 6
): Promise<UniversityCard[]> {
  const streamSlugs = university.streams.map((stream) => stream.slug).filter(Boolean);

  const attempts: CmsQuery['filters'][] = [
    university.state ? { state: { $eqi: university.state } } : null,
    streamSlugs.length > 0 ? { streams: { slug: { $in: streamSlugs } } } : null,
    {},
  ].filter((filter): filter is NonNullable<typeof filter> => filter !== null);

  return cmsFetchOptional(async () => {
    for (const filter of attempts) {
      const { data } = await cmsCollection<UniversityCard>(
        '/universities',
        {
          filters: { slug: { $ne: university.slug }, ...filter },
          sort: 'position:asc',
          pagination: { pageSize: limit },
        },
        { tags: [collectionTag('university')] }
      );
      if (data.length > 0) return data;
    }
    return [];
  }, []);
}

/**
 * Names and slugs only, for pickers that need the whole catalogue in one
 * <select> rather than a page of cards.
 *
 * `fields` is the point: asking listUniversities for sixty entries would pull
 * sixty logos, badge rows and taxonomy relations to render two strings each.
 * Optional, like the other reads the homepage makes — a picker that cannot load
 * its options should disappear, not take the page down.
 */
export async function listUniversityOptions(limit = 60): Promise<Taxonomy[]> {
  return cmsFetchOptional(async () => {
    const { data } = await cmsCollection<Taxonomy>(
      '/universities',
      {
        fields: ['name', 'slug'],
        sort: 'name:asc',
        pagination: { pageSize: limit },
      },
      { tags: [collectionTag('university')] }
    );
    return data;
  }, []);
}
