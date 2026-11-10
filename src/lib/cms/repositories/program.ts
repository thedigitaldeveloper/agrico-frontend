import {
  getProgrammeContent,
  getProgrammeSectionRefs,
  listProgrammeContent,
  programmesForUniversitySlug,
  programmeUniversities,
  type ProgrammeContent,
} from '@/lib/agrico/programme-content';
import { cmsCollection, cmsFetch, cmsFetchOptional, searchTerm, type CmsQuery } from '../client';
import { collectionTag, entryTag } from '../tags';
import type { Media, Pagination, Seo, StrapiEntry } from '../types';
import { listContentSectionRefs } from './content';
import { LOCAL_UNIVERSITY_CARDS, type ContentSectionRef, type Highlight, type Taxonomy, type UniversityCard } from './university';

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
  note?: string | null;
  /** A waiver the university already applies, subtracted from `fee`. */
  subsidy_amount: number | null;
  position: number | null;
  university: UniversityCard | null;
  fee_lines: FeeLine[];
}

export interface ProgramCard extends StrapiEntry {
  universities?: Array<Pick<UniversityCard, 'name' | 'slug' | 'documentId'> & Partial<Pick<UniversityCard, 'logo' | 'card_logo'>>>;
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
const TS = '2026-11-01T00:00:00.000Z';

function tax(id: number, documentId: string, name: string, slug: string): Taxonomy {
  return { id, documentId, name, slug, createdAt: TS, updatedAt: TS, publishedAt: TS };
}

function buildLocalProgramDetail(doc: ProgrammeContent, idx: number): ProgramDetail {
  const slug = doc.slug;
  const isPG = doc.level.toLowerCase().includes('postgraduate');
  const isDip = doc.level.toLowerCase().includes('diploma');
  const levelTax = isPG
    ? tax(9702, 'lvl-pg', 'Postgraduate (PG)', 'postgraduate')
    : isDip
      ? tax(9703, 'lvl-diploma', 'Diploma', 'diploma')
      : tax(9701, 'lvl-ug', 'Undergraduate (UG)', 'undergraduate');

  const courseSlug = slug.startsWith('msc-') ? 'msc-agronomy' : slug;
  const courseName = slug.startsWith('msc-') ? 'M.Sc. Agriculture' : doc.short_name || doc.name;

  const streamTax =
    slug.includes('horticulture') || slug.includes('fruit') || slug.includes('vegetable') || slug.includes('floriculture')
      ? tax(9102, 'stream-hort', 'Horticulture & Forestry', 'horticulture-forestry')
      : slug.includes('engineering')
        ? tax(9103, 'stream-eng', 'Agricultural Engineering & Tech', 'agricultural-engineering')
        : slug.includes('agribusiness')
          ? tax(9104, 'stream-abm', 'Agribusiness Management', 'agribusiness-management')
          : slug.includes('fisheries') || slug.includes('bvsc')
            ? tax(9105, 'stream-vet', 'Veterinary, Dairy & Fisheries', 'veterinary-dairy-fisheries')
            : tax(9101, 'stream-agri', 'Agriculture & Allied Sciences', 'agriculture-allied-sciences');

  const durationNum = isPG || isDip ? 2 : slug === 'bvsc-animal-husbandry' ? 5.5 : 4;
  const feeNum =
    slug === 'mba-agribusiness'
      ? 120000
      : slug === 'btech-agricultural-engineering'
        ? 85000
        : slug === 'bvsc-animal-husbandry'
          ? 60000
          : slug.startsWith('msc-')
            ? 35000
            : isDip
              ? 18000
              : 45000;
  const avgPkg =
    slug === 'mba-agribusiness'
      ? '₹6.5 - ₹12.5 LPA'
      : slug.startsWith('msc-')
        ? '₹5.5 - ₹9.5 LPA'
        : isDip
          ? '₹2.5 - ₹4.0 LPA'
          : '₹4.5 - ₹8.5 LPA';

  const matchedUnis = programmeUniversities(slug).map((u, uIdx) => ({
    id: 8000 + uIdx,
    documentId: `local-uni-${u.slug}`,
    createdAt: TS,
    updatedAt: TS,
    publishedAt: TS,
    name: u.name,
    full_name: u.name,
    slug: u.slug,
    city: u.city || null,
    state: u.state || null,
    country: 'India',
    establish: null,
    rating: 4.6,
    position: uIdx + 1,
    show_apply_button: true,
    apply_button_text: 'Enquire now',
    view_button_text: 'Explore campus',
    logo: u.logo
      ? {
          id: 81000 + uIdx,
          documentId: `media-prog-uni-${uIdx}`,
          url: u.logo,
          name: u.name,
          alternativeText: u.name,
          caption: null,
          width: 200,
          height: 200,
          mime: 'image/png',
          size: 20,
          formats: null,
          createdAt: TS,
          updatedAt: TS,
          publishedAt: TS,
        }
      : null,
    card_logo: null,
    ownership_type: tax(9201, 'own-sau', 'Agricultural University / College', 'state-agricultural-university'),
    approvals: [
      tax(9301, 'app-icar', 'ICAR Accredited', 'icar'),
      tax(9302, 'app-ugc', 'UGC Recognized', 'ugc'),
    ],
    affiliations: [],
    rankings: [],
    streams: [streamTax],
    tag: null,
    course_modes: [tax(9601, 'mode-regular', 'On-Campus (Regular)', 'regular')],
    program_fees: [
      {
        id: 85000 + uIdx,
        program: tax(9000 + idx, `prog-${slug}`, doc.name, slug),
        fee: feeNum,
        note: 'Indicative annual academic fee; verify latest prospectus.',
      },
    ],
  }));

  const highlights: Highlight[] = (doc.overview?.highlights || []).map((h, hIdx) => ({
    id: 94000 + hIdx,
    key: h.label,
    value: h.value,
    icon: null,
  }));

  return {
    id: 9000 + idx,
    documentId: `local-prog-${slug}`,
    createdAt: TS,
    updatedAt: TS,
    publishedAt: TS,
    name: doc.short_name || doc.name,
    full_name: doc.name,
    slug,
    duration: durationNum,
    duration_text: doc.duration || `${durationNum} years`,
    fee: feeNum,
    average_package: avgPkg,
    rating: 4.8,
    position: idx + 1,
    course_code: doc.short_name || doc.name,
    show_apply_button: true,
    apply_button_text: 'Get programme guidance',
    view_button_text: 'Explore syllabus',
    program_icon: null,
    course: {
      ...tax(9800 + idx, `crs-${courseSlug}`, courseName, courseSlug),
      level: levelTax,
      icon: null,
    },
    stream: streamTax,
    course_mode: tax(9601, 'mode-regular', 'On-Campus (Regular)', 'regular'),
    course_type: isDip
      ? tax(9652, 'type-diploma', 'Diploma Programme', 'diploma')
      : tax(9651, 'type-degree', 'Degree Programme', 'degree'),
    duration_type: tax(9661, 'dur-years', 'Years', 'years'),
    tag: null,
    brochure: null,
    syllabus: null,
    short_description: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: doc.hero?.summary || doc.seo?.description || '' }],
      },
    ],
    seo: {
      metaTitle: doc.seo?.title || `${doc.name} — Course, Syllabus, Eligibility, Fees & Careers`,
      metaDescription: doc.seo?.description || doc.hero?.summary || '',
      keywords: (doc.seo?.keywords || []).join(', '),
      metaRobots: 'index,follow',
      metaViewport: null,
      canonicalURL: `https://agrico.in/${slug}`,
      structuredData: null,
      metaImage: null,
    },
    highlights,
    eligibilities: (doc.eligibility?.points || []).map((pt, eIdx) =>
      tax(94500 + eIdx, `elig-${slug}-${eIdx}`, pt, `elig-${eIdx}`)
    ),
    exams: [
      tax(7101, 'agr-exam-cuet-icar-ug', isPG ? 'ICAR AIEEA (PG)' : 'CUET (ICAR-UG)', isPG ? 'icar-aieea-pg' : 'icar-cuet-ug'),
    ],
    universities: matchedUnis,
    program_offerings: matchedUnis.map((u, uIdx) => ({
      id: 86000 + uIdx,
      documentId: `offering-${u.slug}-${slug}`,
      createdAt: TS,
      updatedAt: TS,
      publishedAt: TS,
      fee: feeNum,
      note: 'Indicative annual academic fee',
      subsidy_amount: null,
      position: uIdx + 1,
      university: u,
      fee_lines: [],
    })),
    university_contents: getProgrammeSectionRefs(slug),
  };
}

