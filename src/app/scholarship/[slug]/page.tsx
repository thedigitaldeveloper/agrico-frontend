import { notFound } from 'next/navigation';

import { ScholarshipDetailView } from '@/components/scholarship/scholarship-detail-view';
import { getFirstContentSection } from '@/lib/cms/repositories/content';
import { getScholarshipBySlug, getScholarshipSlugs } from '@/lib/cms/repositories/scholarship';
import { buildMetadata } from '@/lib/metadata';

export async function generateStaticParams() {
  const slugs = await getScholarshipSlugs(100);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/scholarship/[slug]'>) {
  const { slug } = await params;
  const scholarship = await getScholarshipBySlug(slug);
  if (!scholarship) return buildMetadata({ title: 'Not found', path: `/scholarship/${slug}` });

  return buildMetadata({
    seo: scholarship.seo,
    title: scholarship.heading || `${scholarship.name} — Eligibility, Amount & How to Apply`,
    description: `${scholarship.name}: who is eligible, how much it covers and how to apply.`,
    path: `/scholarship/${slug}`,
  });
}

export default async function ScholarshipPage({ params }: PageProps<'/scholarship/[slug]'>) {
  const { slug } = await params;

  const scholarship = await getScholarshipBySlug(slug);
  if (!scholarship) notFound();

  const section = await getFirstContentSection('scheme', slug);

  return (
    <ScholarshipDetailView scholarship={scholarship} section={section} activeSlug={null} />
  );
}
