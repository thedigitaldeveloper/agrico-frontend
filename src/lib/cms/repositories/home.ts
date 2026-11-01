import type {
  HeroImage,
  HeroMedia,
  HeroPicture,
  HeroSlide,
} from '@/components/home/hero-carousel';
import { isCustomSection, type CustomSectionBlock } from '@/components/cms/custom-section';
import { isHtmlSection, type HtmlSectionBlock } from '@/components/cms/html-section';
import { resolveLink } from '@/lib/links';
import { youtubeId, youtubeThumbnail } from '@/lib/youtube';
import { cmsFetchOptional, cmsSingle } from '../client';
import { mediaUrl, resolveImage } from '../media';
import { collectionTag } from '../tags';
import type { Media, Seo } from '../types';

/**
 * The Homepage single type repository.
 *
 * Exposes hero slides and dynamic configurable section components from Strapi
 * with resilient fallback defaults.
 */

export interface HomeOfferingSelection {
  programSlug: string;
  universitySlug: string;
}
interface OfferingSelectionEntry {
  program?: { slug?: string | null } | null;
  university?: { slug?: string | null } | null;
}
interface UniversitySelectionEntry {
  university?: { documentId: string; name: string; slug: string } | null;
}
export interface HomeSpotlightSelection extends HomeOfferingSelection {
  eyebrow?: string;
  heading?: string;
  description?: string;
  image: Media | null;
}
export interface HomeServiceLink {
  title: string;
  description: string;
  href: string;
  iconName?: string;
}
export interface HomeHeroSlide extends HeroSlide {
  offering: HomeOfferingSelection | null;
}

export interface TrendingItem {
  label: string;
  href: string;
  isFeatured?: boolean;
}

export interface StatItem {
  value: string;
  label: string;
  description?: string;
  accentColor?: 'gold' | 'emerald' | 'brand' | 'purple';
}

export interface WhyGeduCard {
  title: string;
  tag?: string;
  description: string;
  points: string[];
  iconName?: string;
}

export interface ComparisonRow {
  factor: string;
  gedu: string;
  others: string;
}

