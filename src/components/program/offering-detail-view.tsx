import { AgricoProgrammeDetail } from '@/components/agrico/detail-pages';
import { cmsProgrammeModel, universityListing } from '@/components/agrico/detail-models';
import type { ContentSection } from '@/lib/cms/repositories/content';
import type { ProgramDetail } from '@/lib/cms/repositories/program';
import type { UniversityDetail } from '@/lib/cms/repositories/university';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema, customSchema } from '@/lib/seo/schemas';
import { mediaUrl } from '@/lib/cms/media';

type FeeRow = NonNullable<UniversityDetail['program_fees']>[number];
export function OfferingDetailView({ program, university, fee, section }: {
  program: ProgramDetail; university: UniversityDetail; fee?: FeeRow; section: ContentSection | null;
}) {
  const model = cmsProgrammeModel(program, section, [], section?.secondary_slug || section?.slug);
  model.path = '/offering/' + encodeURIComponent(university.slug) + '/' + encodeURIComponent(program.slug);
  model.offering = true;
  model.offeredAt = university.name;
  model.universityPath = '/university/' + university.slug;
  model.fee = fee?.fee ?? null;
  model.feeLabel = undefined;
  model.feeNote = fee?.note;
  model.context = { programName: model.name, programSlug: program.slug, universityName: university.name, universitySlug: university.slug };
  model.universities = [universityListing(university)];
  if (university.brochure?.url) model.resources.push({ name: 'University brochure', href: mediaUrl(university.brochure.url)! });
  return <><JsonLdGraph items={[breadcrumbSchema([{ name: 'Home', path: '/' }, { name: university.name, path: model.universityPath }, { name: model.name, path: model.path }]), customSchema(section?.seo ?? program.seo)]} /><AgricoProgrammeDetail model={model} /></>;
}
