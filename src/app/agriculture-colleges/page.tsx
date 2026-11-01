import { AgricoPublicationIndex } from '@/components/agrico/publication-index';
import type { SearchParams } from '@/components/ui/pagination';
import { buildMetadata } from '@/lib/metadata';
export const metadata = buildMetadata({ title: 'Private Agriculture Colleges & Universities in India', description: 'Explore 58 researched agriculture and allied institution profiles, with programme details, admission routes and source-specific fee information.', path: '/agriculture-colleges' });
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <AgricoPublicationIndex kind="universities" searchParams={await searchParams} />;
}