export interface StepCard {
  step: string;
  badge?: string;
  title: string;
  description: string;
  highlights: string[];
  iconName?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SectionHeaderConfig {
  eyebrow?: string;
  heading?: string;
  description?: string;
  badges?: string[];
  ctaLabel?: string;
  ctaLink?: string;
}

export interface WhyGeduSectionConfig {
  eyebrow?: string;
  heading?: string;
  description?: string;
  microBadges?: string[];
  comparisonHeading?: string;
  comparisonBadge?: string;
  primaryCtaLabel?: string;
  primaryCtaLink?: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
}

export interface HowItWorksSectionConfig {
  eyebrow?: string;
  heading?: string;
  description?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

export interface IntentTabConfig {
  key: string;
  label: string;
  note?: string;
  filterCriteria?: string;
}

export interface CourseFinderConfig {
  eyebrow?: string;
  heading?: string;
  description?: string;
  featureBadges?: string[];
  budgetCaps?: number[];
  tabs?: IntentTabConfig[];
}

export interface CtaBanner {
  eyebrow?: string;
  heading: string;
  description?: string;
  primaryCtaLabel?: string;
  primaryCtaLink?: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
}

/** The component as Strapi returns it — snake_case, every field nullable. */
interface HeroSlideEntry extends OfferingSelectionEntry {
  offering_program?: { slug?: string | null } | null;
  offering_university?: { slug?: string | null } | null;
  id: number;
  eyebrow: string | null;
  heading: string | null;
  description: string | null;
  media_type: 'image' | 'video' | 'youtube' | null;
  desktop_image: Media | null;
  mobile_image: Media | null;
  video_file: Media | null;
  mobile_video_file: Media | null;
  embedded_video_link: string | null;
  link: string | null;
  link_target: 'self' | '_blank' | null;
  cta_label: string | null;
}

interface TrendingItemEntry {
  id: number;
  label: string | null;
  link: string | null;
  is_featured?: boolean | null;
}

interface StatItemEntry {
  id: number;
  value: string | null;
  label: string | null;
  description?: string | null;
  accent_color?: 'gold' | 'emerald' | 'brand' | 'purple' | null;
}

interface WhyGeduCardEntry {
  id: number;
  title: string | null;
  tag?: string | null;
  description: string | null;
  points?: unknown;
  icon_name?: string | null;
}

interface ComparisonRowEntry {
  id: number;
  factor: string | null;
  gedu_value: string | null;
  competitor_value: string | null;
}

interface StepCardEntry {
  id: number;
  step_number: string | null;
  badge?: string | null;
  title: string | null;
  description: string | null;
  highlights?: unknown;
  icon_name?: string | null;
}

interface FaqItemEntry {
  id: number;
  question: string | null;
  answer: string | null;
}

interface CourseFinderEntry {
  id: number;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  feature_badges?: unknown;
  budget_caps?: unknown;
  tabs?: Array<{
    id: number;
    key: string | null;
    label: string | null;
    note?: string | null;
    filter_criteria?: string | null;
  }> | null;
}

interface SectionHeaderEntry {
  id?: number;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  badges?: unknown;
  cta_label?: string | null;
  cta_link?: string | null;
}

interface WhyGeduSectionEntry {
  id?: number;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  micro_badges?: unknown;
  cards?: WhyGeduCardEntry[] | null;
  comparison_heading?: string | null;
  comparison_badge?: string | null;
  comparison_matrix?: ComparisonRowEntry[] | null;
  primary_cta_label?: string | null;
  primary_cta_link?: string | null;
  secondary_cta_label?: string | null;
  secondary_cta_link?: string | null;
}

interface HowItWorksSectionEntry {
  id?: number;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  steps?: StepCardEntry[] | null;
  cta_label?: string | null;
  cta_link?: string | null;
}

interface CtaBannerEntry {
  id: number;
  eyebrow?: string | null;
  heading: string | null;
  description?: string | null;
  primary_cta_label?: string | null;
  primary_cta_link?: string | null;
  secondary_cta_label?: string | null;
  secondary_cta_link?: string | null;
}

interface HomeEntry {
  content?: Array<CustomSectionBlock | HtmlSectionBlock> | null;
  featured_news?: Array<{ post?: { documentId?: string } | null }> | null;
  featured_blogs?: Array<{ post?: { documentId?: string } | null }> | null;
  featured_mentors?: Array<{ mentor?: { documentId?: string } | null }> | null;
  featured_testimonials?: Array<{ testimonial?: { documentId?: string } | null }> | null;
  section_display?: Record<string, unknown> | null;
  featured_offerings?: OfferingSelectionEntry[] | null;
  featured_universities?: UniversitySelectionEntry[] | null;
  comparison_offerings?: OfferingSelectionEntry[] | null;
  comparison_universities?: UniversitySelectionEntry[] | null;
  spotlight_offering?: (OfferingSelectionEntry & {
    eyebrow?: string | null; heading?: string | null; description?: string | null; image?: Media | null;
  }) | null;
  service_links?: Array<{ title?: string | null; description?: string | null; href?: string | null; icon_name?: string | null }> | null;
  programs_header?: SectionHeaderEntry | null;
  news_header?: SectionHeaderEntry | null;
  section_visibility?: Record<string, unknown> | null;
  name: string | null;
  seo: Seo | null;
  hero_slides?: HeroSlideEntry[] | null;
  trending_programs?: TrendingItemEntry[] | null;
  stats_strip?: StatItemEntry[] | null;
  course_finder?: CourseFinderEntry | null;
  why_gedu?: WhyGeduSectionEntry | null;
  why_gedu_cards?: WhyGeduCardEntry[] | null;
  comparison_matrix?: ComparisonRowEntry[] | null;
  how_it_works?: HowItWorksSectionEntry | null;
  how_it_works_steps?: StepCardEntry[] | null;
  universities_header?: SectionHeaderEntry | null;
  compare_header?: SectionHeaderEntry | null;
  testimonials_header?: SectionHeaderEntry | null;
  mentors_header?: SectionHeaderEntry | null;
  scholarships_header?: SectionHeaderEntry | null;
  exams_header?: SectionHeaderEntry | null;
  qna_header?: SectionHeaderEntry | null;
  faqs_header?: SectionHeaderEntry | null;
  articles_header?: SectionHeaderEntry | null;
  faqs?: FaqItemEntry[] | null;
  bottom_banner?: CtaBannerEntry | null;
}

export interface HomePageData {
  contentSections?: Array<CustomSectionBlock | HtmlSectionBlock>;
  /** Authored record order, independently from each section's visibility switch. */
  selectedNews: string[];
  selectedBlogs: string[];
  selectedMentors: string[];
  selectedTestimonials: string[];
  sectionDisplay: Record<string, 'curated' | 'latest'>;
  featuredOfferings: HomeOfferingSelection[];
  featuredUniversities: Array<{ documentId: string; name: string; slug: string }>;
  comparisonOfferings: HomeOfferingSelection[];
  comparisonUniversities: Array<{ documentId: string; name: string; slug: string }>;
  spotlightOffering: HomeSpotlightSelection | null;
  serviceLinks: HomeServiceLink[];
  programsHeader: SectionHeaderConfig | null;
  newsHeader: SectionHeaderConfig | null;
  sectionVisibility: Record<string, boolean>;
  seo: Seo | null;
  slides: HomeHeroSlide[];
  trendingPrograms: TrendingItem[];
  stats: StatItem[];
  courseFinder: CourseFinderConfig | null;
  whyGeduConfig: WhyGeduSectionConfig | null;
  whyGeduCards: WhyGeduCard[];
  comparisonMatrix: ComparisonRow[];
  howItWorksConfig: HowItWorksSectionConfig | null;
  howItWorksSteps: StepCard[];
  universitiesHeader: SectionHeaderConfig | null;
  compareHeader: SectionHeaderConfig | null;
  testimonialsHeader: SectionHeaderConfig | null;
  mentorsHeader: SectionHeaderConfig | null;
  scholarshipsHeader: SectionHeaderConfig | null;
  examsHeader: SectionHeaderConfig | null;
  qnaHeader: SectionHeaderConfig | null;
  faqsHeader: SectionHeaderConfig | null;
  articlesHeader: SectionHeaderConfig | null;
  faqs: FaqItem[];
  bottomBanner: CtaBanner | null;
}

function parseOffering(entry?: OfferingSelectionEntry | null): HomeOfferingSelection | null {
  const programSlug = entry?.program?.slug?.trim();
  const universitySlug = entry?.university?.slug?.trim();
  return programSlug && universitySlug ? { programSlug, universitySlug } : null;
}
function parseOfferings(entries?: OfferingSelectionEntry[] | null): HomeOfferingSelection[] {
  return (entries ?? []).map(parseOffering).filter((entry): entry is HomeOfferingSelection => entry !== null);
}
function parseUniversities(entries?: UniversitySelectionEntry[] | null) {
  const seen = new Set<string>();
  return (entries ?? []).flatMap(entry => {
    const university = entry.university;
    if (!university?.slug || seen.has(university.slug)) return [];
    seen.add(university.slug);
    return [university];
  });
}
function selectionIds(entries: Array<Record<string, { documentId?: string } | null | undefined>> | null | undefined, key: string) {
  return [...new Set((entries ?? []).flatMap(entry => entry[key]?.documentId ? [entry[key]!.documentId!] : []))];
}

function parseSectionHeader(entry?: SectionHeaderEntry | null): SectionHeaderConfig | null {
  if (!entry) return null;
  return {
    eyebrow: entry.eyebrow?.trim() || undefined,
    heading: entry.heading?.trim() || undefined,
    description: entry.description?.trim() || undefined,
    badges: parsePoints(entry.badges),
    ctaLabel: entry.cta_label?.trim() || undefined,
    ctaLink: entry.cta_link?.trim() || undefined,
  };
}

export async function getHomePageData(): Promise<HomePageData> {
  const home = await cmsFetchOptional(
    () =>
      cmsSingle<HomeEntry>(
        '/home',
        {
          populate: {
            seo: { populate: ['metaImage'] },
            content: { on: {
              'common.custom-section': { populate: { image: true } },
              'common.html-section': { populate: '*' },
            } },
            featured_news: { populate: { post: { fields: ['slug'] } } },
            featured_blogs: { populate: { post: { fields: ['slug'] } } },
            featured_mentors: { populate: { mentor: { fields: ['slug'] } } },
            featured_testimonials: { populate: { testimonial: { fields: ['slug'] } } },
            hero_slides: {
              populate: {
                desktop_image: true, mobile_image: true, video_file: true, mobile_video_file: true,
                offering_program: { fields: ['slug'] }, offering_university: { fields: ['slug'] },
              },
            },
            featured_offerings: { populate: { program: { fields: ['slug'] }, university: { fields: ['slug'] } } },
            featured_universities: { populate: { university: { fields: ['name', 'slug'] } } },
            comparison_offerings: { populate: { program: { fields: ['slug'] }, university: { fields: ['slug'] } } },
            comparison_universities: { populate: { university: { fields: ['name', 'slug'] } } },
            spotlight_offering: { populate: { program: { fields: ['slug'] }, university: { fields: ['slug'] }, image: true } },
            service_links: { populate: '*' },
            programs_header: { populate: '*' },
            news_header: { populate: '*' },
            trending_programs: { populate: '*' },
            stats_strip: { populate: '*' },
            course_finder: {
              populate: {
                tabs: { populate: '*' },
              },
            },
            why_gedu: {
              populate: {
                cards: { populate: '*' },
                comparison_matrix: { populate: '*' },
              },
            },
            why_gedu_cards: { populate: '*' },
            comparison_matrix: { populate: '*' },
            how_it_works: {
              populate: {
                steps: { populate: '*' },
              },
            },
            how_it_works_steps: { populate: '*' },
            universities_header: { populate: '*' },
            compare_header: { populate: '*' },
            testimonials_header: { populate: '*' },
            mentors_header: { populate: '*' },
            scholarships_header: { populate: '*' },
            exams_header: { populate: '*' },
            qna_header: { populate: '*' },
            faqs_header: { populate: '*' },
            articles_header: { populate: '*' },
            faqs: { populate: '*' },
            bottom_banner: { populate: '*' },
          },
        },
        { tags: [collectionTag('home')] }
      ),
    null
  );

  const slides = (home?.hero_slides ?? []).map(toSlide).filter(isRenderable);
  const trendingPrograms = (home?.trending_programs ?? [])
    .filter((item) => Boolean(item.label && item.link))
    .map((item) => ({
      label: item.label!.trim(),
      href: resolveLink(item.link)?.href ?? item.link!.trim(),
      isFeatured: Boolean(item.is_featured),
    }));

  const stats = (home?.stats_strip ?? [])
    .filter((item) => Boolean(item.value && item.label))
    .map((item) => ({
      value: item.value!.trim(),
      label: item.label!.trim(),
      description: item.description?.trim() || undefined,
      accentColor: item.accent_color ?? undefined,
    }));

  const courseFinder: CourseFinderConfig | null = home?.course_finder
    ? {
        eyebrow: home.course_finder.eyebrow?.trim() || undefined,
        heading: home.course_finder.heading?.trim() || undefined,
        description: home.course_finder.description?.trim() || undefined,
        featureBadges: parsePoints(home.course_finder.feature_badges),
        budgetCaps: parseNumbers(home.course_finder.budget_caps),
        tabs: (home.course_finder.tabs ?? [])
          .filter((tab) => Boolean(tab.key && tab.label))
          .map((tab) => ({
            key: tab.key!.trim(),
            label: tab.label!.trim(),
            note: tab.note?.trim() || undefined,
            filterCriteria: tab.filter_criteria?.trim() || undefined,
          })),
      }
    : null;

  const rawWhyCards =
    (home?.why_gedu_cards && home.why_gedu_cards.length > 0)
      ? home.why_gedu_cards
      : (home?.why_gedu?.cards && home.why_gedu.cards.length > 0)
        ? home.why_gedu.cards
        : [];

  const whyGeduCards = rawWhyCards
    .filter((item) => Boolean(item.title && item.description))
    .map((item) => ({
      title: item.title!.trim(),
      tag: item.tag?.trim() || undefined,
      description: item.description!.trim(),
      points: parsePoints(item.points),
      iconName: item.icon_name?.trim() || undefined,
    }));

  const rawComparison =
    (home?.comparison_matrix && home.comparison_matrix.length > 0)
      ? home.comparison_matrix
      : (home?.why_gedu?.comparison_matrix && home.why_gedu.comparison_matrix.length > 0)
        ? home.why_gedu.comparison_matrix
        : [];

  const comparisonMatrix = rawComparison
    .filter((item) => Boolean(item.factor && (item.gedu_value || item.competitor_value)))
    .map((item) => ({
      factor: item.factor!.trim(),
      gedu: item.gedu_value?.trim() || '',
      others: item.competitor_value?.trim() || '',
    }));

  const whyGeduConfig: WhyGeduSectionConfig | null = home?.why_gedu
    ? {
        eyebrow: home.why_gedu.eyebrow?.trim() || undefined,
        heading: home.why_gedu.heading?.trim() || undefined,
        description: home.why_gedu.description?.trim() || undefined,
        microBadges: parsePoints(home.why_gedu.micro_badges),
        comparisonHeading: home.why_gedu.comparison_heading?.trim() || undefined,
        comparisonBadge: home.why_gedu.comparison_badge?.trim() || undefined,
        primaryCtaLabel: home.why_gedu.primary_cta_label?.trim() || undefined,
        primaryCtaLink: home.why_gedu.primary_cta_link?.trim() || undefined,
        secondaryCtaLabel: home.why_gedu.secondary_cta_label?.trim() || undefined,
        secondaryCtaLink: home.why_gedu.secondary_cta_link?.trim() || undefined,
      }
    : null;

  const rawSteps =
    (home?.how_it_works?.steps && home.how_it_works.steps.length > 0)
      ? home.how_it_works.steps
      : (home?.how_it_works_steps && home.how_it_works_steps.length > 0)
        ? home.how_it_works_steps
        : [];

  const howItWorksSteps = rawSteps
    .filter((item) => Boolean(item.title && item.description))
    .map((item) => ({
      step: item.step_number?.trim() || '01',
      badge: item.badge?.trim() || undefined,
      title: item.title!.trim(),
      description: item.description!.trim(),
      highlights: parsePoints(item.highlights),
      iconName: item.icon_name?.trim() || undefined,
    }));

  const howItWorksConfig: HowItWorksSectionConfig | null = home?.how_it_works
    ? {
        eyebrow: home.how_it_works.eyebrow?.trim() || undefined,
        heading: home.how_it_works.heading?.trim() || undefined,
        description: home.how_it_works.description?.trim() || undefined,
        ctaLabel: home.how_it_works.cta_label?.trim() || undefined,
        ctaLink: home.how_it_works.cta_link?.trim() || undefined,
      }
    : null;

  const faqs = (home?.faqs ?? [])
    .filter((item) => Boolean(item.question && item.answer))
    .map((item) => ({
      question: item.question!.trim(),
      answer: item.answer!.trim(),
    }));

  const bottomBanner = home?.bottom_banner?.heading
    ? {
        eyebrow: home.bottom_banner.eyebrow?.trim() || undefined,
        heading: home.bottom_banner.heading.trim(),
        description: home.bottom_banner.description?.trim() || undefined,
        primaryCtaLabel: home.bottom_banner.primary_cta_label?.trim() || undefined,
        primaryCtaLink: home.bottom_banner.primary_cta_link?.trim() || undefined,
        secondaryCtaLabel: home.bottom_banner.secondary_cta_label?.trim() || undefined,
        secondaryCtaLink: home.bottom_banner.secondary_cta_link?.trim() || undefined,
      }
    : null;

  const spotlight = parseOffering(home?.spotlight_offering);
  return {
    contentSections: (home?.content ?? []).filter((block) => isCustomSection(block) || isHtmlSection(block)),
    selectedNews: selectionIds(home?.featured_news, 'post'),
    selectedBlogs: selectionIds(home?.featured_blogs, 'post'),
    selectedMentors: selectionIds(home?.featured_mentors, 'mentor'),
    selectedTestimonials: selectionIds(home?.featured_testimonials, 'testimonial'),
    sectionDisplay: Object.fromEntries(Object.entries(home?.section_display ?? {}).flatMap(([key, value]) => value === 'curated' || value === 'latest' ? [[key, value]] : [])),
    featuredOfferings: parseOfferings(home?.featured_offerings),
    featuredUniversities: parseUniversities(home?.featured_universities),
    comparisonOfferings: parseOfferings(home?.comparison_offerings),
    comparisonUniversities: parseUniversities(home?.comparison_universities),
    spotlightOffering: spotlight ? {
      ...spotlight,
      eyebrow: home?.spotlight_offering?.eyebrow?.trim() || undefined,
      heading: home?.spotlight_offering?.heading?.trim() || undefined,
      description: home?.spotlight_offering?.description?.trim() || undefined,
      image: home?.spotlight_offering?.image ?? null,
    } : null,
    serviceLinks: (home?.service_links ?? []).flatMap(entry => {
      const href = resolveLink(entry.href)?.href;
      return entry.title?.trim() && href ? [{
        title: entry.title.trim(), description: entry.description?.trim() || '',
        href, iconName: entry.icon_name?.trim() || undefined,
      }] : [];
    }),
    programsHeader: parseSectionHeader(home?.programs_header),
    newsHeader: parseSectionHeader(home?.news_header),
    sectionVisibility: Object.fromEntries(Object.entries(home?.section_visibility ?? {}).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean')),
    seo: home?.seo ?? null,
    slides,
    trendingPrograms,
    stats,
    courseFinder,
    whyGeduConfig,
    whyGeduCards,
    comparisonMatrix,
    howItWorksConfig,
    howItWorksSteps,
    universitiesHeader: parseSectionHeader(home?.universities_header),
    compareHeader: parseSectionHeader(home?.compare_header),
    testimonialsHeader: parseSectionHeader(home?.testimonials_header),
    mentorsHeader: parseSectionHeader(home?.mentors_header),
    scholarshipsHeader: parseSectionHeader(home?.scholarships_header),
    examsHeader: parseSectionHeader(home?.exams_header),
    qnaHeader: parseSectionHeader(home?.qna_header),
    faqsHeader: parseSectionHeader(home?.faqs_header),
    articlesHeader: parseSectionHeader(home?.articles_header),
    faqs,
    bottomBanner,
  };
}

/** Keep backwards compatibility alias for getHomeHero */
export async function getHomeHero(): Promise<{ seo: Seo | null; slides: HeroSlide[] }> {
  const data = await getHomePageData();
  return { seo: data.seo, slides: data.slides };
}

function parsePoints(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.map((item) => (typeof item === 'string' ? item.trim() : String(item))).filter(Boolean);
  }
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return val.split('\n').map((line) => line.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
    }
  }
  return [];
}

function parseNumbers(val: unknown): number[] {
  if (Array.isArray(val)) {
    return val
      .map((item) => (typeof item === 'number' ? item : Number(item)))
      .filter((n) => Number.isFinite(n) && n > 0);
  }
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed
          .map(Number)
          .filter((n) => Number.isFinite(n) && n > 0);
      }
    } catch {
      return val
        .split(/[,\s]+/)
        .map(Number)
        .filter((n) => Number.isFinite(n) && n > 0);
    }
  }
  return [];
}

