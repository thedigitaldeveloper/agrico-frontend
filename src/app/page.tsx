import type { Metadata } from 'next';
import { AgricoHome } from '@/components/agrico/home';
import { FAQS } from '@/components/agrico/home-data';
import { getRsHomeData } from '@/lib/cms/repositories/rs-home';
import { getHomePageData } from '@/lib/cms/repositories/home';
import { buildMetadata } from '@/lib/metadata';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { faqSchema } from '@/lib/seo/schemas';
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getHomePageData();
  return buildMetadata({
    seo,
    title: 'Agrico — Agriculture Degrees, Universities & Admission Guidance',
    description: 'Explore agriculture and agricultural engineering degrees, compare universities and practical learning, and get personalised admission guidance.',
    path: '/',
  });
}
export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const [data, params] = await Promise.all([getRsHomeData().catch(() => null), searchParams]);
  const query = typeof params.q === 'string' ? params.q : '';
  return (
    <>
      <JsonLdGraph items={[faqSchema(FAQS)]} />
      <AgricoHome data={data} initialQuery={query} />
    </>
  );
}
