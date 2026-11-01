import Image from 'next/image';

import { PostCard } from '@/components/blog/post-card';
import { RichText } from '@/components/cms/rich-text';
import { formatDate } from '@/components/exam/exam-card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { CardGrid } from '@/components/ui/card-grid';
import { FactCard } from '@/components/ui/fact-card';
import { Section } from '@/components/ui/section';
import { resolveImage } from '@/lib/cms/media';
import type { BlogCard, BlogDetail, BlogSection } from '@/lib/cms/repositories/blog';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { articleSchema, breadcrumbSchema, customSchema } from '@/lib/seo/schemas';

const SECTION_LABEL: Record<BlogSection, string> = {
  articles: 'Resources',
  news: 'News',
  blogs: 'Blogs',
};

export function PostDetailView({
  post,
  section,
  related,
}: {
  post: BlogDetail;
  section: BlogSection;
  related: BlogCard[];
}) {
  const hero = resolveImage(post.image ?? post.thumbnail, post.name);
  const published = formatDate(post.dateTime ?? post.createdAt);
  const tags = [...post.tags, ...post.streams, ...post.courses];
  const trail = [
    { name: 'Home', path: '/' },
    { name: SECTION_LABEL[section], path: `/${section}` },
    { name: post.name, path: `/${section}/${post.slug}` },
  ];

  return (
    <>
      <JsonLdGraph
        items={[
          articleSchema(post, section),
          breadcrumbSchema(trail),
          customSchema(post.seo),
        ]}
      />
      <div className="container-page py-8 lg:py-16">
        <Breadcrumbs items={trail} tone="page" className="mb-6" />

        <article className="mx-auto min-w-0 max-w-3xl [overflow-wrap:anywhere]">
          <header>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="brand">{section === 'news' ? (post.type === 'Press release' ? 'Press release' : 'News') : section === 'articles' ? 'Guide' : 'Blog'}</Badge>
              {published ? (
                <time dateTime={post.dateTime ?? post.createdAt} className="text-sm text-ink-500">
                  {published}
                </time>
              ) : null}
            </div>

            <h1 className="mt-5 font-display text-3xl leading-tight font-medium text-balance text-brand-800 sm:text-4xl lg:text-5xl">
              {post.name}
            </h1>

            {post.description ? (
              <p className="mt-5 text-base leading-8 text-ink-700 sm:text-lg">{post.description}</p>
            ) : null}
          </header>

          {hero ? (
            <Image
              src={hero.src}
              alt={hero.alt}
              width={hero.width ?? 1200}
              height={hero.height ?? 675}
              preload
              sizes="(min-width: 1024px) 48rem, 100vw"
              className="mt-8 h-auto w-full rounded-card"
            />
          ) : null}

          <div className="mt-10 min-w-0 [&_p]:text-base [&_p]:leading-8">
            <RichText content={post.long_description} />
          </div>

          {/* The card carries its own border, so the rule this footer used to
              draw above itself would only stack a second one on top of it. */}
          {tags.length > 0 ? (
            <footer className="mt-10">
              <FactCard title="Topics" items={tags} />
            </footer>
          ) : null}
        </article>
      </div>

      {related.length > 0 ? (
        <Section title={section === 'news' ? 'More news & updates' : section === 'articles' ? 'Related reading' : 'Keep exploring the blog'} tone="raised">
          <CardGrid
            items={related}
            getKey={(item) => item.documentId}
            cols="wide"
            label="More like this"
            className="gap-6 lg:gap-8 [&>li]:min-w-0"
          >
            {(item) => <PostCard post={item} section={section} />}
          </CardGrid>
        </Section>
      ) : null}
    </>
  );
}
