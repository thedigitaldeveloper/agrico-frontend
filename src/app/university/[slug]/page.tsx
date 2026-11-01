import { notFound } from 'next/navigation';

import { UniversityDetailView } from '@/components/university/university-detail-view';
import { AgricoUniversityDetail } from '@/components/agrico/detail-pages';
import { getUniversityGuide, UNIVERSITY_GUIDES } from '@/components/agrico/detail-catalogue';
import { guideUniversityModel } from '@/components/agrico/detail-models';
import { getFirstContentSection, getContentSection } from '@/lib/cms/repositories/content';
import { listUniversityPrograms } from '@/lib/cms/repositories/program';
import {
  getRelatedUniversities,
  getUniversityBySlug,
  getUniversitySlugs,
} from '@/lib/cms/repositories/university';
import { buildMetadata } from '@/lib/metadata';
import { getPublicationUniversity, publicationUniversities, isPublicationDocument, withRelatedEditorial } from '@/lib/agrico/publication';
import { canonicalPostPath } from '@/lib/cms/repositories/blog';
import { AgricoPublicationPage } from '@/components/agrico/publication-page';
import { cmsFetchOptional } from '@/lib/cms/client';
import { publicationMetadata } from '@/lib/agrico/publication-seo';
import { publicationHtmlState } from '@/lib/agrico/publication-html';

/**
 * Prerender the most recently updated universities and generate the rest on
 * first request, then cache them. Publishing in the CMS drops the matching tag,
 * so a page is only ever rebuilt when its content actually changed.
 */
export async function generateStaticParams() {
  const slugs = await getUniversitySlugs(100);
  return [...new Set([...slugs, ...UNIVERSITY_GUIDES.map(guide => guide.slug), ...publicationUniversities.map(doc => doc.slug)])].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/university/[slug]'>) {
  const { slug } = await params;
  const prepared = getPublicationUniversity(slug);
  const university = prepared || getUniversityGuide(slug) ? await cmsFetchOptional(() => getUniversityBySlug(slug), null) : await getUniversityBySlug(slug);
  const authored = isPublicationDocument(university?.agriculture_content, slug) ? university.agriculture_content : prepared;
  if (authored) {
    const section = university ? await cmsFetchOptional(() => getContentSection('university', slug, 'overview'), null) : null;
    return publicationMetadata(publicationHtmlState(authored, section, university?.university_contents).doc);
  }
  if (!university) {
    const guide = getUniversityGuide(slug);
    return buildMetadata({ title: guide ? guide.name + ' — Programmes & Admission Guide' : 'Not found', description: guide?.description, path: `/university/${slug}` });
  }

  return buildMetadata({
    seo: university.seo,
    title:
      university.heading || `${university.name} — Admission, Courses, Fees & Placements`,
    description:
      `Explore ${university.name}` +
      (university.city ? ` in ${university.city}, ${university.state}` : '') +
      '. Compare courses, fees, approvals, rankings and placements.',
    path: `/university/${slug}`,
    image: university.logo?.url ?? null,
    icon: university.fav_icon?.url,
  });
}

export default async function UniversityPage({ params }: PageProps<'/university/[slug]'>) {
  const { slug } = await params;

  const prepared = getPublicationUniversity(slug);
  const university = prepared || getUniversityGuide(slug) ? await cmsFetchOptional(() => getUniversityBySlug(slug), null) : await getUniversityBySlug(slug);
  const authored = isPublicationDocument(university?.agriculture_content, slug) ? university.agriculture_content : prepared;
  if (authored) {
    const section = university ? await cmsFetchOptional(() => getContentSection('university', slug, 'overview'), null) : null;
    const state = publicationHtmlState(withRelatedEditorial(authored, (university?.editorial_posts || []).filter(post => post.publishedAt).map(post => ({ title: post.name, path: canonicalPostPath(post), description: post.description || '', kind: post.type || 'Article' }))), section, university?.university_contents);
    return <AgricoPublicationPage doc={state.doc} htmlBlock={state.htmlBlock} university={university} />;
  }
  if (!university) {
    const guide = getUniversityGuide(slug);
    if (guide) return <AgricoUniversityDetail model={guideUniversityModel(guide)} />;
    notFound();
  }

  const [section, related, programs] = await Promise.all([
    getFirstContentSection('university', slug),
    getRelatedUniversities(university),
    listUniversityPrograms(slug),
  ]);

  return (
    <UniversityDetailView
      university={university}
      section={section}
      activeSlug={null}
      related={related}
      programs={programs}
    />
  );
}
