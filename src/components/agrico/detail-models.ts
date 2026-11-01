import { blocksToText, type BlocksContent } from '@/lib/cms/blocks';
import { mediaUrl, resolveImage } from '@/lib/cms/media';
import type { ContentSection } from '@/lib/cms/repositories/content';
import type { ProgramCard, ProgramDetail } from '@/lib/cms/repositories/program';
import type { ContentSectionRef, UniversityCard, UniversityDetail } from '@/lib/cms/repositories/university';
import { durationLabel, offeringFee, offeringFeeSpread, offeringsByUniversity } from '@/components/program/program-facts';
import { PROGRAMMES, type AgricultureProgramme } from './home-data';
import { programmeGuidePath, UNIVERSITY_GUIDES, type UniversityGuide } from './detail-catalogue';
import type { ProgrammeContent, ProgrammeUniversity } from '@/lib/agrico/programme-content';

export interface DetailListing {
  name: string; href: string; description: string; level?: string; duration?: string;
  fee?: number | null; feeNote?: string | null; mark?: string; logo?: string | null;
}
export interface DetailContext { programName?: string; universityName?: string; programSlug?: string; universitySlug?: string; }
export interface ProgrammeModel {
  name: string; slug: string; path: string; description: string; richDescription?: BlocksContent | null;
  level: string; duration: string; mode: string; focus: string; subjects: string; careers: string;
  topics: AgricultureProgramme['topics']; fee: number | null; feeNote?: string | null; feeLabel?: string;
  highlights?: { key: string; value: string }[]; averagePackage?: string | null;
  eligibility: string[]; exams: { name: string; href: string }[];
  resources: { name: string; href: string }[]; source?: string;
  universities: DetailListing[]; related: DetailListing[];
  section: ContentSection | null; sections: ContentSectionRef[]; activeSlug?: string | null;
  context: DetailContext; universityPath?: string; offeredAt?: string; offering?: boolean;
  /** Researched programme content (docs/content/programmes-2026-11-01); enables the richer sections. */
  content?: ProgrammeContent;
}
export interface UniversityModel {
  name: string; slug: string; mark: string; city: string; state: string; ownership: string;
  description: string; image?: { src: string; alt: string } | null; logo?: string | null;
  established?: string | null; address?: string | null; approvals: string[];
  affiliations?: string[]; rankings?: string[];
  highlights: { key: string; value: string }[]; resources: { name: string; href: string }[];
  programmes: DetailListing[]; related: DetailListing[]; context: DetailContext;
  section: ContentSection | null; sections: ContentSectionRef[]; activeSlug?: string | null;
  faculties?: UniversityDetail['faculties']; recruiters?: UniversityDetail['recruiters'];
  source?: string; admissions?: string; editorial?: boolean;
}

export function feeText(value?: number | null) {
  return value !== null && value !== undefined && Number.isFinite(Number(value)) && Number(value) >= 0
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value)) : 'Request current fees';
}
const initials = (name: string) => name.split(/\s+/).filter(word => !/^(of|the|and)$/i.test(word)).slice(0, 3).map(word => word[0]).join('');
export const programmeListing = (p: ProgramCard): DetailListing => ({ name: p.full_name || p.name, href: '/' + p.slug, description: p.course?.name || p.stream?.name || 'Explore programme details and admission requirements.', level: p.course?.level?.name, duration: durationLabel(p), fee: p.fee });
export const universityListing = (u: UniversityCard): DetailListing => ({ name: u.name, href: '/university/' + u.slug, description: [u.city, u.state].filter(Boolean).join(', '), mark: initials(u.name), logo: mediaUrl((u.card_logo || u.logo)?.url) });

export function guideProgrammeModel(guide: AgricultureProgramme): ProgrammeModel {
  const path = programmeGuidePath(guide.id);
  return {
    name: guide.name, slug: path.slice(1), path, description: guide.description,
    level: guide.level, duration: guide.duration, mode: 'Campus learning', focus: guide.focus,
    subjects: guide.subjects, careers: guide.careers, topics: guide.topics, fee: null,
    eligibility: [guide.level === 'Undergraduate' ? 'Check the university’s current Class 12 subject and academic requirements.' : guide.level === 'Postgraduate' ? 'Confirm the qualifying degree, subjects and academic requirements with the university.' : 'Check the institute’s entry qualification and progression requirements.', 'Read the admission notice for the accepted examination or application route.', 'Confirm the requirements for your chosen campus and programme.'],
    exams: [], resources: [{ name: 'Official academic information', href: guide.source }], source: guide.source,
    universities: UNIVERSITY_GUIDES.filter(u => u.programmeIds.includes(guide.id)).map(u => ({ name: u.name, href: '/university/' + u.slug, description: u.city + ', ' + u.state, mark: u.mark })),
    related: PROGRAMMES.filter(p => p.id !== guide.id).slice(0, 3).map(p => ({ name: p.name, href: programmeGuidePath(p.id), description: p.focus, level: p.level, duration: p.duration })),
    context: { programName: guide.name }, section: null, sections: [],
  };
}

