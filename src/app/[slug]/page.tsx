import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck, Scale, FileText, Mail, Calendar, CheckCircle2 } from 'lucide-react';

import { CourseDetailView } from '@/components/course/course-detail-view';
import { ProgramDetailView } from '@/components/program/program-detail-view';
import { AgricoProgrammeDetail } from '@/components/agrico/detail-pages';
import { getProgrammeGuide, programmeGuideSlugs } from '@/components/agrico/detail-catalogue';
import { contentProgrammeModel, guideProgrammeModel } from '@/components/agrico/detail-models';
import { getProgrammeContent, programmeContentSlugs, programmeUniversities } from '@/lib/agrico/programme-content';
import { RichText } from '@/components/cms/rich-text';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { resolveImage } from '@/lib/cms/media';
import { getCourseBySlug, getCourseSlugs } from '@/lib/cms/repositories/course';
import { getFirstContentSection } from '@/lib/cms/repositories/content';
import {
  getProgramBySlug,
  getProgramSlugs,
  listRelatedPrograms,
} from '@/lib/cms/repositories/program';
import { getStandalonePage, getStandaloneSlugs } from '@/lib/cms/repositories/page';
import { getSiteSettings } from '@/lib/cms/repositories/settings';
import { buildMetadata } from '@/lib/metadata';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema } from '@/lib/seo/schemas';
import { SITE_NAME } from '@/lib/env';
import { cmsFetchOptional } from '@/lib/cms/client';

const QUICK_LEGAL_LINKS = [
  { name: 'Privacy Policy', slug: 'privacy-policy', icon: ShieldCheck },
  { name: 'Terms of Use', slug: 'terms-and-conditions', icon: FileText },
  { name: 'Neutrality & Disclaimer', slug: 'disclaimer', icon: Scale },
];

/**
 * Universal root dynamic slug router:
 * 1. Programs / Specializations (e.g. /online-mba-finance-management)
 * 2. Courses / Degrees (e.g. /online-mba)
 * 3. Standalone Pages (e.g. /privacy-policy, /terms-and-conditions)
 */
export async function generateStaticParams() {
  const [standaloneSlugs, courseSlugs, programSlugs] = await Promise.all([
    getStandaloneSlugs(),
    getCourseSlugs(100),
    getProgramSlugs(100),
  ]);

  const unique = new Set([...standaloneSlugs, ...courseSlugs, ...programSlugs, ...programmeGuideSlugs(), ...programmeContentSlugs()]);
  return Array.from(unique).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/[slug]'>) {
  const { slug } = await params;
  const path = `/${slug}`;

  // 1. Check if Researched Agrico Programme Content / Guide
  const content = getProgrammeContent(slug);
  const guide = getProgrammeGuide(slug);
  if (content) return buildMetadata({ title: content.seo?.title || `${content.name} — Curriculum, Eligibility & Admission`, description: content.seo?.description || content.hero?.summary, path });
  if (guide) return buildMetadata({ title: `${guide.name} — Curriculum, Eligibility & University Options`, description: guide.description, path });

  // 2. Check if Program
  const program = await getProgramBySlug(slug);
  if (program) {
    const programDisplayName =
      program.full_name || (program.course ? `${program.course.name} in ${program.name}` : program.name);

    return buildMetadata({
      seo: program.seo,
      title: `${programDisplayName} — Fees, Duration, Eligibility & Top Colleges`,
      description: `Everything about ${programDisplayName}: fees, duration, eligibility, entrance exams, syllabus and the top approved universities that offer it.`,
      path,
    });
  }

  // 2. Check if Course
  const course = await getCourseBySlug(slug);
  if (course) {
    return buildMetadata({
      seo: course.seo,
      title: `${course.name} — Specialisations, Fees & Colleges`,
      description: `Compare every ${course.name} specialisation: fees, duration and the universities that offer each one.`,
      path,
    });
  }

  // 3. Check if Standalone Page
  const page = await getStandalonePage(slug);
  if (page) {
    return buildMetadata({
      seo: page.seo,
      title: page.name,
      description:
        page.kind === 'master'
          ? (page.description ?? undefined)
          : `Read the official ${page.name} for ${SITE_NAME}. Statutory compliance, data protection, and student rights.`,
      path,
    });
  }

  return buildMetadata({ title: 'Not found', path });
}

