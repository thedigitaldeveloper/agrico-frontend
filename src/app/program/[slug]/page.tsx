import { permanentRedirect } from 'next/navigation';

export default async function ProgramPage({ params }: PageProps<'/program/[slug]'>) {
  const { slug } = await params;
  permanentRedirect(`/${slug}`);
}
