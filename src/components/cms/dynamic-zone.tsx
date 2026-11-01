import Image from 'next/image';

import { RichText } from '@/components/cms/rich-text';
import type { BlocksContent } from '@/lib/cms/blocks';
import { resolveImage } from '@/lib/cms/media';
import type { DynamicZoneComponent, Media } from '@/lib/cms/types';

/**
 * Renders the dynamic zones used by the About and Contact pages.
 *
 * `__component` discriminates the union, and anything unrecognised is skipped
 * rather than thrown on — a component added in the CMS should degrade the page,
 * not break the route.
 */

interface AboutCard extends DynamicZoneComponent {
  __component: 'home.about-card';
  name: string | null;
  short_description: string | null;
  description: BlocksContent | null;
  image: Media | null;
}

interface VideoCard extends DynamicZoneComponent {
  __component: 'common.videocard';
  name: string | null;
  description: string | null;
  embedded_video_link: string | null;
}

interface ContactCards extends DynamicZoneComponent {
  __component: 'contact.rp-contact';
  cards: { id: number; name: string | null; description: string | null }[];
}

interface MapCard extends DynamicZoneComponent {
  __component: 'common.gmapcard';
  name: string | null;
  link: string | null;
  description: string | null;
}

interface SocialSection extends DynamicZoneComponent {
  __component: 'contact.social-section';
  helper_text: string | null;
  sociallinks: {
    name: string | null;
    socials: { id: number; name: string | null; link: string | null }[];
  } | null;
}

export function DynamicZone({ blocks }: { blocks: DynamicZoneComponent[] }) {
  if (!blocks?.length) return null;

  return (
    <div className="space-y-12">
      {blocks.map((block) => (
        <Block key={`${block.__component}-${block.id}`} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: DynamicZoneComponent }) {
  switch (block.__component) {
    case 'home.about-card': {
      const card = block as AboutCard;
      const image = resolveImage(card.image, card.name ?? '');
      return (
        <section className="grid items-start gap-8 lg:grid-cols-2">
          <div>
            {card.name ? (
              <h2 className="text-2xl font-bold text-ink-900 lg:text-3xl">{card.name}</h2>
            ) : null}
            {card.short_description ? (
              <p className="mt-3 text-lg leading-relaxed text-ink-600">
                {card.short_description}
              </p>
            ) : null}
            <div className="mt-5">
              <RichText content={card.description} />
            </div>
          </div>
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width ?? 800}
              height={image.height ?? 600}
              sizes="(min-width: 1024px) 32rem, 100vw"
              className="h-auto w-full rounded-card"
            />
          ) : null}
        </section>
      );
    }

    case 'common.videocard': {
      const card = block as VideoCard;
      if (!card.embedded_video_link) return null;
      return (
        <section>
          {card.name ? (
            <h2 className="mb-4 text-2xl font-bold text-ink-900 lg:text-3xl">{card.name}</h2>
          ) : null}
          <div className="aspect-video w-full overflow-hidden rounded-card bg-ink-900">
            <iframe
              src={card.embedded_video_link}
              title={card.name ?? 'Video'}
              // The CSP allows youtube-nocookie; loading lazily keeps the
              // player's payload off the critical path.
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              className="size-full border-0"
            />
          </div>
          {card.description ? (
            <p className="mt-3 text-sm text-ink-600">{card.description}</p>
          ) : null}
        </section>
      );
    }

    case 'contact.rp-contact': {
      const section = block as ContactCards;
      if (!section.cards?.length) return null;
      return (
        <section>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {section.cards.map((card) => (
              <li
                key={card.id}
                className="rounded-card border border-ink-200 bg-white p-5 shadow-card"
              >
                {card.name ? (
                  <h3 className="font-display text-sm font-bold tracking-wide text-ink-900 uppercase">
                    {card.name}
                  </h3>
                ) : null}
                {card.description ? (
                  <p className="mt-2 text-base text-ink-700">{card.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      );
    }

    case 'common.gmapcard': {
      const card = block as MapCard;
      if (!card.link) return null;
      return (
        <section>
          {card.name ? (
            <h2 className="mb-4 text-2xl font-bold text-ink-900 lg:text-3xl">{card.name}</h2>
          ) : null}
          <div className="aspect-16/9 w-full overflow-hidden rounded-card border border-ink-200">
            <iframe
              src={card.link}
              title={card.name ?? 'Map'}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="size-full border-0"
            />
          </div>
        </section>
      );
    }

    case 'contact.social-section': {
      const section = block as SocialSection;
      const links = section.sociallinks?.socials ?? [];
      if (links.length === 0) return null;
      return (
        <section>
          {section.helper_text ? (
            <p className="text-base text-ink-600">{section.helper_text}</p>
          ) : null}
          <ul className="mt-4 flex flex-wrap gap-2">
            {links
              .filter((link) => link.link)
              .map((link) => (
                <li key={link.id}>
                  <a
                    href={link.link ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-pill border border-ink-300 px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-800"
                  >
                    {link.name ?? 'Link'}
                  </a>
                </li>
              ))}
          </ul>
        </section>
      );
    }

    default:
      return null;
  }
}
