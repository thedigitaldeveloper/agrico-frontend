import { BRAND } from '@/lib/brand';
import { mediaUrl } from '@/lib/cms/media';
import type { Seo } from '@/lib/cms/types';
import type { BlogDetail, BlogSection } from '@/lib/cms/repositories/blog';
import type { ExamDetail } from '@/lib/cms/repositories/exam';
import type { ProgramDetail } from '@/lib/cms/repositories/program';
import type { QuestionDetail } from '@/lib/cms/repositories/qna';
import type { ScholarshipDetail } from '@/lib/cms/repositories/scholarship';
import type { UniversityDetail } from '@/lib/cms/repositories/university';
import { SITE_NAME, SITE_URL } from '@/lib/env';

/**
 * Structured data builders.
 *
 * Each returns a plain schema.org object, or null when there is not enough
 * information to make a valid one — emitting a half-filled entity is worse than
 * emitting none, because search engines treat malformed markup as a quality
 * signal against the page.
 */

type Schema = Record<string, unknown>;

const abs = (path: string) => `${SITE_URL}${path}`;

/** Drops undefined/null/empty members so no empty properties are emitted. */
function compact(schema: Schema): Schema {
  const out: Schema = {};
  for (const [key, value] of Object.entries(schema)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

// --- site-wide -------------------------------------------------------------

export function organizationSchema(): Schema {
  return compact({
    '@type': 'Organization',
    '@id': abs('/#organization'),
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: abs(BRAND.logoPng) },
    description:
      'An agriculture education and admissions platform for comparing programmes, institutions and source-specific admission information in India.',
  });
}

export function websiteSchema(): Schema {
  return compact({
    '@type': 'WebSite',
    '@id': abs('/#website'),
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': abs('/#organization') },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: abs('/search?q={search_term_string}'),
      },
      'query-input': 'required name=search_term_string',
    },
  });
}

// --- navigation ------------------------------------------------------------

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(crumbs: Crumb[]): Schema | null {
  if (crumbs.length < 2) return null;

  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: abs(crumb.path),
    })),
  };
}

// --- entities --------------------------------------------------------------

export function universitySchema(university: UniversityDetail): Schema {
  const address = compact({
    '@type': 'PostalAddress',
    streetAddress: university.address,
    addressLocality: university.city,
    addressRegion: university.state,
    postalCode: university.pincode,
    addressCountry: university.country ?? 'IN',
  });

  return compact({
    '@type': 'CollegeOrUniversity',
    '@id': abs(`/university/${university.slug}#organization`),
    name: university.name,
    alternateName: university.full_name,
    url: abs(`/university/${university.slug}`),
    logo: mediaUrl(university.logo?.url),
    image: mediaUrl(university.image?.url ?? university.logo?.url),
    foundingDate: university.establish,
    // Only the fields that are actually populated; an address with nothing but
    // a country is not worth emitting.
    address: Object.keys(address).length > 2 ? address : undefined,
    // aggregateRating is deliberately omitted: the CMS `rating` is an editorial
    // score, not aggregated user reviews, and marking it up as the latter
    // misrepresents it.
    hasCredential: university.approvals.map((approval) => ({
      '@type': 'EducationalOccupationalCredential',
      name: approval.name,
    })),
  });
}

export function programSchema(program: ProgramDetail): Schema {
  const provider = program.universities[0];

  return compact({
    '@type': 'Course',
    '@id': abs(`/${program.slug}#course`),
    name: program.name,
    alternateName: program.full_name,
    url: abs(`/${program.slug}`),
    description: `${program.name}${program.stream ? ` in ${program.stream.name}` : ''} — fees, duration, eligibility and the universities that offer it.`,
    provider: provider
      ? { '@type': 'CollegeOrUniversity', name: provider.name, url: abs(`/university/${provider.slug}`) }
      : { '@id': abs('/#organization') },
    educationalCredentialAwarded: program.course?.name,
    hasCourseInstance: program.duration
      ? [
          compact({
            '@type': 'CourseInstance',
            courseMode: program.course_mode?.name || 'Full-time, campus-based',
            // ISO 8601 duration: P2Y for two years.
            courseWorkload: `P${program.duration}${
              program.duration_type?.name?.toLowerCase().startsWith('month') ? 'M' : 'Y'
            }`,
          }),
        ]
      : undefined,
    offers: program.fee
      ? {
          '@type': 'Offer',
          category: 'Tuition',
          price: program.fee,
          priceCurrency: 'INR',
        }
      : undefined,
  });
}