const ART_CYCLE = [6, 1, 3, 4, 2, 0, 7, 8];
const firstSentence = (text?: string) => {
  if (!text) return '';
  const sentences = text.split(/(?<=\.)\s+/);
  if (sentences[0] && sentences[0].length < 45 && sentences[1]) {
    return `${sentences[0]} ${sentences[1]}`;
  }
  return sentences[0] || '';
};

/**
 * Builds a programme page from researched content. The editorial guide (when the
 * slug is one of the six homepage programmes) only fills gaps the research left.
 */
export function contentProgrammeModel(content: ProgrammeContent, universities: ProgrammeUniversity[], related: ProgrammeContent[], guide?: AgricultureProgramme): ProgrammeModel {
  const path = '/' + content.slug;
  const structure = content.curriculum?.structure || [];
  const topics = structure.length
    ? structure.slice(0, 6).map((stage, index) => ({ title: stage.stage, description: stage.focus || (stage.courses || []).slice(0, 4).join(', '), art: ART_CYCLE[index % ART_CYCLE.length] }))
    : guide?.topics || [];
  const officialSource = content.sources?.find(source => source.kind === 'regulator' || source.kind === 'official');
  return {
    name: content.name, slug: content.slug, path,
    description: content.hero?.summary || guide?.description || content.overview?.paragraphs?.[0] || '',
    level: content.level, duration: content.duration || guide?.duration || '', mode: content.mode || 'Campus learning',
    focus: content.discipline || guide?.focus || '',
    subjects: guide?.subjects || (content.curriculum?.specialisations || []).slice(0, 3).join(', ') || firstSentence(content.curriculum?.intro),
    careers: guide?.careers || (content.careers?.sectors || []).slice(0, 3).join(', ') || 'Programme-specific career pathways',
    topics, fee: null,
    feeLabel: 'Varies by university',
    feeNote: content.fees?.summary ? firstSentence(content.fees.summary) : null,
    highlights: (content.overview?.highlights || []).filter(item => item.label && item.value).map(item => ({ key: item.label, value: item.value })),
    eligibility: content.eligibility?.points || [],
    exams: [],
    resources: officialSource ? [{ name: officialSource.title, href: officialSource.url }] : guide ? [{ name: 'Official academic information', href: guide.source }] : [],
    source: officialSource?.url || guide?.source,
    universities: universities.map(u => ({ name: u.name, href: '/university/' + u.slug, description: [u.city, u.state].filter(Boolean).join(', '), logo: u.logo, mark: initials(u.name) })),
    related: related.map(item => ({ name: item.name, href: '/' + item.slug, description: item.discipline || '', level: item.level, duration: item.duration || undefined })),
    context: { programName: content.name }, section: null, sections: [], content,
  };
}

