import { AgricoPublicationIndex } from '@/components/agrico/publication-index';
import type { SearchParams } from '@/components/ui/pagination';
import { buildMetadata } from '@/lib/metadata';
export const metadata = buildMetadata({title:'Agriculture Guides', description:'Programme, admission and decision guidance for agriculture students.', path:'/articles'});
export default async function Page({searchParams}:{searchParams:Promise<SearchParams>}) { return <AgricoPublicationIndex kind="articles" searchParams={await searchParams}/>; }
