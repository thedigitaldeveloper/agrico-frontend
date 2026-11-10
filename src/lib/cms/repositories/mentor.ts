import { cmsCollection, cmsFetch, cmsFetchOptional, searchTerm, type CmsQuery } from '../client';
import { collectionTag, entryTag } from '../tags';
import type { Media, Pagination, Seo, StrapiEntry } from '../types';
import type { Taxonomy } from './university';

/**
 * Mentors are public: the directory and each profile are ordinary cached reads.
 * Only booking and profile editing need the signed-in user's token, and those
 * go through lib/auth/session.
 */

export interface AvailabilitySlot {
  id: number;
  day_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
}

export interface MentorCard extends StrapiEntry {
  display_name: string;
  slug: string;
  headline: string | null;
  experience_years: number | null;
  languages: string | null;
  is_accepting_bookings: boolean;
  session_minutes: number;
  photo: Media | null;
  streams: Taxonomy[];
  courses: Taxonomy[];
}

export interface MentorDetail extends MentorCard {
  bio: string | null;
  seo: Seo | null;
  availability: AvailabilitySlot[];
}

export interface MentorListParams {
  page?: number;
  pageSize?: number;
  stream?: string;
  search?: string;
}

const DEFAULT_PAGE_SIZE = 24;
const TS = '2026-10-30T00:00:00.000Z';

function tax(id: number, documentId: string, name: string, slug: string): Taxonomy {
  return { id, documentId, name, slug, createdAt: TS, updatedAt: TS, publishedAt: TS };
}

const DEFAULT_AVAILABILITY: AvailabilitySlot[] = [
  { id: 1, day_of_week: 'monday', start_time: '10:00', end_time: '18:00' },
  { id: 2, day_of_week: 'tuesday', start_time: '10:00', end_time: '18:00' },
  { id: 3, day_of_week: 'wednesday', start_time: '10:00', end_time: '18:00' },
  { id: 4, day_of_week: 'thursday', start_time: '10:00', end_time: '18:00' },
  { id: 5, day_of_week: 'friday', start_time: '10:00', end_time: '18:00' },
  { id: 6, day_of_week: 'saturday', start_time: '11:00', end_time: '16:00' },
];

