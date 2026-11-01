import { notFound } from 'next/navigation';

import { ExamDetailView } from '@/components/exam/exam-detail-view';
import { getFirstContentSection } from '@/lib/cms/repositories/content';
import { getExamBySlug, getExamSlugs } from '@/lib/cms/repositories/exam';
import { buildMetadata } from '@/lib/metadata';

export async function generateStaticParams() {
  const slugs = await getExamSlugs(100);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/exams/[slug]'>) {
  const { slug } = await params;
  const exam = await getExamBySlug(slug);
  if (!exam) return buildMetadata({ title: 'Not found', path: `/exams/${slug}` });

  return buildMetadata({
    seo: exam.seo,
    title: `${exam.name} — Dates, Eligibility, Application & Pattern`,
    description:
      exam.description ??
      `${exam.name} application dates, eligibility, registration fee and the universities that accept it.`,
    path: `/exams/${slug}`,
  });
}

export default async function ExamPage({ params }: PageProps<'/exams/[slug]'>) {
  const { slug } = await params;

  const exam = await getExamBySlug(slug);
  if (!exam) notFound();

  const section = await getFirstContentSection('examination', slug);

  return <ExamDetailView exam={exam} section={section} activeSlug={null} />;
}