function getAllLocalProgramDetails(): ProgramDetail[] {
  return listProgrammeContent().map((doc, idx) => buildLocalProgramDetail(doc, idx));
}

function filterLocalPrograms(items: ProgramDetail[], params: ProgramListParams): ProgramCard[] {
  const term = searchTerm(params.search)?.toLowerCase();
  return items.filter((p) => {
    if (params.stream && p.stream?.slug !== params.stream) return false;
    if (params.course && p.course?.slug !== params.course && p.slug !== params.course) return false;
    if (params.mode && p.course_mode?.slug !== params.mode) return false;
    if (params.level && p.course?.level?.slug !== params.level) return false;
    if (params.university && !p.universities.some((u) => u.slug === params.university)) return false;
    if (term) {
      const hay = `${p.name} ${p.full_name ?? ''} ${p.course?.name ?? ''} ${p.stream?.name ?? ''}`.toLowerCase();
      if (!hay.includes(term)) return false;
    }
    return true;
  });
}

function buildFilters(params: ProgramListParams): CmsQuery['filters'] {
  const filters: Record<string, unknown> = {};

  if (params.stream) filters.stream = { slug: { $eq: params.stream } };
  if (params.course) filters.course = { slug: { $eq: params.course } };
  if (params.mode) filters.course_mode = { slug: { $eq: params.mode } };
  if (params.type) filters.course_type = { slug: { $eq: params.type } };
  if (params.university) filters.universities = { slug: { $eq: params.university } };
  if (params.level) {
    filters.course = { ...(filters.course as object), level: { slug: { $eq: params.level } } };
  }

  const term = searchTerm(params.search);
  if (term) {
    filters.$or = [
      { name: { $containsi: term } },
      { full_name: { $containsi: term } },
      { course_code: { $containsi: term } },
      { course: { name: { $containsi: term } } },
    ];
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

    if (data && data.length > 0) {
      const enriched = data.map((p) => ({
        ...p,
        universities: (p.universities || []).map((u) => {
          if (u.logo && u.card_logo) return u;
          const local = LOCAL_UNIVERSITY_CARDS.find((item) => item.slug === u.slug);
          return local ? { ...u, logo: u.logo ?? local.logo, card_logo: u.card_logo ?? local.card_logo ?? local.logo } : u;
        }),
      }));
      return {
        programs: enriched,
        pagination: meta?.pagination ?? { page: 1, pageSize: enriched.length, pageCount: 1, total: enriched.length },
      };
    }
    const localCards = filterLocalPrograms(getAllLocalProgramDetails(), params);
    const pageSize = Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, 100);
    const page = Math.max(1, params.page ?? 1);
    const total = localCards.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    return {
      programs: localCards.slice(start, start + pageSize),
      pagination: { page, pageSize, pageCount, total },
    };
  } catch (err) {
    if (!(err && typeof err === 'object' && 'status' in err && err.status === 503)) console.warn('[cms] listPrograms fallback:', (err as Error).message);
    const localCards = filterLocalPrograms(getAllLocalProgramDetails(), params);
    const pageSize = Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, 100);
    const page = Math.max(1, params.page ?? 1);
    const total = localCards.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    return {
      programs: localCards.slice(start, start + pageSize),
      pagination: { page, pageSize, pageCount, total },
    };
  }
}

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
      prog.universities = (prog.universities || []).map((u) => {
        if (u.logo && u.card_logo) return u;
        const local = LOCAL_UNIVERSITY_CARDS.find((item) => item.slug === u.slug);
        return local ? { ...u, logo: u.logo ?? local.logo, card_logo: u.card_logo ?? local.card_logo ?? local.logo } : u;
      });
      // Fee rows are edited on the university; there is no program-offering
      // collection in this CMS. Join the actual component rows by program slug.
      prog.program_offerings = prog.universities.flatMap((university) =>
        (university.program_fees ?? [])
          .filter((row) => row.program?.slug === prog.slug)
          .map((row) => ({
            id: row.id,
            documentId: `${university.documentId}:${row.id}`,
            createdAt: university.createdAt,
            updatedAt: university.updatedAt,
            publishedAt: university.publishedAt,
            fee: row.fee,
            note: row.note ?? null,
            subsidy_amount: null,
            position: null,
            university,
            fee_lines: [],
          }))
      );
    }
    if (prog && (!prog.university_contents || prog.university_contents.length === 0)) {
      const secRefs = await listContentSectionRefs('program', slug);
      prog.university_contents = (secRefs.length > 0 ? secRefs : getProgrammeSectionRefs(slug)) as unknown as ContentSectionRef[];
    }
    if (prog) return prog;
  } catch (error) {
    if (!(error instanceof Error && 'status' in error && (error.status === 404 || error.status === 503))) {
      console.warn('[cms] getProgramBySlug fallback:', (error as Error).message);
    }
  }
  const doc = getProgrammeContent(slug);
  if (!doc) return null;
  const idx = listProgrammeContent().findIndex((d) => d.slug === slug);
  return buildLocalProgramDetail(doc, idx >= 0 ? idx : 0);
}

