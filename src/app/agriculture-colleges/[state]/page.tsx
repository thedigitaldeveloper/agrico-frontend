import { notFound } from 'next/navigation';
import { AgricoPublicationPage } from '@/components/agrico/publication-page';
import { getPublicationState, publicationStates } from '@/lib/agrico/publication';
import { publicationMetadata } from '@/lib/agrico/publication-seo';
export const generateStaticParams = () => publicationStates.map(doc => ({ state: doc.slug }));
export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const doc = getPublicationState((await params).state);
  if (!doc) notFound();
  return publicationMetadata(doc);
}
export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const doc = getPublicationState((await params).state);
  if (!doc) notFound();
  return <AgricoPublicationPage doc={doc} />;
}