export function cmsProgrammeModel(program: ProgramDetail, section: ContentSection | null, related: ProgramCard[], activeSlug?: string | null, researched?: ProgrammeContent | null): ProgrammeModel {
  const name = program.full_name || researched?.name || (program.course ? program.course.name + ' in ' + program.name : program.name);
  const text = (name + ' ' + program.stream?.name).toLowerCase();
  const guide = PROGRAMMES.find(p => text.includes(p.id === 'engineering' ? 'agricultural engineering' : p.id === 'agriculture' ? 'agriculture' : p.id));
  const fees = offeringsByUniversity(program.program_offerings);
  const spread = offeringFeeSpread(program.program_offerings);
  const cmsResources = [{ name: 'Programme brochure', href: mediaUrl(program.brochure?.url) }, { name: 'Programme syllabus', href: mediaUrl(program.syllabus?.url) }].filter((r): r is { name: string; href: string } => !!r.href);
  const researchedResources = (researched?.sources || []).slice(0, 4).map(s => ({ name: s.title, href: s.url }));
  return {
    name, slug: program.slug, path: '/' + program.slug,
    description: blocksToText(program.short_description) || researched?.hero?.summary || 'Explore the curriculum, entry requirements, university options and practical learning behind this programme.',
    richDescription: program.short_description,
    level: program.course?.level?.name || researched?.level || 'Undergraduate',
    duration: durationLabel(program) || researched?.duration || '4 years (8 semesters)',
    mode: program.course_mode?.name || researched?.mode || 'Full-time, campus-based',
    focus: researched?.discipline || guide?.focus || program.stream?.name || 'Agricultural Sciences',
    subjects: guide?.subjects || 'University-specific curriculum',
    careers: guide?.careers || 'Programme-specific career pathways',
    topics: guide?.topics || [{ title: 'Your curriculum', description: 'Explore the subjects and areas covered by the programme.', art: 3 }, { title: 'Practical learning', description: 'Ask about laboratories, projects and field learning.', art: 4 }, { title: 'Your next step', description: 'Connect your study interests with future opportunities.', art: 8 }],
    fee: program.fee,
    feeLabel: spread?.label || (program.fee ? undefined : '₹15,000 – ₹1.8L / yr'),
    feeNote: spread ? 'Published fees across ' + spread.count + ' universities. Confirm the fee period and included charges with your chosen university.' : (researched?.fees?.summary ? firstSentence(researched.fees.summary) : 'Government SAUs charge subsidised semester tuition; private universities set independent fee schedules.'),
    averagePackage: program.average_package,
    highlights: (program.highlights || []).filter((h): h is typeof h & { key: string; value: string } => !!h.key && !!h.value),
    eligibility: (program.eligibilities || []).map(e => e.name), exams: (program.exams || []).map(e => ({ name: e.name, href: '/exams/' + e.slug })),
    resources: cmsResources.length ? cmsResources : researchedResources,
    universities: (program.universities || []).map(u => ({ ...universityListing(u), fee: offeringFee(fees.get(u.slug)) ?? u.program_fees?.find(f => f.program?.slug === program.slug)?.fee ?? null })),
    related: related.map(programmeListing), context: { programName: name, programSlug: program.slug }, section, sections: program.university_contents || [], activeSlug,
  };
}

export function guideUniversityModel(guide: UniversityGuide): UniversityModel {
  return {
    ...guide, approvals: [], highlights: [], resources: [{ name: 'Official university website', href: guide.source }, { name: 'Official admission information', href: guide.admissions }],
    programmes: PROGRAMMES.filter(p => guide.programmeIds.includes(p.id)).map(p => ({ name: p.name, href: programmeGuidePath(p.id), description: p.focus, level: p.level, duration: p.duration })),
    related: UNIVERSITY_GUIDES.filter(u => u.slug !== guide.slug).slice(0, 3).map(u => ({ name: u.name, href: '/university/' + u.slug, description: u.city + ', ' + u.state, mark: u.mark })),
    context: { universityName: guide.name }, section: null, sections: [], editorial: true,
  };
}

export function cmsUniversityModel(university: UniversityDetail, section: ContentSection | null, related: UniversityCard[], programs: ProgramCard[], activeSlug?: string | null): UniversityModel {
  const feeRows = new Map((university.program_fees || []).filter(row => row.program).map(row => [row.program!.slug, row]));
  return {
    name: university.name, slug: university.slug, mark: initials(university.name), city: university.city || '', state: university.state || '', ownership: university.ownership_type?.name || '',
    description: 'Explore programmes, practical learning and admission information at ' + university.name + '. Build a shortlist around what you want to study and how you want to learn.',
    image: resolveImage(university.image, university.name + ' campus'), logo: mediaUrl((university.card_logo || university.logo)?.url),
    established: university.establish || (university.established_year ? String(university.established_year) : null), address: university.address,
    approvals: (university.approvals || []).map(a => a.name), affiliations: (university.affiliations || []).map(a => a.name), rankings: (university.rankings || []).map(a => a.name),
    highlights: (university.highlights || []).filter((h): h is typeof h & { key: string; value: string } => !!h.key && !!h.value),
    resources: university.brochure ? [{ name: 'University brochure', href: mediaUrl(university.brochure.url)! }] : [],
    programmes: programs.map(p => ({ ...programmeListing(p), href: '/offering/' + university.slug + '/' + p.slug, fee: feeRows.get(p.slug)?.fee ?? null, feeNote: feeRows.get(p.slug)?.note })),
    related: related.map(universityListing), faculties: university.faculties, recruiters: university.recruiters,
    context: { universityName: university.name, universitySlug: university.slug }, section, sections: university.university_contents || [], activeSlug,
  };
}