export function examSchema(exam: ExamDetail): Schema {
  return compact({
    '@type': 'EducationalOccupationalProgram',
    '@id': abs(`/exams/${exam.slug}#exam`),
    name: exam.name,
    alternateName: exam.full_name,
    url: abs(`/exams/${exam.slug}`),
    description: exam.description,
    provider: { '@id': abs('/#organization') },
    applicationStartDate: exam.form_start_date,
    applicationDeadline: exam.form_closing_date,
    educationalProgramMode: exam.exam_mode,
    programPrerequisites: exam.eligibility,
  });
}

export function scholarshipSchema(scholarship: ScholarshipDetail): Schema {
  return compact({
    '@type': 'EducationalOccupationalProgram',
    '@id': abs(`/scholarship/${scholarship.slug}#scholarship`),
    name: scholarship.name,
    alternateName: scholarship.full_name,
    url: abs(`/scholarship/${scholarship.slug}`),
    provider: { '@id': abs('/#organization') },
    offers: { '@type': 'Offer', category: 'Scholarship' },
  });
}

const ARTICLE_TYPE: Record<BlogSection, string> = {
  articles: 'Article',
  news: 'NewsArticle',
  blogs: 'BlogPosting',
};

export function articleSchema(post: BlogDetail, section: BlogSection): Schema {
  const image = mediaUrl(post.image?.url ?? post.thumbnail?.url);

  return compact({
    '@type': ARTICLE_TYPE[section],
    '@id': abs(`/${section}/${post.slug}#article`),
    headline: post.name,
    description: post.description,
    url: abs(`/${section}/${post.slug}`),
    image: image ? [image] : undefined,
    datePublished: post.dateTime ?? post.createdAt,
    dateModified: post.updatedAt,
    author: { '@id': abs('/#organization') },
    publisher: { '@id': abs('/#organization') },
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(`/${section}/${post.slug}`) },
  });
}

export function questionSchema(question: QuestionDetail): Schema | null {
  // QAPage requires an answered question; without one there is nothing valid to
  // describe.
  if (question.answers.length === 0) return null;

  const accepted = question.answers.find((answer) => answer.is_accepted);
  const others = question.answers.filter((answer) => answer !== accepted);

  const toAnswer = (answer: (typeof question.answers)[number]) =>
    compact({
      '@type': 'Answer',
      text: answer.body,
      url: abs(`/qna/${question.slug}#answer-${answer.documentId}`),
      dateCreated: answer.createdAt,
      author: { '@type': 'Person', name: answer.author_name ?? 'Anonymous' },
    });

  return {
    '@type': 'QAPage',
    mainEntity: compact({
      '@type': 'Question',
      name: question.title,
      text: question.body ?? question.title,
      answerCount: question.answers.length,
      dateCreated: question.createdAt,
      author: { '@type': 'Person', name: question.author_name ?? 'Anonymous' },
      acceptedAnswer: accepted ? toAnswer(accepted) : undefined,
      suggestedAnswer: others.length > 0 ? others.map(toAnswer) : undefined,
    }),
  };
}

/**
 * Passes through the `structuredData` JSON an editor can set on any SEO
 * component. Anything not shaped like a schema.org object is ignored rather
 * than emitted, so a malformed paste cannot corrupt the page's markup.
 */
export function customSchema(seo: Seo | null | undefined): Schema | null {
  const data = seo?.structuredData;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  if (!('@type' in data)) return null;
  return data as Schema;
}

/**
 * FAQPage, for a page carrying a fixed list of question/answer pairs.
 *
 * Takes the same array the section renders, so the markup and the answers on
 * screen cannot drift — Google treats a mismatch between them as cloaking.
 */
export function faqSchema(faqs: { question: string; answer: string }[]): Schema | null {
  if (faqs.length === 0) return null;

  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}
