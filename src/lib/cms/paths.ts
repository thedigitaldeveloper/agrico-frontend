export interface PathUniversity {
  slug: string;
  course_modes?: Array<{ slug: string; name?: string }> | null;
}

/**
 * Agrico is strictly focused on On-Campus Agriculture & Allied Sciences.
 * Every university detail page lives at `/university/[slug]`.
 */
export function universityHref(u: PathUniversity): string {
  return `/university/${encodeURIComponent(u.slug)}`;
}

/**
 * Maps messy CMS section slugs ("program-and-fees", "curriculum-syllabus",
 * "admission-process", "career-prospects", "course-fee") to clean, concise
 * Shiksha-style suffixes ("fees", "syllabus", "admission", "placement", "faq").
 */
const CLEAN_SECTION_SUFFIX_MAP: Record<string, string> = {
  'fee-structure': 'fees',
  'course-fee': 'fees',
  'courses-fees': 'fees',
  'program-and-fees': 'fees',
  'fees': 'fees',
  'curriculum-syllabus': 'curriculum',
  'course-syllabus': 'curriculum',
  'curriculum': 'curriculum',
  'syllabus': 'curriculum',
  'admission-process': 'eligibility',
  'eligibility-criteria': 'eligibility',
  'eligibility': 'eligibility',
  'how-to-apply': 'eligibility',
  'admissions': 'eligibility',
  'admission': 'eligibility',
  'colleges': 'universities',
  'universities': 'universities',
  'career-prospects': 'careers',
  'job-opportunities': 'careers',
  'placements': 'careers',
  'placement': 'careers',
  'careers': 'careers',
  'faqs': 'faqs',
  'frequently-asked-questions': 'faqs',
  'faq': 'faqs',
  'scholarships': 'scholarship',
  'financial-aid': 'scholarship',
  'scholarship': 'scholarship',
  'overview': 'overview',
  'about': 'overview',
  'introduction': 'overview',
};

export function toCleanSectionSuffix(rawSlug: string): string {
  const normalized = rawSlug.trim().toLowerCase();
  return CLEAN_SECTION_SUFFIX_MAP[normalized] ?? normalized;
}

/**
 * Builds the canonical URL for a university-specific program offering.
 * Instead of an internal `/offering/[university]/[program]` join route, offerings
 * live cleanly under the university hierarchy:
 * - Overview: `/university/[universitySlug]/[programSlug]`
 * - Section:  `/university/[universitySlug]/[programSlug]-[sectionSuffix]`
 */
export function offeringHref(
  u: PathUniversity,
  programSlug: string,
  sectionSuffix?: string | null
): string {
  const base = `${universityHref(u)}/${encodeURIComponent(programSlug)}`;
  if (!sectionSuffix) return base;
  const cleanSection = toCleanSectionSuffix(sectionSuffix);
  if (!cleanSection || cleanSection === 'overview') return base;
  return `${base}-${encodeURIComponent(cleanSection)}`;
}

/**
 * Known Shiksha-style section suffixes that can appear at the end of a
 * hyphenated program or offering URL (e.g. `bsc-agriculture-syllabus`).
 */
const KNOWN_SECTION_SUFFIXES = [
  'syllabus',
  'curriculum',
  'fees',
  'admission',
  'eligibility',
  'universities',
  'colleges',
  'placement',
  'careers',
  'faq',
  'faqs',
  'scholarship',
  'review',
  'cutoff',
  'ranking',
  'faculty',
  'hostel',
  'gallery',
  'infrastructure',
  'highlights',
  'overview',
] as const;

/**
 * Attempts to split a hyphenated segment like `bsc-agriculture-syllabus`
 * into `{ programSlug: 'bsc-agriculture', sectionSuffix: 'syllabus' }`.
 * Returns `null` if the segment does not end with a known section suffix.
 */
export function splitHyphenatedProgramSectionSlug(
  segment: string
): { programSlug: string; sectionSuffix: string } | null {
  const lower = segment.trim().toLowerCase();
  for (const suffix of KNOWN_SECTION_SUFFIXES) {
    const token = `-${suffix}`;
    if (lower.endsWith(token) && lower.length > token.length) {
      return {
        programSlug: segment.slice(0, segment.length - token.length),
        sectionSuffix: suffix,
      };
    }
  }
  return null;
}
