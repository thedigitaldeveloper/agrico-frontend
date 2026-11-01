import { permanentRedirect } from 'next/navigation';

export default async function ProgramSectionPage({
  params,
}: PageProps<'/program/[slug]/[section]'>) {
  const { slug, section } = await params;
  permanentRedirect(`/${slug}/${section}`);
}
