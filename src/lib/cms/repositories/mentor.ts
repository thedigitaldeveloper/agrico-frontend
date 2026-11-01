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
      // A typed query is one-off and unbounded in variety, so caching one
      // would fill the data cache with single-use entries. 0 prevents that;
      // `false` would mean the opposite — cache it forever.
      revalidate: term ? 0 : undefined,
    }
  );

  return { mentors: data, pagination: meta.pagination };
}

export async function getMentorBySlug(slug: string): Promise<MentorDetail | null> {
  try {
    const json = await cmsFetch<{ data: MentorDetail }>(
      `/mentor-profiles/slug/${encodeURIComponent(slug)}`,
      undefined,
      { tags: [collectionTag('mentor-profile'), entryTag('mentor-profile', slug)] }
    );
    return json.data ?? null;
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 404) return null;
    throw error;
  }
}

export async function getMentorSlugs(limit = 100): Promise<string[]> {
  return cmsFetchOptional(async () => {
    const { data } = await cmsCollection<{ slug: string }>(
      '/mentor-profiles',
      { fields: ['slug'], sort: 'updatedAt:desc', pagination: { pageSize: limit } },
      { tags: [collectionTag('mentor-profile')] }
    );
    return data.map((entry) => entry.slug).filter(Boolean);
  }, []);
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
