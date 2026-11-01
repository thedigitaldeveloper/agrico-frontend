import { notFound } from 'next/navigation';

import { ExamDetailView } from '@/components/exam/exam-detail-view';
import { getContentSection } from '@/lib/cms/repositories/content';
import { getExamBySlug } from '@/lib/cms/repositories/exam';
import { buildMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }: PageProps<'/exams/[slug]/[section]'>) {
  const { slug, section: sectionSlug } = await params;
  const [exam, section] = await Promise.all([
    getExamBySlug(slug),
    getContentSection('examination', slug, sectionSlug),
  ]);

  if (!exam || !section) {
    return buildMetadata({ title: 'Not found', path: `/exams/${slug}/${sectionSlug}` });
  }

  const label = section.display_name || section.name || sectionSlug;

  return buildMetadata({
    seo: section.seo,
    title: section.heading || `${exam.name} — ${label}`,
    description: `${label} details for ${exam.name}.`,
    path: `/exams/${slug}/${sectionSlug}`,
  });
}

export default async function ExamSectionPage({ params }: PageProps<'/exams/[slug]/[section]'>) {
  const { slug, section: sectionSlug } = await params;

  const [exam, section] = await Promise.all([
    getExamBySlug(slug),
    getContentSection('examination', slug, sectionSlug),
  ]);

  if (!exam || !section) notFound();

  return <ExamDetailView exam={exam} section={section} activeSlug={sectionSlug} />;
}
