import { notFound, permanentRedirect } from 'next/navigation';

import { OfferingDetailView } from '@/components/program/offering-detail-view';
import { UniversityDetailView } from '@/components/university/university-detail-view';
import { AgricoPublicationPage } from '@/components/agrico/publication-page';
import { cmsFetchOptional } from '@/lib/cms/client';
import { offeringHref, splitHyphenatedProgramSectionSlug } from '@/lib/cms/paths';
import {
  getContentSection,
  getFirstContentSection,
  type ContentSection,
} from '@/lib/cms/repositories/content';
import {
  getProgramBySlug,
  listUniversityPrograms,
  type ProgramDetail,
} from '@/lib/cms/repositories/program';
import {
  getRelatedUniversities,
  getUniversityBySlug,
  type UniversityDetail,
} from '@/lib/cms/repositories/university';
import {
  getPublicationUniversity,
  getPublicationUniversityTab,
  isPublicationDocument,
} from '@/lib/agrico/publication';
import { publicationHtmlState } from '@/lib/agrico/publication-html';
import { publicationMetadata } from '@/lib/agrico/publication-seo';
import { buildMetadata } from '@/lib/metadata';

export const dynamic = 'force-static';
export const revalidate = 3600;

// The complete written tab catalogue is served and cached on demand.
export function generateStaticParams() {
  return [];
}

async function getAuthoredTab(slug: string, section: string) {
  if (section === 'overview' && getPublicationUniversity(slug)) {
    permanentRedirect('/university/' + slug);
  }
  const prepared = getPublicationUniversityTab(slug, section);
  if (!prepared) return null;

  const university = await cmsFetchOptional(() => getUniversityBySlug(slug), null);
  const parent = isPublicationDocument(university?.agriculture_content, slug)
    ? university.agriculture_content
    : null;
  const imported = parent?.tab_pages?.find((doc) => doc.tab_slug === section);
  const doc = isPublicationDocument(imported, slug)
    ? { ...imported, indexing: imported.indexing || prepared.indexing }
    : prepared;
  const content = university
    ? await cmsFetchOptional(() => getContentSection('university', slug, section), null)
    : null;
  const state = publicationHtmlState(doc, content, university?.university_contents);
  return { ...state, university };
}

type ResolvedSegment =
  | { kind: 'section'; section: ContentSection }
  | {
      kind: 'offering';
      program: ProgramDetail;
      section: ContentSection | null;
      activeSlug: string | null;
    };

/**
 * Resolves the second URL segment under `/university/[slug]/[section]`:
 * 1. A university content section (e.g. `courses`, `admission`, `placement`, `faqs`)
 * 2. A direct program offering (e.g. `bsc-agriculture`)
 * 3. A hyphenated program offering section (e.g. `bsc-agriculture-syllabus`, `bsc-agriculture-fees`)
 */
async function resolveUniversitySegment(
  university: UniversityDetail,
  segment: string
): Promise<ResolvedSegment | null> {
  // 1. University content section
  const uniSection = await getContentSection('university', university.slug, segment);
  if (uniSection) {
    return { kind: 'section', section: uniSection };
  }

  // 2. Direct program offering (Overview)
  const directProgram = await getProgramBySlug(segment);
  if (
    directProgram &&
    (directProgram.universities.some((u) => u.slug === university.slug) ||
      university.program_fees?.some((f) => f.program?.slug === directProgram.slug))
  ) {
    const firstSection = await getFirstContentSection('program', directProgram.slug);
    return {
      kind: 'offering',
      program: directProgram,
      section: firstSection,
      activeSlug: 'overview',
    };
  }

  // 3. Hyphenated program offering section (e.g. `bsc-agriculture-syllabus`)
  const parsed = splitHyphenatedProgramSectionSlug(segment);
  if (parsed) {
    const program = await getProgramBySlug(parsed.programSlug);
    if (
      program &&
      (program.universities.some((u) => u.slug === university.slug) ||
        university.program_fees?.some((f) => f.program?.slug === program.slug))
    ) {
      if (parsed.sectionSuffix === 'overview') {
        const firstSection = await getFirstContentSection('program', program.slug);
        return {
          kind: 'offering',
          program,
          section: firstSection,
          activeSlug: 'overview',
        };
      }
      const progSection = await getContentSection(
        'program',
        program.slug,
        parsed.sectionSuffix
      );
      if (progSection) {
        return {
          kind: 'offering',
          program,
          section: progSection,
          activeSlug: progSection.secondary_slug || progSection.slug,
        };
      }
    }
  }

  return null;
}

