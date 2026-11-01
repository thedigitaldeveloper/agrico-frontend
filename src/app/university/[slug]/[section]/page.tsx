import { notFound, permanentRedirect } from 'next/navigation';

import { UniversityDetailView } from '@/components/university/university-detail-view';
import { getContentSection } from '@/lib/cms/repositories/content';
import { listUniversityPrograms } from '@/lib/cms/repositories/program';
import { getRelatedUniversities, getUniversityBySlug } from '@/lib/cms/repositories/university';
import { buildMetadata } from '@/lib/metadata';
import { getPublicationUniversityTab, getPublicationUniversity, isPublicationDocument } from '@/lib/agrico/publication';
import { publicationMetadata } from '@/lib/agrico/publication-seo';
import { publicationHtmlState } from '@/lib/agrico/publication-html';
import { AgricoPublicationPage } from '@/components/agrico/publication-page';
import { cmsFetchOptional } from '@/lib/cms/client';

export const dynamic = 'force-static';
export const revalidate = 3600;

// The complete written tab catalogue is served and cached on demand.
export function generateStaticParams() { return []; }

async function getAuthoredTab(slug: string, section: string) {
  if (section === 'overview' && getPublicationUniversity(slug)) permanentRedirect('/university/' + slug);
  const prepared = getPublicationUniversityTab(slug, section);
  // Curated institutions have a defined eleven-page navigation. A typo must
  // return 404 even when the optional CMS is offline. Other CMS institutions
  // keep their legacy authored-section lookup.
  if (!prepared) {
    if (getPublicationUniversity(slug)) notFound();
    return null;
  }
  const university = await cmsFetchOptional(() => getUniversityBySlug(slug), null);
  const parent = isPublicationDocument(university?.agriculture_content, slug) ? university.agriculture_content : null;
  const imported = parent?.tab_pages?.find(doc => doc.tab_slug === section);
  const doc = isPublicationDocument(imported, slug) ? { ...imported, indexing: imported.indexing || prepared.indexing } : prepared;
  const content = university ? await cmsFetchOptional(() => getContentSection('university', slug, section), null) : null;
  const state = publicationHtmlState(doc, content, university?.university_contents);
  return { ...state, university };
}

/**
 * Section routes are generated on demand rather than prerendered: the product
 * of every university and every one of its sections is large, and most of that
 * tail is never requested.
 */
export async function generateMetadata({
  params,
}: PageProps<'/university/[slug]/[section]'>) {
  const { slug, section: sectionSlug } = await params;
  const authored = await getAuthoredTab(slug, sectionSlug);
  if (authored) return publicationMetadata(authored.doc);
  const [university, section] = await Promise.all([
    getUniversityBySlug(slug),
    getContentSection('university', slug, sectionSlug),
  ]);

  if (!university || !section) {
    return buildMetadata({ title: 'Not found', path: `/university/${slug}/${sectionSlug}` });
  }

  const label = section.display_name || section.name || sectionSlug;

  return buildMetadata({
    seo: section.seo,
    title: section.heading || `${university.name} — ${label}`,
    description: `${label} details for ${university.name}.`,
    path: `/university/${slug}/${sectionSlug}`,
    image: university.logo?.url ?? null,
    icon: university.fav_icon?.url,
  });
}

export default async function UniversitySectionPage({
  params,
}: PageProps<'/university/[slug]/[section]'>) {
  const { slug, section: sectionSlug } = await params;
  const authored = await getAuthoredTab(slug, sectionSlug);
  if (authored) return <AgricoPublicationPage doc={authored.doc} htmlBlock={authored.htmlBlock} university={authored.university} />;

  const [university, section] = await Promise.all([
    getUniversityBySlug(slug),
    getContentSection('university', slug, sectionSlug),
  ]);

  if (!university || !section) notFound();

  const [related, programs] = await Promise.all([
    getRelatedUniversities(university),
    listUniversityPrograms(slug),
  ]);

  return (
    <UniversityDetailView
      university={university}
      section={section}
      activeSlug={sectionSlug}
      related={related}
      programs={programs}
    />
  );
}
