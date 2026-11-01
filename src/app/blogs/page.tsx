import { AgricoPublicationIndex } from '@/components/agrico/publication-index';
import type { SearchParams } from '@/components/ui/pagination';
import { buildMetadata } from '@/lib/metadata';
export const metadata = buildMetadata({title:'Agriculture Student Planning', description:'Programme, admission and decision guidance for agriculture students.', path:'/blogs'});
export default async function Page({searchParams}:{searchParams:Promise<SearchParams>}) { return <AgricoPublicationIndex kind="blogs" searchParams={await searchParams}/>; }
