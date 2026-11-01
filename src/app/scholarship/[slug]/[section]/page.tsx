import { notFound } from 'next/navigation';

import { ScholarshipDetailView } from '@/components/scholarship/scholarship-detail-view';
import { getContentSection } from '@/lib/cms/repositories/content';
import { getScholarshipBySlug } from '@/lib/cms/repositories/scholarship';
import { buildMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }: PageProps<'/scholarship/[slug]/[section]'>) {
  const { slug, section: sectionSlug } = await params;
  const [scholarship, section] = await Promise.all([
    getScholarshipBySlug(slug),
    getContentSection('scheme', slug, sectionSlug),
  ]);

  if (!scholarship || !section) {
    return buildMetadata({ title: 'Not found', path: `/scholarship/${slug}/${sectionSlug}` });
  }

  const label = section.display_name || section.name || sectionSlug;

  return buildMetadata({
    seo: section.seo,
    title: section.heading || `${scholarship.name} — ${label}`,
    description: `${label} details for ${scholarship.name}.`,
    path: `/scholarship/${slug}/${sectionSlug}`,
  });
}

export default async function ScholarshipSectionPage({
  params,
}: PageProps<'/scholarship/[slug]/[section]'>) {
  const { slug, section: sectionSlug } = await params;

  const [scholarship, section] = await Promise.all([
    getScholarshipBySlug(slug),
    getContentSection('scheme', slug, sectionSlug),
  ]);

  if (!scholarship || !section) notFound();

  return (
    <ScholarshipDetailView
      scholarship={scholarship}
      section={section}
      activeSlug={sectionSlug}
    />
  );
}