export default async function DynamicSlugPage({ params }: PageProps<'/[slug]'>) {
  const { slug } = await params;

  // 1. Priority: Researched Agrico Programme Content or Guide
  const content = getProgrammeContent(slug);
  const guide = getProgrammeGuide(slug);
  if (content) {
    const courseSchema = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: content.name,
      description: content.hero?.summary || content.seo?.description,
      provider: {
        '@type': 'EducationalOrganization',
        name: 'Agrico Agricultural Education Portal',
        sameAs: 'https://agrico.in',
      },
      educationalCredentialAwarded: content.name,
      timeRequired: content.duration || 'P4Y',
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: content.mode || 'Full-time, campus-based',
      },
    };

    const faqSchema = content.faqs?.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: content.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        }
      : null;

    const trail = [
      { name: 'Home', path: '/' },
      { name: 'Programmes', path: '/#programmes' },
      { name: content.short_name || content.name, path: `/${slug}` },
    ];

    return (
      <>
        <JsonLdGraph
          items={[
            breadcrumbSchema(trail),
            courseSchema,
            ...(faqSchema ? [faqSchema] : []),
          ]}
        />
        <AgricoProgrammeDetail
          model={contentProgrammeModel(
            content,
            programmeUniversities(slug),
            (content.related || [])
              .flatMap((item) => {
                const doc = getProgrammeContent(item);
                return doc ? [doc] : [];
              })
              .slice(0, 3),
            guide
          )}
        />
      </>
    );
  }
  if (guide) {
    return <AgricoProgrammeDetail model={guideProgrammeModel(guide)} />;
  }

  // 2. Try rendering Program
  const program = await getProgramBySlug(slug);
  if (program) {
    const [section, related] = await Promise.all([
      getFirstContentSection('program', slug),
      listRelatedPrograms(program),
    ]);

    return (
      <ProgramDetailView
        program={program}
        section={section}
        activeSlug={null}
        related={related}
      />
    );
  }

  // 2. Try rendering Course
  const course = await getCourseBySlug(slug);
  if (course) {
    return <CourseDetailView course={course} />;
  }

  // 3. Try rendering Standalone Page (Legal / Master)
  const page = await getStandalonePage(slug);
  if (page) {
    // The grievance-officer address below is a statutory contact, so it comes
    // from the CMS like every other contact detail rather than being pinned to
    // whatever domain the site had when this page was written.
    const { contactEmail } = await getSiteSettings();
    const hero = page.kind === 'master' ? resolveImage(page.image, page.name) : null;
    const body = page.kind === 'legal' ? page.description : page.long_description;
    const trail = [
      { name: 'Home', path: '/' },
      { name: page.name, path: `/${slug}` },
    ];

    return (
      <div className="bg-ink-50/40 py-10 lg:py-16">
        <JsonLdGraph items={[breadcrumbSchema(trail)]} />

        <div className="container-page max-w-5xl">
          <Breadcrumbs items={trail} tone="page" className="mb-6" />

          {/* Page Header */}
          <div className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-10 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-2xs font-extrabold text-brand-800 ring-1 ring-brand-200/60">
                {page.kind === 'legal' ? <ShieldCheck className="size-3.5" /> : <FileText className="size-3.5" />}
                <span>{page.kind === 'legal' ? 'Official Policy & Compliance' : 'Official Page'}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1 text-2xs font-semibold text-ink-600">
                <Calendar className="size-3 text-ink-500" />
                <span>Effective Date: September 2026</span>
              </span>
            </div>

            <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl lg:text-4xl text-balance">
              {page.name}
            </h1>

            {page.kind === 'master' && page.description ? (
              <p className="mt-3 text-base leading-relaxed text-ink-600 sm:text-lg">
                {page.description}
              </p>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-ink-600 sm:text-sm">
                Applicable to all visitors, applicants, and registered students on {SITE_NAME}. Managed dynamically via CMS.
              </p>
            )}

            {/* Quick Legal Switcher Tabs */}
            {page.kind === 'legal' ? (
              <div className="mt-6 flex flex-wrap gap-2 border-t border-ink-150 pt-5">
                {QUICK_LEGAL_LINKS.map((tab) => {
                  const isActive = tab.slug === slug;
                  const Icon = tab.icon;
                  return (
                    <Link
                      key={tab.slug}
                      href={`/${tab.slug}`}
                      className={`inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-900 text-white shadow-xs'
                          : 'bg-ink-100 text-ink-700 hover:bg-ink-200 hover:text-ink-900'
                      }`}
                    >
                      <Icon className="size-3.5" />
                      <span>{tab.name}</span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          {hero ? (
            <Image
              src={hero.src}
              alt={hero.alt}
              width={hero.width ?? 1200}
              height={hero.height ?? 675}
              priority
              sizes="(min-width: 1024px) 48rem, 100vw"
              className="mt-8 h-auto w-full rounded-3xl border border-ink-200 shadow-2xs"
            />
          ) : null}

          {/* Body Content */}
          <article className="mt-8 rounded-3xl border border-ink-200 bg-white p-6 sm:p-10 shadow-2xs">
            {body ? (
              <div className="prose prose-ink max-w-none text-ink-800">
                <RichText content={body} />
              </div>
            ) : (
              <EmptyState
                title="This page has no content yet"
                description="It is published in the CMS but still being written."
                action={
                  <ButtonLink href="/" variant="outline">
                    Back to the homepage
                  </ButtonLink>
                }
              />
            )}

            {/* Statutory Grievance Notice Box at the bottom of legal pages */}
            {page.kind === 'legal' ? (
              <div className="mt-12 rounded-2xl border border-brand-200/80 bg-brand-50/50 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-700" />
                      <h3 className="text-xs font-bold text-ink-900 uppercase tracking-wide">
                        Grievance Officer & Legal Inquiries
                      </h3>
                    </div>
                    <p className="text-xs text-ink-600 leading-relaxed">
                      Have a question or request regarding your personal data, neutrality verification, or statutory disclosures?
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-flex items-center gap-1.5 rounded-pill bg-brand-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-800 transition-colors"
                    >
                      <Mail className="size-3.5" />
                      <span>{contactEmail}</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : null}
          </article>
        </div>
      </div>
    );
  }

  // 4. Not found
  notFound();
}