function toSlide(entry: HeroSlideEntry): HomeHeroSlide {
  const link = resolveLink(entry.link);

  return {
    id: `slide-${entry.id}`,
    offering: parseOffering({ program: entry.offering_program, university: entry.offering_university }),
    eyebrow: entry.eyebrow?.trim() || null,
    heading: entry.heading?.trim() || null,
    description: entry.description?.trim() || null,
    media: toMedia(entry),
    href: link?.href ?? null,
    external: link?.external ?? false,
    newTab: entry.link_target === '_blank',
    ctaLabel: entry.cta_label?.trim() || null,
  };
}

function toMedia(entry: HeroSlideEntry): HeroMedia {
  const alt = entry.heading ?? '';
  const picture = toPicture(entry.desktop_image, entry.mobile_image, alt);

  switch (entry.media_type) {
    case 'video': {
      const src = mediaUrl(entry.video_file?.url);
      if (!src) return picture ? { kind: 'image', picture } : { kind: 'none' };
      return {
        kind: 'video',
        src,
        mobileSrc: mediaUrl(entry.mobile_video_file?.url),
        poster: picture,
      };
    }

    case 'youtube': {
      const videoId = youtubeId(entry.embedded_video_link);
      if (!videoId) return picture ? { kind: 'image', picture } : { kind: 'none' };
      return {
        kind: 'youtube',
        videoId,
        poster: picture ?? {
          desktop: { src: youtubeThumbnail(videoId), alt, width: 480, height: 360 },
          mobile: null,
        },
      };
    }

    default:
      return picture ? { kind: 'image', picture } : { kind: 'none' };
  }
}

function toPicture(
  desktopMedia: Media | null,
  mobileMedia: Media | null,
  alt: string
): HeroPicture | null {
  const desktop = toImage(desktopMedia, alt) ?? toImage(mobileMedia, alt);
  if (!desktop) return null;

  const mobile = toImage(mobileMedia, alt);
  return { desktop, mobile: mobile && mobile.src !== desktop.src ? mobile : null };
}

function toImage(media: Media | null, alt: string): HeroImage | null {
  const resolved = resolveImage(media, alt);
  if (!resolved) return null;

  return {
    src: resolved.src,
    alt: resolved.alt,
    width: resolved.width ?? null,
    height: resolved.height ?? null,
  };
}

function isRenderable(slide: HeroSlide): boolean {
  return slide.media.kind !== 'none' || Boolean(slide.heading);
}

