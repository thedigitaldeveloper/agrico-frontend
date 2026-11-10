import { UNIVERSITY_GUIDES } from '@/components/agrico/detail-catalogue';
import { getProgrammeContent, programmesForUniversitySlug } from '@/lib/agrico/programme-content';
import { getPublicationUniversity, publicationUniversities, type PublicationDocument } from '@/lib/agrico/publication';
import { cmsCollection, cmsFetch, cmsFetchOptional, searchTerm, type CmsQuery } from '../client';
import { collectionTag, entryTag } from '../tags';
import type { Media, Pagination, Seo, StrapiEntry } from '../types';
export { offeringHref, universityHref } from '../paths';

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
const TS = '2026-10-30T00:00:00.000Z';

function tax(id: number, documentId: string, name: string, slug: string): Taxonomy {
  return { id, documentId, name, slug, createdAt: TS, updatedAt: TS, publishedAt: TS };
}

function toMedia(
  img: { src: string; alt: string; width?: number; height?: number } | undefined,
  id: number
): Media | null {
  if (!img?.src) return null;
  return {
    id,
    documentId: `media-uni-${id}`,
    url: img.src,
    name: img.alt || `media-${id}`,
    alternativeText: img.alt || null,
    caption: null,
    width: img.width ?? 240,
    height: img.height ?? 240,
    mime: img.src.endsWith('.png') ? 'image/png' : 'image/jpeg',
    size: 24,
    formats: null,
    createdAt: TS,
    updatedAt: TS,
    publishedAt: TS,
  };
}

function classifyOwnership(raw: string | undefined, kind: string | undefined): Taxonomy {
  const text = `${raw ?? ''} ${kind ?? ''}`.toLowerCase();
  if (text.includes('deemed') || text.includes('central') || text.includes('icar')) {
    return tax(9202, 'own-central-icar', 'Central / ICAR Deemed University', 'central-icar-deemed-university');
  }
  if (text.includes('state agricultural') || text.includes('sau') || kind === 'state_university') {
    return tax(9201, 'own-sau', 'State Agricultural University (SAU)', 'state-agricultural-university');
  }
  if (text.includes('private')) {
    return tax(9203, 'own-private', 'Private University / College', 'private-university');
  }
  return tax(9204, 'own-public', raw || 'Public Agricultural Institution', 'public-state-university');
}

function buildLocalUniversityCards(): UniversityCard[] {
  const seen = new Set<string>();
  const cards: UniversityCard[] = [];

  publicationUniversities.forEach((doc: PublicationDocument, idx: number) => {
    if (!doc.slug || seen.has(doc.slug)) return;
    seen.add(doc.slug);

    const id = doc.institution_id ?? 8000 + idx;
    const logoMedia = doc.hero_media?.find((m) => m.role === 'logo');
    const cardLogoMedia = doc.hero_media?.find((m) => m.role === 'card_logo');
    const ownership = classifyOwnership(doc.identity?.ownership, doc.identity?.kind);
    const established = doc.identity?.established ? String(doc.identity.established) : null;

    cards.push({
      id,
      documentId: `local-uni-${doc.slug}`,
      createdAt: TS,
      updatedAt: TS,
      publishedAt: TS,
      name: doc.name || doc.title,
      full_name: doc.identity?.short_name ? `${doc.name || doc.title} (${doc.identity.short_name})` : doc.title,
      slug: doc.slug,
      city: doc.identity?.city ?? null,
      state: doc.identity?.state ?? null,
      country: 'India',
      establish: established,
      rating: 4.6,
      position: idx + 1,
      show_apply_button: true,
      apply_button_text: 'Enquire now',
      view_button_text: 'Explore campus',
      logo: toMedia(logoMedia, id * 10 + 1),
      card_logo: toMedia(cardLogoMedia, id * 10 + 2),
      ownership_type: ownership,
      approvals: [
        tax(9301, 'app-icar', 'ICAR Accredited', 'icar'),
        tax(9302, 'app-ugc', 'UGC Recognized', 'ugc'),
      ],
      affiliations: doc.identity?.parent_university
        ? [tax(9400 + idx, `aff-${doc.slug}`, doc.identity.parent_university, doc.slug)]
        : [],
      rankings: [],
      streams: [
        tax(9101, 'stream-agri', 'Agriculture & Allied Sciences', 'agriculture-allied-sciences'),
      ],
      tag: doc.identity?.short_name
        ? tax(9500 + idx, `tag-${doc.slug}`, doc.identity.short_name, doc.slug)
        : null,
      course_modes: [
        tax(9601, 'mode-regular', 'On-Campus (Regular)', 'regular'),
      ],
    });
  });

  UNIVERSITY_GUIDES.forEach((guide, idx) => {
    if (seen.has(guide.slug)) return;
    seen.add(guide.slug);
    const id = 8900 + idx;
    const ownership = classifyOwnership(guide.ownership, undefined);
    cards.push({
      id,
      documentId: `guide-uni-${guide.slug}`,
      createdAt: TS,
      updatedAt: TS,
      publishedAt: TS,
      name: guide.name,
      full_name: `${guide.name} (${guide.mark})`,
      slug: guide.slug,
      city: guide.city,
      state: guide.state,
      country: 'India',
      establish: guide.established || null,
      rating: 4.8,
      position: cards.length + 1,
      show_apply_button: true,
      apply_button_text: 'Enquire now',
      view_button_text: 'Explore campus',
      logo: null,
      card_logo: null,
      ownership_type: ownership,
      approvals: [
        tax(9301, 'app-icar', 'ICAR Accredited', 'icar'),
        tax(9302, 'app-ugc', 'UGC Recognized', 'ugc'),
      ],
      affiliations: [],
      rankings: [],
      streams: [
        tax(9101, 'stream-agri', 'Agriculture & Allied Sciences', 'agriculture-allied-sciences'),
      ],
      tag: tax(9590 + idx, `tag-${guide.slug}`, guide.mark, guide.slug),
      course_modes: [
        tax(9601, 'mode-regular', 'On-Campus (Regular)', 'regular'),
      ],
    });
  });

  return cards;
}

