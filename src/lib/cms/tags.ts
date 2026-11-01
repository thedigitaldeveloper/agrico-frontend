/**
 * Cache tags.
 *
 * Every CMS read is tagged, and the CMS calls /api/revalidate on publish to
 * invalidate the matching tags. That replaces the old build's time-based ISR,
 * where an edit took up to five minutes to appear and every expiry re-ran the
 * full query regardless of whether anything had actually changed.
 */

/** Strapi model names, as they appear in a webhook payload's `model` field. */
export const MODELS = [
  'university',
  'faculty',
  'recruiter',
  'program',
  'course',
  'stream',
  'exam',
  'examination',
  'scheme',
  'blog',
  'university-content',
  'master',
  'legal',
  'home',
  'about-us',
  'contact-us',
  'social',
  'tag',
  'ranking',
  'approval',
  'affiliation',
  'eligibility',
  'course-mode',
  'course-type',
  // Undergraduate/postgraduate. Editing one re-cuts every program listing that
  // filters on it, so it needs a tag of its own like any other lookup.
  'level',
  'duration-type',
  'ownership-type',
  'institute-tier',
  // Q&A. Moderating a submission is a publish, which fires the same webhook as
  // any other content change, so the listing and detail pages refresh with it.
  'question',
  'answer',
  // The public mentor directory. Student profiles and bookings are absent by
  // design: they are per-user reads that never enter a shared cache, so they
  // have no tag to invalidate.
  'mentor-profile',
  'testimonial',
  // Contact details rendered into every WhatsApp CTA, enquiry modal and the
  // footer, so an edit drops GLOBAL_TAG rather than a page-level tag.
  'site-setting',
] as const;

export type Model = (typeof MODELS)[number];

/** Everything of one type — invalidated whenever any entry of it changes. */
export const collectionTag = (model: Model) => `cms:${model}`;

/** One entry, addressed by slug. Lets a single edit avoid nuking listings. */
export const entryTag = (model: Model, slug: string) => `cms:${model}:${slug}`;

/**
 * Content that appears on every page (header menus, footer, global settings).
 * Kept separate so a nav change does not invalidate every detail page's data.
 */
export const GLOBAL_TAG = 'cms:global';

/** Upload webhooks carry a file, not the entries that use it. */
export const MEDIA_TAG = 'cms:media';

/** Populated relations are cached inside their owners' responses too. */
export function revalidationTags(model: Model, slug?: string): string[] {
  const tags = [collectionTag(model)];
  if (slug) tags.push(entryTag(model, slug));

  if (model === 'university-content') {
    for (const owner of ['university', 'program', 'examination', 'scheme'] as const) {
      tags.push(collectionTag(owner));
    }
  }
  if (['university', 'program', 'course', 'stream', 'exam', 'approval', 'affiliation', 'ranking', 'institute-tier', 'tag', 'faculty', 'recruiter', 'eligibility', 'course-mode', 'course-type', 'level', 'duration-type', 'ownership-type'].includes(model)) {
    // These records are also embedded in catalogue cards, menus and fee rows.
    for (const owner of ['university', 'program', 'course', 'examination'] as const) tags.push(collectionTag(owner));
    tags.push(GLOBAL_TAG);
  }
  if (['stream', 'course', 'social', 'tag', 'site-setting'].includes(model)) {
    tags.push(GLOBAL_TAG);
  }
  return [...new Set(tags)];
}

const MODEL_SET = new Set<string>(MODELS);

export const isModel = (value: string): value is Model => MODEL_SET.has(value);

/**
 * Content types that fire webhooks but have nothing cached to invalidate:
 * leads, bookings and private profiles are read per-user with `no-store`.
 *
 * They are listed rather than lumped in with unknown models so a webhook for
 * one is acknowledged instead of rejected. Every enquiry would otherwise show
 * as a failed delivery in Strapi's log, and a real failure would be invisible
 * in that noise.
 */
const UNCACHED_MODELS = new Set<string>([
  'enquiry',
  'session-booking',
  'student-profile',
]);

export const isUncachedModel = (value: string): boolean => UNCACHED_MODELS.has(value);
