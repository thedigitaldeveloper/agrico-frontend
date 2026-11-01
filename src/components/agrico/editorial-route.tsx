import { notFound, permanentRedirect } from 'next/navigation';
import { AgricoPublicationPage } from './publication-page';
import { PostDetailView } from '@/components/blog/post-detail-view';
import { getBlogBySlug, getBlogSlugs, getRelatedPosts, canonicalPostPath, type BlogSection } from '@/lib/cms/repositories/blog';
import { cmsFetchOptional } from '@/lib/cms/client';
import { getPublicationPost, isPublicationDocument, publicationPosts } from '@/lib/agrico/publication';
import { buildMetadata } from '@/lib/metadata';
import { SITE_URL } from '@/lib/env';
import { publicationMetadata } from '@/lib/agrico/publication-seo';
import { publicationHtmlState } from '@/lib/agrico/publication-html';

async function resolvePost(slug: string) {
  const prepared = getPublicationPost(slug);
  const cms = prepared ? await cmsFetchOptional(() => getBlogBySlug(slug), null) : await getBlogBySlug(slug);
  const doc = isPublicationDocument(cms?.editorial_content, slug) ? cms.editorial_content : prepared;
  const state = doc ? publicationHtmlState(doc, cms?.body_html ? { content: [{ ...cms.body_html, __component: 'common.html-section' }], heading: cms.name, display_name: null, seo: cms.seo } : null) : null;
  return { doc: state?.doc, cms, htmlBlock: state?.htmlBlock };
}
export async function editorialStaticParams(section: BlogSection) {
  const slugs = await getBlogSlugs(section, 100);
  return [...new Set([...slugs, ...publicationPosts.filter(doc => doc.path.startsWith('/' + section + '/')).map(doc => doc.slug)])].map(slug => ({ slug }));
}
export async function editorialMetadata(section: BlogSection, params: Promise<{ slug: string }>) {
  const { slug } = await params;
  const { doc, cms } = await resolvePost(slug);
  if (doc) return publicationMetadata(doc);
  if (!cms) return buildMetadata({ title: 'Not found', path: '/' + section + '/' + slug });
  return buildMetadata({ seo: cms.seo ? { ...cms.seo, canonicalURL: SITE_URL + canonicalPostPath(cms) } : null, title: cms.name, description: cms.description || undefined, path: canonicalPostPath(cms), image: cms.image?.url || cms.thumbnail?.url });
}
export async function EditorialRoute({ section, params }: { section: BlogSection; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { doc, cms, htmlBlock } = await resolvePost(slug);
  const requested = '/' + section + '/' + slug;
  if (doc) {
    if (doc.path !== requested) permanentRedirect(doc.path);
    return <AgricoPublicationPage doc={doc} htmlBlock={htmlBlock} />;
  }
  if (!cms) notFound();
  const canonical = canonicalPostPath(cms);
  if (canonical !== requested) permanentRedirect(canonical);
  return <PostDetailView post={cms} section={section} related={await getRelatedPosts(cms)} />;
}
