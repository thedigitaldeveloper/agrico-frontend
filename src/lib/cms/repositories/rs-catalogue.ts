import 'server-only';
import { cmsCollection, cmsFetchOptional, searchTerm, type CmsQuery } from '../client';
import { blocksToText, type BlocksContent } from '../blocks';
import { resolveImage, mediaUrl } from '../media';
import { collectionTag } from '../tags';
import type { Media, Pagination } from '../types';
import { intentsFor } from '@/components/home/course-finder-intents';
import type { Offering } from '@/components/rs/home-types';

interface Term { documentId: string; name: string; slug: string }
interface CatalogueProgram extends Term {
  full_name: string | null;
  short_description: BlocksContent | null;
  duration: number | null;
  duration_text: string | null;
  duration_type: Term | null;
  course: (Term & { level: Term | null }) | null;
  course_mode: Term | null;
  course_type: Term | null;
  stream: Term | null;
  syllabus: Media | null;
  thumbnail: Media | null;
  eligibilities: Term[];
  universities: Term[];
}
interface CatalogueUniversity extends Term {
  city: string | null;
  state: string | null;
  logo: Media | null;
  card_logo: Media | null;
  image: Media | null;
  establish: string | null;
  established_year: number | null;
  rating: number | string | null;
  ownership_type: Term | null;
  approvals: Term[];
  rankings: Term[];
  course_modes: Term[];
  program_fees: Array<{ fee: number | string | null; note: string | null; program: { slug: string } | null }>;
}
export interface CatalogueFilters {
  stream?: string;
  course?: string;
  mode?: string;
  level?: string;
  /** Exact programme fallback when a published record has no course taxonomy. */
  program?: string;
  search?: string;
}

/** Read every page, not just the first 100 records or the homepage selections. */
async function allRecords<T>(path: string, query: CmsQuery, tags: string[], revalidate?: number): Promise<T[]> {
  const records: T[] = [];
  for (let page = 1; ; page += 1) {
    const { data, meta } = await cmsCollection<T>(path, {
      ...query, status: 'published', pagination: { page, pageSize: 100 },
    }, { tags, revalidate });
    records.push(...data);
    if (!data.length || page >= (meta?.pagination?.pageCount ?? 1)) break;
  }
  return records;
}
function publishedFee(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}
function programFilters(params: CatalogueFilters): CmsQuery['filters'] {
  const filters: Record<string, unknown> = {};
  if (params.stream) filters.stream = { slug: { $eq: params.stream } };
  if (params.course) filters.course = { slug: { $eq: params.course } };
  if (params.mode) filters.course_mode = { slug: { $eq: params.mode } };
  if (params.program) filters.slug = { $eq: params.program };
  if (params.level) filters.course = { ...(filters.course as object), level: { slug: { $eq: params.level } } };
  const term = searchTerm(params.search);
  if (term) filters.$or = [
    { name: { $containsi: term } }, { full_name: { $containsi: term } },
    { course_code: { $containsi: term } }, { course: { name: { $containsi: term } } },
  ];
  return filters;
}

