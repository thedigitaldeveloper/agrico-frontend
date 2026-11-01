import { AgricoPublicationIndex } from '@/components/agrico/publication-index';
import type { SearchParams } from '@/components/ui/pagination';
import { buildMetadata } from '@/lib/metadata';
export const metadata = buildMetadata({title:'Agriculture News', description:'Programme, admission and decision guidance for agriculture students.', path:'/news'});
export default async function Page({searchParams}:{searchParams:Promise<SearchParams>}) { return <AgricoPublicationIndex kind="news" searchParams={await searchParams}/>; }
