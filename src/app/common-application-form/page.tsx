import type { Metadata } from 'next';
import { CommonApplicationForm, type AvailableProgram, type AvailableUniversity } from '@/components/forms/common-application-form';
import { getProgramBySlug, listAllPrograms } from '@/lib/cms/repositories/program';
import { getUniversityBySlug, listUniversities } from '@/lib/cms/repositories/university';
import { durationLabel } from '@/components/program/program-facts';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({ title: 'Common Application Form', description: 'Send an admission enquiry for a university or program.', path: '/common-application-form' });

export default async function ApplicationFormPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const universitySlug = typeof params.university === 'string' ? params.university : undefined;
  const programSlug = typeof params.program === 'string' ? params.program : undefined;
  const [university, program, universityResult, programs] = await Promise.all([
    universitySlug ? getUniversityBySlug(universitySlug) : null,
    programSlug ? getProgramBySlug(programSlug) : null,
    listUniversities({ pageSize: 100 }), listAllPrograms(),
  ]);
  const availableUniversities: AvailableUniversity[] = universityResult.universities.map((item) => ({
    id: item.documentId, name: item.name, shortName: item.name, slug: item.slug,
    naac: item.approvals.find((approval) => /naac/i.test(approval.name))?.name ?? '',
    nirf: item.rankings[0]?.name,
    ugcApproved: item.approvals.some((approval) => /ugc/i.test(approval.name)),
  }));
  const availablePrograms: AvailableProgram[] = programs.map((item) => ({
    id: item.documentId, name: item.full_name || item.name, shortName: item.name, slug: item.slug,
    stream: item.stream?.name ?? '', level: item.course?.level?.name ?? '',
    duration: durationLabel(item) ?? '', specializations: [], popular: item.tag?.slug === 'popular',
  }));
  const context = university?.name ?? program?.name;
  return (
    <div className="bg-ink-50/40 py-10 lg:py-16">
      <div className="container-page max-w-5xl">
        <h1 className="mb-4 font-display text-3xl font-bold">{context ? 'Apply for ' + context : 'Common Application Form'}</h1>
        <p className="mb-8 text-ink-600">Select your program and university, then share your contact details for admission guidance.</p>
        <CommonApplicationForm initialUniversitySlug={university?.slug} initialProgramSlug={program?.slug} universitiesList={availableUniversities} programsList={availablePrograms} />
      </div>
    </div>
  );
}
