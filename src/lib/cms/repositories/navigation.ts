import { cmsFetchOptional } from '../client';
import { listTaxonomy } from './taxonomy';
import { listCourses } from './course';
import { listAllPrograms } from './program';
import { listUniversities, type UniversityCard } from './university';
import { listScholarships } from './scholarship';
import { buildMultiLevelNavData, type DegreeGroup, type MultiLevelNavigationData, type OfferingUniversityRef, type StreamMenuTier } from '@/components/layout/nav-menus';
import { formatFee } from '@/lib/format';

function universityRef(university: UniversityCard): OfferingUniversityRef {
  return {
    name: university.name,
    slug: university.slug,
    naacGrade: university.approvals.find((approval) => /naac/i.test(approval.name))?.name,
  };
}

/** Menu entries are built exclusively from published catalogue records. */
export async function getDynamicMegaMenuData(): Promise<MultiLevelNavigationData> {
  return cmsFetchOptional<MultiLevelNavigationData>(async () => {
    const [streams, courses, programs, universityResult, scholarshipResult] = await Promise.all([
      listTaxonomy('streams'), listCourses(100), listAllPrograms(),
      listUniversities({ pageSize: 100 }), listScholarships({ pageSize: 20 }),
    ]);
    const universities = universityResult.universities;
    const programStreams: StreamMenuTier[] = [];
    for (const stream of streams) {
      const groups = new Map<string, DegreeGroup>();
      for (const course of courses.filter((item) => item.stream?.slug === stream.slug)) {
        groups.set(course.slug, { degreeName: course.name, degreeSlug: course.slug, level: course.level?.name ?? '', specializations: [] });
      }
      for (const program of programs.filter((item) => item.stream?.slug === stream.slug)) {
        const slug = program.course?.slug ?? program.slug;
        const group = groups.get(slug) ?? { degreeName: program.course?.name ?? program.name, degreeSlug: slug, level: program.course?.level?.name ?? '', specializations: [] };
        group.specializations.push({ name: program.name, slug: program.slug, startingEmi: formatFee(program.fee) ?? undefined, isHot: program.tag?.slug === 'popular', isNew: program.tag?.slug === 'new' });
        groups.set(slug, group);
      }
      if (!groups.size) continue;
      programStreams.push({
        id: stream.slug, name: stream.name, slug: stream.slug, degrees: [...groups.values()],
        topUniversities: universities.filter((item) => item.streams.some((term) => term.slug === stream.slug)).slice(0, 4).map(universityRef),
        quickTools: { compareLabel: 'Compare universities', compareHref: '/compare', emiLabel: 'Browse programs', emiHref: '/programs?stream=' + encodeURIComponent(stream.slug) },
      });
    }
    return {
      programStreams,
      universityCategories: universities.length ? [{ id: 'all', name: 'All Universities (' + universityResult.pagination.total + ')', description: '', universities: universities.map(universityRef) }] : [],
      admissions: {
        scholarships: scholarshipResult.scholarships.map((item) => ({ name: item.name, slug: item.slug, benefit: item.full_name ?? '' })),
        financing: [], directAdmission: [],
      },
      community: {
        counseling: [{ title: 'Admission mentors', subtitle: '', href: '/mentors' }, { title: 'Application form', subtitle: '', href: '/common-application-form' }],
        qna: [{ title: 'Questions and answers', subtitle: '', href: '/qna' }],
        guides: [{ title: 'Articles', subtitle: '', href: '/articles' }],
      },
    };
  }, buildMultiLevelNavData());
}
