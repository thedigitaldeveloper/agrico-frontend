import { notFound } from 'next/navigation';
import { getProgramBySlug } from '@/lib/cms/repositories/program';
import { getUniversityBySlug } from '@/lib/cms/repositories/university';
import { getContentSection, getFirstContentSection } from '@/lib/cms/repositories/content';
import { OfferingDetailView } from '@/components/program/offering-detail-view';
import { buildMetadata } from '@/lib/metadata';

type Params = { university: string; program: string };
type SearchParams = { section?: string | string[] };

async function offering(params: Params) {
  const [program, university] = await Promise.all([
    getProgramBySlug(params.program),
    getUniversityBySlug(params.university),
  ]);
  if (!program || !university || !program.universities.some(item => item.slug === university.slug)) notFound();
  const fee = university.program_fees?.find(item => item.program?.slug === program.slug);
  return { program, university, fee };
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const route = await params;
  const { program, university } = await offering(route);
  return buildMetadata({
    title: program.name + ' at ' + university.name,
    path: '/offering/' + encodeURIComponent(university.slug) + '/' + encodeURIComponent(program.slug),
    description: 'Explore programme details and request current admission information from Agrico.',
  });
}

export default async function OfferingPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const [route, search] = await Promise.all([params, searchParams]);
  const { program, university, fee } = await offering(route);
  const sectionSlug = Array.isArray(search.section) ? search.section[0] : search.section;
  const section = sectionSlug
    ? await getContentSection('program', program.slug, sectionSlug)
    : await getFirstContentSection('program', program.slug);
  if (sectionSlug && !section) notFound();
  return <OfferingDetailView program={program} university={university} fee={fee} section={section} />;
}
