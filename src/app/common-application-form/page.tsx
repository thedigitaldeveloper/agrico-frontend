import type { Metadata } from 'next';
import { CommonApplicationForm, type AvailableProgram, type AvailableUniversity } from '@/components/forms/common-application-form';
import { getProgramBySlug, listAllPrograms } from '@/lib/cms/repositories/program';
import { getUniversityBySlug, listUniversities } from '@/lib/cms/repositories/university';
import { durationLabel } from '@/components/program/program-facts';
import { buildMetadata } from '@/lib/metadata';
import { getProgrammeContent, listProgrammeContent } from '@/lib/agrico/programme-content';
import { getPublicationUniversity, publicationUniversities } from '@/lib/agrico/publication';
import { getUniversityGuide, UNIVERSITY_GUIDES } from '@/components/agrico/detail-catalogue';

export const metadata: Metadata = buildMetadata({
  title: 'Common Application Form — Agriculture & Allied Degrees',
  description:
    'Send a unified admission enquiry for ICAR-aligned agriculture, engineering, horticulture, veterinary, forestry and agribusiness degrees across accredited universities.',
  path: '/common-application-form',
});

export default async function ApplicationFormPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const universitySlug = typeof params.university === 'string' ? params.university : undefined;
  const programSlug = typeof params.program === 'string' ? params.program : undefined;

  const [university, program, universityResult, programs] = await Promise.all([
    universitySlug ? getUniversityBySlug(universitySlug) : null,
    programSlug ? getProgramBySlug(programSlug) : null,
    listUniversities({ pageSize: 100 }),
    listAllPrograms(),
  ]);

  const cmsUniversities: AvailableUniversity[] = universityResult.universities.map((item) => ({
    id: item.documentId,
    name: item.name,
    shortName: item.name,
    slug: item.slug,
    naac: item.approvals.find((approval) => /naac|icar/i.test(approval.name))?.name ?? 'ICAR / UGC',
    nirf: item.rankings[0]?.name,
    ugcApproved: true,
  }));

  const fallbackUniversities: AvailableUniversity[] = [
    ...UNIVERSITY_GUIDES.map((g) => ({
      id: `guide-${g.slug}`,
      name: g.name,
      shortName: g.mark,
      slug: g.slug,
      naac: 'ICAR Accredited',
      ugcApproved: true,
    })),
    ...publicationUniversities.map((u) => ({
      id: `pub-${u.slug}`,
      name: u.name || u.title,
      shortName: u.name || u.title,
      slug: u.slug,
      naac: u.identity?.ownership || 'ICAR / UGC',
      ugcApproved: true,
    })),
  ];

  const availableUniversities: AvailableUniversity[] = [
    ...new Map(
      [...cmsUniversities, ...fallbackUniversities].map((item) => [item.slug, item])
    ).values(),
  ];

  const localProgrammes = listProgrammeContent();
  const cmsPrograms: AvailableProgram[] = programs.map((item) => {
    const localMatch = localProgrammes.find((lp) => lp.slug === item.slug);
    return {
      id: item.documentId,
      name: item.full_name || item.name,
      shortName: localMatch?.short_name || item.name,
      slug: item.slug,
      stream: item.stream?.name || localMatch?.discipline || 'Agriculture & Allied Sciences',
      level: item.course?.level?.name || localMatch?.level || 'Undergraduate',
      duration: durationLabel(item) || localMatch?.duration || '4 Years',
      specializations: localMatch?.curriculum?.specialisations ?? [],
      popular: item.tag?.slug === 'popular' || Boolean(localMatch),
    };
  });

  const fallbackPrograms: AvailableProgram[] = localProgrammes.map((lp) => ({
    id: `local-${lp.slug}`,
    name: lp.name,
    shortName: lp.short_name || lp.name,
    slug: lp.slug,
    stream: lp.discipline || 'Agriculture & Allied Sciences',
    level: lp.level,
    duration: lp.duration || '4 Years',
    specializations: lp.curriculum?.specialisations ?? [],
    popular: ['bsc-agriculture', 'btech-agricultural-engineering', 'bsc-horticulture', 'mba-agribusiness'].includes(
      lp.slug
    ),
  }));

  const availablePrograms: AvailableProgram[] = [
    ...new Map([...cmsPrograms, ...fallbackPrograms].map((item) => [item.slug, item])).values(),
  ];

  const resolvedUniversityName =
    university?.name ??
    (universitySlug
      ? getPublicationUniversity(universitySlug)?.name ||
        getUniversityGuide(universitySlug)?.name
      : undefined);

  const resolvedProgramName =
    program?.name ?? (programSlug ? getProgrammeContent(programSlug)?.name : undefined);

  const context = resolvedUniversityName ?? resolvedProgramName;

  return (
    <div className="bg-ink-50/40 py-10 lg:py-16">
      <div className="container-page max-w-5xl">
        <h1 className="mb-4 font-display text-3xl font-bold">
          {context ? 'Apply for ' + context : 'Common Application Form'}
        </h1>
        <p className="mb-8 text-ink-600">
          Select your agriculture or allied science programme and preferred university, then share your contact details for personalised admission guidance.
        </p>
        <CommonApplicationForm
          initialUniversitySlug={university?.slug ?? universitySlug}
          initialProgramSlug={program?.slug ?? programSlug}
          universitiesList={availableUniversities}
          programsList={availablePrograms}
        />
      </div>
    </div>
  );
}
