import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, CalendarDays } from 'lucide-react';
import { formatDate } from '@/components/exam/exam-card';
import { resolveThumbnail } from '@/lib/cms/media';
import { canonicalPostPath, type BlogCard as Post, type BlogSection } from '@/lib/cms/repositories/blog';

export function PostCard({ post, section }: { post: Post; section: BlogSection }) {
  const href = canonicalPostPath(post);
  const image = resolveThumbnail(post.thumbnail ?? post.image, 480, post.name);
  const published = formatDate(post.dateTime ?? post.createdAt);
  const label = section === 'news' ? (post.type === 'Press release' ? 'Press release' : 'News') : section === 'articles' ? 'Guide' : 'Blog';
  const action = section === 'news' ? 'Read update' : section === 'articles' ? 'Read guide' : 'Read blog';
  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white transition-colors hover:border-brand-400 focus-within:border-brand-800">
      <div className="relative aspect-16/10 w-full overflow-hidden bg-brand-50">
        {image ? (
          <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1280px) 390px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
        ) : (
          <div aria-hidden="true" className="flex size-full flex-col items-center justify-center gap-3 p-6 text-brand-800">
            <BookOpen className="size-10 stroke-[1.25]" />
            <span className="text-xs font-semibold tracking-[0.18em] uppercase">Agrico</span>
          </div>
        )}
        <span className="absolute top-4 left-4 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-800">{label}</span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {published ? (
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-ink-600">
            <CalendarDays aria-hidden="true" className="size-3.5 shrink-0" />
            <time dateTime={post.dateTime ?? post.createdAt ?? undefined}>{published}</time>
          </div>
        ) : null}
        <h3 className="font-display text-xl leading-snug font-medium break-words text-brand-800 sm:text-2xl">
          <Link href={href} className="outline-offset-4 before:absolute before:inset-0 focus-visible:outline-2 focus-visible:outline-brand-800">{post.name}</Link>
        </h3>
        {post.description ? <p className="mt-3 line-clamp-3 text-sm leading-7 break-words text-ink-700">{post.description}</p> : null}
        {post.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => <span key={tag.documentId} className="max-w-full rounded-md bg-brand-50 px-2.5 py-1 text-xs break-words text-ink-700">{tag.name}</span>)}
          </div>
        ) : null}
        <div className="mt-auto pt-5">
          <span className="flex min-h-11 items-center justify-between gap-4 border-t border-ink-200 pt-4 text-sm font-semibold text-brand-800">
            {action}<ArrowRight aria-hidden="true" className="size-4 shrink-0" />
          </span>
        </div>
      </div>
    </article>
  );
}
