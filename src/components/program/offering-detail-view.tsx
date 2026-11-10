import { AgricoProgrammeDetail } from '@/components/agrico/detail-pages';
import { cmsProgrammeModel, universityListing } from '@/components/agrico/detail-models';
import { blocksToText } from '@/lib/cms/blocks';
import { mediaUrl } from '@/lib/cms/media';
import { offeringHref, toCleanSectionSuffix, universityHref } from '@/lib/cms/paths';
import { sectionFaqs, type ContentSection } from '@/lib/cms/repositories/content';
import type { ProgramDetail } from '@/lib/cms/repositories/program';
import type { UniversityDetail } from '@/lib/cms/repositories/university';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema, customSchema, faqSchema, programSchema } from '@/lib/seo/schemas';

type FeeRow = NonNullable<UniversityDetail['program_fees']>[number];

export function OfferingDetailView({
  program,
  university,
  fee,
  section,
  activeSlug = null,
}: {
  program: ProgramDetail;
  university: UniversityDetail;
  fee?: FeeRow;
  section: ContentSection | null;
  activeSlug?: string | null;
}) {
  const effectiveActiveSlug = activeSlug ?? (section?.secondary_slug || section?.slug || null);
  const model = cmsProgrammeModel(program, section, [], effectiveActiveSlug);
  const basePath = offeringHref(university, program.slug);
  const uniPath = universityHref(university);

  model.path = basePath;
  model.offering = true;
  model.offeredAt = university.name;
  model.universityPath = uniPath;
  model.fee = fee?.fee ?? null;
  model.feeLabel = undefined;
  model.feeNote = fee?.note;
  model.context = {
    programName: model.name,
    programSlug: program.slug,
    universityName: university.name,
    universitySlug: university.slug,
  };
  model.universities = [universityListing(university)];
  if (university.brochure?.url) {
    model.resources.push({ name: 'University brochure', href: mediaUrl(university.brochure.url)! });
  }

  const isSubTab = Boolean(
    effectiveActiveSlug &&
      toCleanSectionSuffix(effectiveActiveSlug) !== 'overview' &&
      (section?.display_name || section?.name)
  );
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Universities', path: '/#universities' },
    { name: university.name, path: uniPath },
    { name: model.name, path: basePath },
    ...(isSubTab
      ? [
          {
            name: section!.display_name || section!.name!,
            path: offeringHref(university, program.slug, effectiveActiveSlug),
          },
        ]
      : []),
  ];

  const faqs = sectionFaqs(section).map((faq) => ({
    question: faq.title,
    answer: blocksToText(faq.description),
  }));

  return (
    <>
      <JsonLdGraph
        items={[
          programSchema(program),
          breadcrumbSchema(trail),
          faqSchema(faqs),
          customSchema(section?.seo ?? program.seo),
        ]}
      />
      <AgricoProgrammeDetail model={model} />
    </>
  );
}