const FALLBACK_MENTORS: MentorDetail[] = [
  {
    id: 7401,
    documentId: 'agr-mentor-rajeshwar-singh',
    createdAt: TS,
    updatedAt: TS,
    publishedAt: TS,
    display_name: 'Dr. Rajeshwar Singh',
    slug: 'dr-rajeshwar-singh-agronomy',
    headline: 'Senior Agriculture & ICAR Seat Allocation Advisor · Former SAU Academic Counsellor',
    experience_years: 14,
    languages: 'English, Hindi, Punjabi',
    is_accepting_bookings: true,
    session_minutes: 30,
    photo: null,
    streams: [
      tax(9101, 'stream-agri', 'Agriculture & Allied Sciences', 'agriculture-allied-sciences'),
      tax(9102, 'stream-hort', 'Horticulture & Forestry', 'horticulture-forestry'),
    ],
    courses: [
      tax(9801, 'crs-bsc-agri', 'B.Sc. (Hons.) Agriculture', 'bsc-agriculture'),
      tax(9805, 'crs-msc-agro', 'M.Sc. Agriculture (Agronomy)', 'msc-agronomy'),
      tax(9803, 'crs-bsc-hort', 'B.Sc. (Hons.) Horticulture', 'bsc-horticulture'),
    ],
    bio: `Dr. Rajeshwar Singh holds a Ph.D. in Agronomy and has spent over 14 years advising undergraduate and postgraduate agriculture aspirants across North and Central India. He specialises in evaluating State Agricultural Universities (PAU Ludhiana, GBPUAT Pantnagar, CCSHAU Hisar, IARI New Delhi) alongside ICAR-accredited private agricultural colleges.\n\nIn a 1-on-1 session, he walks students and parents through ICAR NAEAB accreditation scope (checking whether the specific degree and campus are covered in the latest ICAR public register), instructional farm acreage, RAWE field training quality, and realistic cutoff trends in CUET (ICAR-UG), UPCATET, and Rajasthan JET.`,
    seo: null,
    availability: DEFAULT_AVAILABILITY,
  },
  {
    id: 7402,
    documentId: 'agr-mentor-priya-deshmukh',
    createdAt: TS,
    updatedAt: TS,
    publishedAt: TS,
    display_name: 'Priya Deshmukh',
    slug: 'priya-deshmukh-icar-counselling',
    headline: 'ICAR AIQ & State CET Choice-Filling Specialist (MHT-CET, KCET, AP/TS EAPCET)',
    experience_years: 9,
    languages: 'English, Hindi, Marathi',
    is_accepting_bookings: true,
    session_minutes: 30,
    photo: null,
    streams: [
      tax(9101, 'stream-agri', 'Agriculture & Allied Sciences', 'agriculture-allied-sciences'),
      tax(9102, 'stream-hort', 'Horticulture & Forestry', 'horticulture-forestry'),
    ],
    courses: [
      tax(9801, 'crs-bsc-agri', 'B.Sc. (Hons.) Agriculture', 'bsc-agriculture'),
      tax(9803, 'crs-bsc-hort', 'B.Sc. (Hons.) Horticulture', 'bsc-horticulture'),
    ],
    bio: `Priya Deshmukh has guided more than 2,200 students through centralized ICAR All-India Quota (AIQ) counselling and state agriculture admission portals including MCAER / MHT-CET (Maharashtra), KEA KCET Agriculturist Quota, TNAU single-window counselling, and ANGRAU / PJTSAU EAPCET rounds.\n\nShe helps families compare State Agricultural University constituent colleges against affiliated and private ICAR-accredited campuses, verify 7/12 land-record practical test bonuses, and calculate total 4-year residential outlay (tuition, hostel, mess, and ICAR National Talent Scholarship offsets).`,
    seo: null,
    availability: DEFAULT_AVAILABILITY,
  },
  {
    id: 7403,
    documentId: 'agr-mentor-arjun-verma',
    createdAt: TS,
    updatedAt: TS,
    publishedAt: TS,
    display_name: 'Er. Arjun Verma',
    slug: 'arjun-verma-agri-engineering',
    headline: 'B.Tech. Agricultural Engineering, Food Tech & Precision Farming Career Mentor',
    experience_years: 11,
    languages: 'English, Hindi',
    is_accepting_bookings: true,
    session_minutes: 30,
    photo: null,
    streams: [
      tax(9103, 'stream-eng', 'Agricultural Engineering & Tech', 'agricultural-engineering'),
    ],
    courses: [
      tax(9802, 'crs-btech-ag', 'B.Tech. Agricultural Engineering', 'btech-agricultural-engineering'),
    ],
    bio: `An alumnus of GBPUAT Pantnagar in Agricultural Engineering, Arjun Verma advises PCM and PCA stream students exploring B.Tech. Agricultural Engineering, Dairy Technology, and Food Technology.\n\nHe focuses on farm machinery testing laboratories, soil and water conservation workshops, GATE (AG) preparation for M.Tech. at IIT Kharagpur / ICAR-CIAE Bhopal, and technical placements across tractor OEMs, micro-irrigation leaders, and precision agri-tech startups.`,
    seo: null,
    availability: DEFAULT_AVAILABILITY,
  },
  {
    id: 7404,
    documentId: 'agr-mentor-meera-nair',
    createdAt: TS,
    updatedAt: TS,
    publishedAt: TS,
    display_name: 'Meera Nair',
    slug: 'meera-nair-agribusiness-vet',
    headline: 'MBA Agribusiness (ABM), ICAR-PG (AIEEA) & Veterinary Admissions Counsellor',
    experience_years: 10,
    languages: 'English, Hindi, Malayalam, Tamil',
    is_accepting_bookings: true,
    session_minutes: 30,
    photo: null,
    streams: [
      tax(9104, 'stream-abm', 'Agribusiness Management', 'agribusiness-management'),
      tax(9105, 'stream-vet', 'Veterinary, Dairy & Fisheries', 'veterinary-dairy-fisheries'),
    ],
    courses: [
      tax(9804, 'crs-mba-abm', 'MBA Agribusiness Management', 'mba-agribusiness'),
      tax(9806, 'crs-bvsc', 'B.V.Sc. & A.H.', 'bvsc-animal-husbandry'),
      tax(9805, 'crs-msc-agro', 'M.Sc. Agriculture (Agronomy)', 'msc-agronomy'),
    ],
    bio: `Meera Nair specialises in postgraduate agribusiness and allied sciences admissions, including CAT / CMAT / ICAR AIEEA (PG) pathways for MBA in Agribusiness Management (MANAGE Hyderabad, IRMA Anand, NAARM, IIM-A/L FABM, and SAU ABM colleges) as well as VCI 15% All-India Quota counselling for B.V.Sc. & A.H.\n\nShe helps agriculture graduates evaluate ROI, summer commodity-desk internships, agri-input and rural banking recruitment, and ICAR PG / JRF fellowship eligibility.`,
    seo: null,
    availability: DEFAULT_AVAILABILITY,
  },
];

