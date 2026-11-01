import { EditorialRoute, editorialMetadata, editorialStaticParams } from '@/components/agrico/editorial-route';
const SECTION = 'blogs' as const;
export const generateStaticParams = () => editorialStaticParams(SECTION);
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { return editorialMetadata(SECTION, params); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { return <EditorialRoute section={SECTION} params={params} />; }