/** Catalogue-only loader shared by discovery and listing; never reads Home or editorial sections. */
export async function getRsCatalogue(params: CatalogueFilters = {}) {
  const tags = (['program', 'university', 'course', 'level', 'course-mode', 'course-type', 'duration-type', 'eligibility', 'stream'] as const).map(collectionTag);
  const [programs, universities] = await Promise.all([
    cmsFetchOptional(() => allRecords<CatalogueProgram>('/programs', {
      view: 'homepage', filters: programFilters(params), sort: ['position:asc', 'name:asc', 'slug:asc'],
      fields: ['name', 'slug', 'full_name', 'duration', 'duration_text', 'short_description'],
      populate: {
        course: { populate: { level: true } },
        course_mode: true, course_type: true, duration_type: true, stream: true,
        eligibilities: true, syllabus: true, thumbnail: true,
        universities: { fields: ['name', 'slug'] },
      },
    }, tags, searchTerm(params.search) ? 0 : undefined), []),
    cmsFetchOptional(() => allRecords<CatalogueUniversity>('/universities', {
      view: 'homepage', sort: ['position:asc', 'name:asc', 'slug:asc'],
      fields: ['name', 'slug', 'city', 'state', 'establish', 'established_year', 'rating'],
      populate: { logo: true, card_logo: true, image: true, ownership_type: true, approvals: true, rankings: true, course_modes: true, program_fees: { populate: { program: { fields: ['slug'] } } } },
    }, tags), []),
  ]);
  const validPrograms = programs.filter(item => Boolean(item?.documentId && item.slug && item.name?.trim()));
  const validUniversities = universities.filter(item => Boolean(item?.documentId && item.slug && item.name?.trim()));
  const universityMap = new Map(validUniversities.map(university => [university.slug, university]));
  const offerings: Offering[] = [];
  const seen = new Set<string>();
  for (const program of validPrograms) {
    for (const relation of program.universities ?? []) {
      if (!relation?.slug) continue;
      const university = universityMap.get(relation.slug);
      // A pair is available only when both records are publicly published.
      if (!university) continue;
      const id = university.documentId + ':' + program.documentId + ':' + (program.course_mode?.slug || 'unspecified');
      if (seen.has(id)) continue;
      seen.add(id);
      const fee = university.program_fees?.find(row => row.program?.slug === program.slug);
      const degree = program.course?.name?.trim() || program.name.trim();
      const rawDuration = program.duration == null ? NaN : Number(program.duration);
      const duration = Number.isFinite(rawDuration) && rawDuration > 0 ? rawDuration : null;
      const image = resolveImage(program.thumbnail || university.image);
      offerings.push({
        id, university: university.name, universitySlug: university.slug,
        program: program.name, programSlug: program.slug, degree,
        courseSlug: program.course?.slug || '',
        fullName: program.full_name || program.name, level: program.course?.level?.name || '',
        mode: program.course_mode?.name || 'Mode to be confirmed', modeSlug: program.course_mode?.slug || '',
        duration: program.duration_text?.trim() || (duration && program.duration_type?.name
          ? duration + ' ' + program.duration_type.name : 'Duration to be confirmed'),
        durationValue: duration, durationUnit: program.duration_type?.name || '',
        fee: publishedFee(fee?.fee), feeNote: fee?.note || '',
        eligibility: (program.eligibilities ?? []).flatMap(item => item?.name?.trim() ? [item.name.trim()] : []),
        syllabus: mediaUrl(program.syllabus?.url), logo: resolveImage(university.logo)?.src || null,
        cardLogo: resolveImage(university.card_logo)?.src || null,
        image: image?.src || null, imageAlt: image?.alt || '', summary: blocksToText(program.short_description).trim(),
        intentKeys: intentsFor({
          name: program.name, courseName: degree, levelName: program.course?.level?.name || '',
          streamName: program.stream?.name || '', modeName: program.course_mode?.name || '', typeName: program.course_type?.name || '',
        }),
        href: '/offering/' + encodeURIComponent(university.slug) + '/' + encodeURIComponent(program.slug),
      });
    }
  }
  return { programs: validPrograms, universities: validUniversities, offerings };
}

/** Paginate the joined university/programme pairs so shared programmes never disappear or inflate a page. */
export async function listRsOfferings(params: CatalogueFilters & { page?: number; pageSize?: number } = {}): Promise<{ offerings: Offering[]; pagination: Pagination }> {
  const { offerings } = await getRsCatalogue(params);
  const page = Number.isSafeInteger(params.page) && (params.page ?? 0) > 0 ? params.page! : 1;
  const pageSize = Number.isSafeInteger(params.pageSize) && (params.pageSize ?? 0) > 0 ? Math.min(params.pageSize!, 100) : 12;
  return {
    offerings: offerings.slice((page - 1) * pageSize, page * pageSize),
    pagination: { page, pageSize, total: offerings.length, pageCount: Math.ceil(offerings.length / pageSize) },
  };
}