export async function getProgramSlugs(limit = 200): Promise<string[]> {
  const cmsSlugs = await cmsFetchOptional(async () => {
    const { data } = await cmsCollection<{ slug: string }>(
      '/programs',
      { fields: ['slug'], sort: 'updatedAt:desc', pagination: { pageSize: limit } },
      { tags: [collectionTag('program')] }
    );
    return data.map((entry) => entry.slug).filter(Boolean);
  }, []);

  const merged = new Set<string>([...cmsSlugs, ...listProgrammeContent().map((d) => d.slug)]);
  return [...merged].slice(0, limit);
}

export async function listRelatedPrograms(
  program: Pick<ProgramDetail, 'slug' | 'stream'>,
  limit = 6
): Promise<ProgramCard[]> {
  const stream = program.stream?.slug;
  if (stream) {
    const { programs } = await listPrograms({ stream, pageSize: limit + 1 });
    const filtered = programs.filter((entry) => entry.slug !== program.slug).slice(0, limit);
    if (filtered.length > 0) return filtered;
  }
  return getAllLocalProgramDetails()
    .filter((entry) => entry.slug !== program.slug)
    .slice(0, limit);
}

export async function listUniversityPrograms(
  slug: string,
  limit = 100
): Promise<ProgramCard[]> {
  const cmsPrograms = await cmsFetchOptional(async () => {
    const programs: ProgramCard[] = [];
    let page = 1;
    while (true) {
      const { data, meta } = await cmsCollection<ProgramCard>(
        '/programs',
        {
          filters: buildFilters({ university: slug }),
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

  if (cmsPrograms.length > 0) return cmsPrograms;
  const progSlugs = programmesForUniversitySlug(slug);
  const allLocal = getAllLocalProgramDetails();
  return allLocal.filter((p) => progSlugs.includes(p.slug)).slice(0, limit);
}
