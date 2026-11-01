import { AgricoProgrammeDetail } from '@/components/agrico/detail-pages';
import { cmsProgrammeModel } from '@/components/agrico/detail-models';
import type { ContentSection } from '@/lib/cms/repositories/content';
import type { ProgramCard, ProgramDetail } from '@/lib/cms/repositories/program';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema, customSchema, programSchema } from '@/lib/seo/schemas';

export function ProgramDetailView({ program, section, activeSlug, related }: {
  program: ProgramDetail; section: ContentSection | null; activeSlug: string | null; related: ProgramCard[];
}) {
  const model = cmsProgrammeModel(program, section, related, activeSlug);
  return <><JsonLdGraph items={[programSchema(program), breadcrumbSchema([{ name: 'Home', path: '/' }, { name: model.name, path: model.path }]), customSchema(section?.seo ?? program.seo)]} /><AgricoProgrammeDetail model={model} /></>;
}
