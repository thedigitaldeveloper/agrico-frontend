import { AgricoUniversityDetail } from '@/components/agrico/detail-pages';
import { cmsUniversityModel } from '@/components/agrico/detail-models';
import type { ContentSection } from '@/lib/cms/repositories/content';
import type { ProgramCard } from '@/lib/cms/repositories/program';
import type { UniversityCard, UniversityDetail } from '@/lib/cms/repositories/university';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema, customSchema, universitySchema } from '@/lib/seo/schemas';

export function UniversityDetailView({ university, section, activeSlug, related, programs }: {
  university: UniversityDetail; section: ContentSection | null; activeSlug: string | null; related: UniversityCard[]; programs: ProgramCard[];
}) {
  const model = cmsUniversityModel(university, section, university.show_similar_universities ? related : [], programs, activeSlug);
  return <><JsonLdGraph items={[universitySchema(university), breadcrumbSchema([{ name: 'Home', path: '/' }, { name: university.name, path: '/university/' + university.slug }]), customSchema(section?.seo ?? university.seo)]} /><AgricoUniversityDetail model={model} /></>;
}