function toMentorCard(detail: MentorDetail): MentorCard {
  return {
    id: detail.id,
    documentId: detail.documentId,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    publishedAt: detail.publishedAt,
    display_name: detail.display_name,
    slug: detail.slug,
    headline: detail.headline,
    experience_years: detail.experience_years,
    languages: detail.languages,
    is_accepting_bookings: detail.is_accepting_bookings,
    session_minutes: detail.session_minutes,
    photo: detail.photo,
    streams: detail.streams,
    courses: detail.courses,
  };
}

function filterFallbackMentors(items: MentorCard[], params: MentorListParams): MentorCard[] {
  const term = searchTerm(params.search)?.toLowerCase();
  return items.filter((m) => {
    if (params.stream && !m.streams.some((s) => s.slug === params.stream)) return false;
    if (term) {
      const hay = `${m.display_name} ${m.headline ?? ''} ${m.streams.map((s) => s.name).join(' ')}`.toLowerCase();
      if (!hay.includes(term)) return false;
    }
    return true;
  });
}

function buildFilters(params: MentorListParams): CmsQuery['filters'] {
  const filters: Record<string, unknown> = {};

  if (params.stream) filters.streams = { slug: { $eq: params.stream } };

  const term = searchTerm(params.search);
  if (term) {
    filters.$or = [{ display_name: { $containsi: term } }, { headline: { $containsi: term } }];
  }

  return filters;
}

export async function listMentors(params: MentorListParams = {}): Promise<{
  mentors: MentorCard[];
  pagination: Pagination;
}> {
  const term = searchTerm(params.search);
  const cmsResult = await cmsFetchOptional(async () => {
    const { data, meta } = await cmsCollection<MentorCard>(
      '/mentor-profiles',
      {
        filters: buildFilters(params),
        sort: 'display_name:asc',
        pagination: {
          page: params.page ?? 1,
          pageSize: Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, 100),
        },
      },
      {
        tags: [collectionTag('mentor-profile')],
        revalidate: term ? 0 : undefined,
      }
    );
    return { mentors: data, pagination: meta.pagination };
  }, null);

  if (cmsResult && cmsResult.mentors.length > 0) {
    return cmsResult;
  }

  const cards = filterFallbackMentors(FALLBACK_MENTORS.map(toMentorCard), params);
  const pageSize = Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, 100);
  const page = Math.max(1, params.page ?? 1);
  const total = cards.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    mentors: cards.slice(start, start + pageSize),
    pagination: { page, pageSize, pageCount, total },
  };
}

export async function getMentorBySlug(slug: string): Promise<MentorDetail | null> {
  try {
    const json = await cmsFetch<{ data: MentorDetail }>(
      `/mentor-profiles/slug/${encodeURIComponent(slug)}`,
      undefined,
      { tags: [collectionTag('mentor-profile'), entryTag('mentor-profile', slug)] }
    );
    if (json.data) return json.data;
  } catch (error) {
    if (!(error instanceof Error && 'status' in error && (error.status === 404 || error.status === 503))) {
      console.warn('[cms] getMentorBySlug fallback:', (error as Error).message);
    }
  }
  return FALLBACK_MENTORS.find((m) => m.slug === slug) ?? null;
}