export async function generateMetadata({
  params,
}: PageProps<'/university/[slug]/[section]'>) {
  const { slug, section: sectionSlug } = await params;
  const authored = await getAuthoredTab(slug, sectionSlug);
  if (authored) return publicationMetadata(authored.doc);

  const university = await cmsFetchOptional(() => getUniversityBySlug(slug), null);
  if (!university) {
    return buildMetadata({ title: 'Not found', path: `/university/${slug}/${sectionSlug}` });
  }

  const resolved = await resolveUniversitySegment(university, sectionSlug);
  if (!resolved) {
    return buildMetadata({ title: 'Not found', path: `/university/${slug}/${sectionSlug}` });
  }

  if (resolved.kind === 'offering') {
    const { program, section, activeSlug } = resolved;
    const displayName = program.full_name || program.name;
    const isSubTab = activeSlug && activeSlug !== 'overview' && section;
    const tabLabel = isSubTab ? section.display_name || section.name || activeSlug : null;

    return buildMetadata({
      seo: isSubTab ? section.seo : program.seo,
      title: tabLabel
        ? `${displayName} ${tabLabel} at ${university.name}`
        : `${displayName} at ${university.name} — Fees, Syllabus, Eligibility & Admission`,
      description: tabLabel
        ? `${tabLabel} details, syllabus and fee structure for ${displayName} at ${university.name}.`
        : `Explore ${displayName} at ${university.name}: semester-wise syllabus, ICAR/UGC approvals, fee breakdown, eligibility criteria, and campus admission process.`,
      path: offeringHref(
        university,
        program.slug,
        isSubTab ? activeSlug : undefined
      ),
      image: university.logo?.url ?? null,
      icon: university.fav_icon?.url,
    });
  }

  const { section } = resolved;
  const label = section.display_name || section.name || sectionSlug;

  return buildMetadata({
    seo: section.seo,
    title: section.heading || `${university.name} — ${label}`,
    description: `${label} details for ${university.name}.`,
    path: `/university/${university.slug}/${sectionSlug}`,
    image: university.logo?.url ?? null,
    icon: university.fav_icon?.url,
  });
}

export default async function UniversitySectionPage({
  params,
}: PageProps<'/university/[slug]/[section]'>) {
  const { slug, section: sectionSlug } = await params;
  const authored = await getAuthoredTab(slug, sectionSlug);
  if (authored) {
    return (
      <AgricoPublicationPage
        doc={authored.doc}
        htmlBlock={authored.htmlBlock}
        university={authored.university}
      />
    );
  }

  const university = await cmsFetchOptional(() => getUniversityBySlug(slug), null);
  if (!university) notFound();

  const resolved = await resolveUniversitySegment(university, sectionSlug);
  if (!resolved) notFound();

  if (resolved.kind === 'offering') {
    const { program, section, activeSlug } = resolved;
    const fee = university.program_fees?.find((item) => item.program?.slug === program.slug);
    return (
      <OfferingDetailView
        program={program}
        university={university}
        fee={fee}
        section={section}
        activeSlug={activeSlug}
      />
    );
  }

  const [related, programs] = await Promise.all([
    getRelatedUniversities(university),
    listUniversityPrograms(university.slug),
  ]);

  return (
    <UniversityDetailView
      university={university}
      section={resolved.section}
      activeSlug={sectionSlug}
      related={related}
      programs={programs}
    />
  );
}
