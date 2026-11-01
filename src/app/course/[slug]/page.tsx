import { permanentRedirect } from 'next/navigation';

export default async function CoursePage({ params }: PageProps<'/course/[slug]'>) {
  const { slug } = await params;
  permanentRedirect(`/${slug}`);
}