export async function getMentorSlugs(limit = 100): Promise<string[]> {
  const cmsSlugs = await cmsFetchOptional(async () => {
    const { data } = await cmsCollection<{ slug: string }>(
      '/mentor-profiles',
      { fields: ['slug'], sort: 'updatedAt:desc', pagination: { pageSize: limit } },
      { tags: [collectionTag('mentor-profile')] }
    );
    return data.map((entry) => entry.slug).filter(Boolean);
  }, []);

  const merged = new Set<string>([...cmsSlugs, ...FALLBACK_MENTORS.map((m) => m.slug)]);
  return [...merged].slice(0, limit);
}

// --- slot generation -------------------------------------------------------

const DAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/** Must match src/utils/booking-slots.ts in the CMS, which validates the pick. */
const IST_OFFSET_MINUTES = 5 * 60 + 30;
const MIN_LEAD_MINUTES = 60;

export interface BookableSlot {
  /** UTC instant, the value submitted to the CMS. */
  iso: string;
  /** Rendered in India time, which is how the mentor published availability. */
  label: string;
  dayLabel: string;
}

export interface BusySlot {
  start: string;
  minutes: number;
}

/**
 * Times this mentor is already booked.
 *
 * The CMS returns only a start and a length — no student, no topic — so showing
 * a mentor's calendar never reveals who is talking to them.
 *
 * Tagged per mentor and dropped whenever one of their bookings changes, so a
 * slot disappears from the picker as soon as it is taken. The short revalidate
 * is only a backstop for a change this app did not make.
 */
export async function getMentorBusySlots(slug: string): Promise<BusySlot[]> {
  return cmsFetchOptional(async () => {
    const json = await cmsFetch<{ data: BusySlot[] }>(
      `/mentor-profiles/slug/${encodeURIComponent(slug)}/busy`,
      undefined,
      { revalidate: 60, tags: [entryTag('mentor-profile', slug)] }
    );
    return json.data ?? [];
  }, []);
}

function minutesOfDay(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/**
 * Expands weekly availability into concrete bookable instants for the next
 * `days` days.
 *
 * This is a convenience for the picker, not a security boundary — the CMS
 * re-validates every submitted time against the same rules, so a hand-crafted
 * request cannot book outside them.
 */
export function generateSlots(
  mentor: MentorDetail,
  busy: BusySlot[] = [],
  days = 21,
  now = new Date()
): BookableSlot[] {
  const duration = mentor.session_minutes || 30;
  const slots: BookableSlot[] = [];
  const earliest = now.getTime() + MIN_LEAD_MINUTES * 60_000;

  const taken = busy
    .map((slot) => ({ from: new Date(slot.start).getTime(), minutes: slot.minutes }))
    .filter((slot) => Number.isFinite(slot.from));

  // Two sessions clash when either starts before the other ends — the same rule
  // the CMS applies when the booking is actually submitted.
  const clashes = (startMillis: number) =>
    taken.some(
      (slot) =>
        startMillis < slot.from + slot.minutes * 60_000 &&
        slot.from < startMillis + duration * 60_000
    );

  for (let offset = 0; offset <= days; offset += 1) {
    const dayStart = new Date(now.getTime() + offset * 86_400_000);
    const ist = new Date(dayStart.getTime() + IST_OFFSET_MINUTES * 60_000);
    const weekday = ist.getUTCDay();

    for (const window of mentor.availability) {
      if (!window.day_of_week || DAY_INDEX[window.day_of_week] !== weekday) continue;
      if (!window.start_time || !window.end_time) continue;

      const start = minutesOfDay(window.start_time);
      const end = minutesOfDay(window.end_time);
      if (start === null || end === null) continue;

      for (let minute = start; minute + duration <= end; minute += duration) {
        const utcMillis =
          Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), 0, minute) -
          IST_OFFSET_MINUTES * 60_000;

        if (utcMillis < earliest) continue;
        if (clashes(utcMillis)) continue;

        const at = new Date(utcMillis);
        slots.push({
          iso: at.toISOString(),
          label: at.toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata',
          }),
          dayLabel: at.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            timeZone: 'Asia/Kolkata',
          }),
        });
      }
    }
  }

  return slots.sort((a, b) => a.iso.localeCompare(b.iso));
}
