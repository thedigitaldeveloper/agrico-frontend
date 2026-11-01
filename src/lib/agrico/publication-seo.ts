import { buildMetadata } from '@/lib/metadata';
import type { PublicationDocument } from './publication';
import { SITE_URL } from '@/lib/env';

export function publicationMetadata(doc: PublicationDocument) {
  const metadata = buildMetadata({
    title: doc.meta_title, description: doc.description, path: doc.path,
    image: doc.hero_media?.find(image => image.role === 'campus_primary')?.src,
    noindex: doc.indexing?.index === false,
  });
  if (['Articles', 'Blog', 'News'].includes(doc.kind)) metadata.openGraph = {
    ...metadata.openGraph, type: 'article', authors: [SITE_URL + '/editorial-policy'],
    ...(doc.published_on ? { publishedTime: doc.published_on } : {}), modifiedTime: doc.reviewed_on,
  };
  return metadata;
}
