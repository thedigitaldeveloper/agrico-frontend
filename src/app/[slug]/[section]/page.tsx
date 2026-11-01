import { notFound } from 'next/navigation';

import { ProgramDetailView } from '@/components/program/program-detail-view';
import { getContentSection } from '@/lib/cms/repositories/content';
import { getProgramBySlug, listRelatedPrograms } from '@/lib/cms/repositories/program';
import { buildMetadata } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; section: string }>;
}) {
  const { slug, section: sectionSlug } = await params;
  const [program, section] = await Promise.all([
    getProgramBySlug(slug),
    getContentSection('program', slug, sectionSlug),
  ]);

  if (!program || !section) {
    return buildMetadata({ title: 'Not found', path: `/${slug}/${sectionSlug}` });
  }

  const label = section.display_name || section.name || sectionSlug;
  const programDisplayName =
    program.full_name || (program.course ? `${program.course.name} in ${program.name}` : program.name);

  return buildMetadata({
    seo: section.seo,
    title: section.heading || `${programDisplayName} — ${label}`,
    description: `${label} details, syllabus and admission guidelines for ${programDisplayName}.`,
    path: `/${slug}/${sectionSlug}`,
  });
}

export default async function ProgramSectionPage({
  params,
}: {
  params: Promise<{ slug: string; section: string }>;
}) {
  const { slug, section: sectionSlug } = await params;

  const [program, section] = await Promise.all([
    getProgramBySlug(slug),
    getContentSection('program', slug, sectionSlug),
  ]);

  if (!program || !section) notFound();

  const related = await listRelatedPrograms(program);

  return (
    <ProgramDetailView
      program={program}
      section={section}
      activeSlug={sectionSlug}
      related={related}
    />
  );
}