export const LOCAL_UNIVERSITY_CARDS = buildLocalUniversityCards();

function buildLocalUniversityDetail(slug: string): UniversityDetail | null {
  const card = LOCAL_UNIVERSITY_CARDS.find((u) => u.slug === slug);
  if (!card) return null;

  const doc = getPublicationUniversity(slug);
  const guide = UNIVERSITY_GUIDES.find((g) => g.slug === slug);
  const progSlugs = programmesForUniversitySlug(slug);
  const isPrivate = card.ownership_type?.slug === 'private-university';

  const program_fees = progSlugs.map((progSlug, idx) => {
    const prog = getProgrammeContent(progSlug);
    const fee = isPrivate ? 140000 : 42000;
    const note = isPrivate
      ? 'Annual on-campus tuition schedule (merit scholarships applicable via CUET / university test).'
      : 'Subsidised Government / ICAR SAU annual tuition schedule.';
    return {
      id: 9700 + idx,
      program: tax(9800 + idx, `prog-tax-${progSlug}`, prog?.name || progSlug, progSlug),
      fee,
      note,
    };
  });

  const heroImage = doc?.hero_media?.find(
    (m) => m.role === 'campus_primary' || m.role === 'campus_secondary' || m.role === 'campus' || m.role === 'hero' || m.role === 'banner'
  );
  const establishedYear = card.establish ? Number.parseInt(card.establish, 10) : null;

  const highlights: Highlight[] = guide
    ? guide.highlights.map((h, i) => ({ id: i + 1, key: h.key, value: h.value, icon: null }))
    : [
        { id: 1, key: 'Institution Category', value: card.ownership_type?.name || 'State Agricultural University (SAU)', icon: null },
        { id: 2, key: 'Location', value: [card.city, card.state].filter(Boolean).join(', '), icon: null },
        ...(card.establish ? [{ id: 3, key: 'Established', value: card.establish, icon: null }] : []),
        { id: 4, key: 'Delivery Mode', value: '100% Full-Time On-Campus (ICAR / UGC Aligned)', icon: null },
        { id: 5, key: 'Published Programmes', value: `${progSlugs.length} On-Campus Agricultural Programmes`, icon: null },
      ];

  const university_contents: ContentSectionRef[] = (doc?.tabs || []).map((t, idx) => ({
    id: 9900 + idx,
    documentId: `uni-tab-${slug}-${t.id}`,
    name: t.label,
    slug: `${slug}--${t.id}`,
    secondary_slug: t.id,
    display_name: t.label,
    heading: `${card.name} — ${t.label}`,
    position: idx + 1,
  }));

  return {
    ...card,
    agriculture_content: doc ?? undefined,
    approvals: card.approvals.map((a) => ({ ...a, logo: null })),
    address: guide?.address || [card.city, card.state, 'India'].filter(Boolean).join(', '),
    established_year: Number.isFinite(establishedYear) ? establishedYear : null,
    program_fees,
    pincode: null,
    heading: doc?.title || `${card.name} — On-Campus Agriculture Admissions, Courses & Fees`,
    show_similar_universities: true,
    image: toMedia(heroImage, card.id * 10 + 9),
    brochure: null,
    seo: {
      metaTitle: doc?.meta_title || `${card.name} — Courses, Fees, ICAR Cut-Off & Admissions | Agrico`,
      metaDescription:
        doc?.description ||
        guide?.description ||
        `Explore on-campus agriculture programmes, fee structures, ICAR/state admission routes, and campus facilities at ${card.name}.`,
      keywords: `${card.name}, ${card.city || ''}, ${card.state || ''}, B.Sc Agriculture, ICAR admission`,
      metaRobots: 'index,follow',
      metaViewport: null,
      canonicalURL: `https://agrico.in/university/${card.slug}`,
      structuredData: null,
      metaImage: card.logo,
    },
    highlights,
    exams: [
      tax(9951, 'exam-cuet-icar', 'CUET (ICAR-UG)', 'cuet-icar-ug'),
      tax(9952, 'exam-icar-pg', 'ICAR AIEEA (PG)', 'icar-aieea-pg'),
    ],
    courses: progSlugs.map((progSlug, idx) => {
      const prog = getProgrammeContent(progSlug);
      return tax(9850 + idx, `course-tax-${progSlug}`, prog?.short_name || prog?.name || progSlug, progSlug);
    }),
    course_modes: card.course_modes ?? [tax(9601, 'mode-regular', 'On-Campus (Regular)', 'regular')],
    course_types: [tax(9651, 'type-full-time', 'Full-Time On-Campus Degree', 'full-time')],
    institute_tiers: [],
    university_contents,
  };
}

