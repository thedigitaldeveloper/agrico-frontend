import { AgricoProgrammeDetail } from '@/components/agrico/detail-pages';
import { cmsProgrammeModel } from '@/components/agrico/detail-models';
import { blocksToText } from '@/lib/cms/blocks';
import { toCleanSectionSuffix } from '@/lib/cms/paths';
import { sectionFaqs, type ContentSection } from '@/lib/cms/repositories/content';
import type { ProgramCard, ProgramDetail } from '@/lib/cms/repositories/program';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema, customSchema, faqSchema, programSchema } from '@/lib/seo/schemas';
import { getProgrammeContent } from '@/lib/agrico/programme-content';

export function ProgramDetailView({
  program,
  section,
  activeSlug,
  related,
}: {
  program: ProgramDetail;
  section: ContentSection | null;
  activeSlug: string | null;
  related: ProgramCard[];
}) {
  const researched = getProgrammeContent(program.slug);
  const model = cmsProgrammeModel(program, section, related, activeSlug, researched);
  const cmsFaqs = sectionFaqs(section).map((faq) => ({
    question: faq.title,
    answer: blocksToText(faq.description),
  }));
  const faqs = cmsFaqs.length ? cmsFaqs : researched?.faqs || [];

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: program.full_name || program.name,
    description: program.seo?.metaDescription || model.description,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Agrico Agricultural Education Portal',
      sameAs: 'https://agrico.in',
    },
    educationalCredentialAwarded: program.full_name || program.name,
    timeRequired: program.duration_text || (program.duration ? `P${program.duration}Y` : 'P4Y'),
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: program.course_mode?.name || 'Full-time, campus-based',
    },
  };

  const faqLd = faqs.length ? faqSchema(faqs) : null;

  const isSubTab = Boolean(
    activeSlug &&
      toCleanSectionSuffix(activeSlug) !== 'overview' &&
      (section?.display_name || section?.name)
  );
  const breadcrumbTrail = [
    { name: 'Home', path: '/' },
    { name: 'Programmes', path: '/#programmes' },
    { name: model.name, path: model.path },
    ...(isSubTab
      ? [
          {
            name: section!.display_name || section!.name!,
            path: `${model.path}-${toCleanSectionSuffix(activeSlug!)}`,
          },
        ]
      : []),
  ];

  return (
    <>
      <JsonLdGraph
        items={[
          courseSchema,
          programSchema(program),
          breadcrumbSchema(breadcrumbTrail),
          ...(faqLd ? [faqLd] : []),
          customSchema(section?.seo ?? program.seo),
        ]}
      />
      <AgricoProgrammeDetail model={model} />
    </>
  );
}
