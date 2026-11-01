import type { HeroMedia } from '@/components/home/hero-carousel';
import type { HomePageData, StepCard } from '@/lib/cms/repositories/home';
import type { MentorCard } from '@/lib/cms/repositories/mentor';
import type { TestimonialCard } from '@/lib/cms/repositories/testimonial';

export interface Offering {
  id: string;
  university: string;
  universitySlug: string;
  program: string;
  programSlug: string;
  degree: string;
  /** Exact CMS course taxonomy slug used by the programme finder. */
  courseSlug?: string;
  fullName: string;
  level: string;
  mode: string;
  duration: string;
  fee: number | null;
  feeNote: string;
  eligibility: string[];
  syllabus: string | null;
  logo: string | null;
  /** Optional square institution mark for compact cards; the full wordmark stays separate. */
  cardLogo?: string | null;
  image: string | null;
  imageAlt?: string;
  href: string;
  summary?: string;
  modeSlug?: string;
  durationValue?: number | null;
  durationUnit?: string;
  intentKeys?: string[];
}
export interface SpotlightOffering extends Offering {
  eyebrow?: string;
  heading?: string;
  description?: string;
  imageAlt?: string;
}
export interface HomeUniversity {
  id: string;
  name: string;
  slug: string;
  location: string;
  logo: string | null;
  /** Separate institution mark for square cards; retain the official wordmark as fallback. */
  cardLogo?: string | null;
  image: string | null;
  imageAlt?: string;
  degrees: string[];
  /** Optional factual CMS metadata. Never manufacture badges for sparse records. */
  ownership?: string;
  approvals?: string[];
  rankings?: string[];
  modes?: string[];
  establishedYear?: string;
  rating?: number | null;
  programmeCount?: number;
}
export interface HomePost {
  id: string;
  title: string;
  summary: string;
  date: string | null;
  image: string | null;
  imageAlt?: string;
  category?: string;
  href: string;
}
export interface HomeSlide {
  id: string;
  heading: string;
  description: string;
  image: string;
  alt: string;
  media?: HeroMedia;
  eyebrow?: string | null;
  href?: string | null;
  external?: boolean;
  newTab?: boolean;
  ctaLabel?: string | null;
  offeringId?: string | null;
}
export interface RsHomeData {
  /** Full inherited CMS configuration; null only for the labelled visual preview. */
  home: HomePageData | null;
  /** Every published university/programme pair. Never limited by merchandising. */
  catalogue: Offering[];
  programmeChoices: string[];
  /** Explicitly selected homepage pairs in the editor's authored order. */
  offerings: Offering[];
  universities: HomeUniversity[];
  universityOptions: Array<{ documentId: string; name: string; slug: string }>;
  spotlight: SpotlightOffering | null;
  comparisonOfferings: Offering[];
  mentors: MentorCard[];
  testimonials: TestimonialCard[];
  news: HomePost[];
  blogs: HomePost[];
  slides: HomeSlide[];
  faqs: Array<{ question: string; answer: string }>;
  steps: Array<Pick<StepCard, 'title' | 'description'> & Partial<Omit<StepCard, 'title' | 'description'>>>;
}
export function displayFee(offering: Offering) {
  return offering.fee === null || !Number.isFinite(offering.fee) || offering.fee < 0
    ? 'Request current fees'
    : new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0,
      }).format(offering.fee);
}