function filterLocalUniversities(cards: UniversityCard[], params: UniversityListParams): UniversityCard[] {
  const term = searchTerm(params.search)?.toLowerCase();
  return cards.filter((u) => {
    if (params.stream && !u.streams.some((s) => s.slug === params.stream)) return false;
    if (params.ownership && u.ownership_type?.slug !== params.ownership) return false;
    if (params.approval && !u.approvals.some((a) => a.slug === params.approval)) return false;
    if (params.state && u.state?.toLowerCase() !== params.state.toLowerCase()) return false;
    if (params.city && u.city?.toLowerCase() !== params.city.toLowerCase()) return false;
    if (term) {
      const hay = `${u.name} ${u.full_name ?? ''} ${u.city ?? ''} ${u.state ?? ''} ${u.tag?.name ?? ''}`.toLowerCase();
      if (!hay.includes(term)) return false;
    }
    return true;
  });
}

function paginateLocalUniversities(
  cards: UniversityCard[],
  params: UniversityListParams
): { universities: UniversityCard[]; pagination: Pagination } {
  const filtered = filterLocalUniversities(cards, params);
  const pageSize = Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, 100);
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.max(1, params.page ?? 1);
  const start = (page - 1) * pageSize;
  return {
    universities: filtered.slice(start, start + pageSize),
    pagination: { page, pageSize, pageCount, total },
  };
}

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

function enrichUniversityCardMedia(u: UniversityCard): UniversityCard {
  if (u.logo && u.card_logo) return u;
  const local = LOCAL_UNIVERSITY_CARDS.find((item) => item.slug === u.slug);
  if (!local) return u;
  return {
    ...u,
    logo: u.logo ?? local.logo,
    card_logo: u.card_logo ?? local.card_logo ?? local.logo,
  };
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

    if (data && data.length > 0) {
      return {
        universities: data.map(enrichUniversityCardMedia),
        pagination: meta?.pagination ?? {
          page: params.page ?? 1,
          pageSize: data.length,
          pageCount: 1,
          total: data.length,
        },
      };
    }
    return paginateLocalUniversities(LOCAL_UNIVERSITY_CARDS, params);
  } catch (err) {
    if (!(err && typeof err === 'object' && 'status' in err && err.status === 503)) {
      console.warn('[cms] listUniversities fallback:', (err as Error).message);
    }
    return paginateLocalUniversities(LOCAL_UNIVERSITY_CARDS, params);
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
    if (json.data) {
      const localDetail = buildLocalUniversityDetail(slug);
      return {
        ...json.data,
        logo: json.data.logo ?? localDetail?.logo ?? null,
        card_logo: json.data.card_logo ?? localDetail?.card_logo ?? localDetail?.logo ?? null,
        image: json.data.image ?? localDetail?.image ?? null,
      };
    }
    return buildLocalUniversityDetail(slug);
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 404) {
      return buildLocalUniversityDetail(slug);
    }
    return buildLocalUniversityDetail(slug);
  }
}

/**
 * Slugs for generateStaticParams. Only the most recently updated are
 * prerendered; the rest are generated on first request and then cached, so a
 * large catalogue does not blow up build time.
 */
export async function getUniversitySlugs(limit = 200): Promise<string[]> {
  const cmsSlugs = await cmsFetchOptional(async () => {
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

  const merged = new Set<string>([...cmsSlugs, ...LOCAL_UNIVERSITY_CARDS.map((u) => u.slug)]);
  return [...merged].slice(0, limit);
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

  const cmsRelated = await cmsFetchOptional(async () => {
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

  if (cmsRelated.length > 0) return cmsRelated.map(enrichUniversityCardMedia);

  const sameState = LOCAL_UNIVERSITY_CARDS.filter(
    (u) => u.slug !== university.slug && university.state && u.state?.toLowerCase() === university.state.toLowerCase()
  );
  if (sameState.length >= limit) return sameState.slice(0, limit);

  const rest = LOCAL_UNIVERSITY_CARDS.filter(
    (u) => u.slug !== university.slug && !sameState.some((s) => s.slug === u.slug)
  );
  return [...sameState, ...rest].slice(0, limit);
}

/**
 * Names and slugs only, for pickers that need the whole catalogue in one
 * <select> rather than a page of cards.
 */
export async function listUniversityOptions(limit = 60): Promise<Taxonomy[]> {
  const cmsOptions = await cmsFetchOptional(async () => {
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

  if (cmsOptions.length > 0) return cmsOptions;
  return LOCAL_UNIVERSITY_CARDS.slice(0, limit).map((u) =>
    tax(u.id, u.documentId, u.name, u.slug)
  );
}
