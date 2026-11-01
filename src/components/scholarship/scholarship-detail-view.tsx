import Image from 'next/image';

import { SectionBody } from '@/components/cms/section-body';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ButtonLink } from '@/components/ui/button';
import { SectionNav } from '@/components/university/section-nav';
import { resolveThumbnail } from '@/lib/cms/media';
import type { ContentSection } from '@/lib/cms/repositories/content';
import type { ScholarshipDetail } from '@/lib/cms/repositories/scholarship';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema, customSchema, scholarshipSchema } from '@/lib/seo/schemas';

export function ScholarshipDetailView({
  scholarship,
  section,
  activeSlug,
}: {
  scholarship: ScholarshipDetail;
  section: ContentSection | null;
  activeSlug: string | null;
}) {
  const heading = section?.heading || section?.display_name || section?.name;
  const logo = resolveThumbnail(scholarship.logo, 128, scholarship.name);
  const location = [scholarship.city, scholarship.state].filter(Boolean).join(', ');

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Scholarships', path: '/scholarships' },
    { name: scholarship.name, path: `/scholarship/${scholarship.slug}` },
  ];

  return (
    <>
      <JsonLdGraph
        items={[
          scholarshipSchema(scholarship),
          breadcrumbSchema(trail),
          customSchema(section?.seo ?? scholarship.seo),
        ]}
      />
      <section className="surface-inverse bg-brand-900 text-white">
        <div className="container-page py-8 lg:py-12">
          <Breadcrumbs items={trail} tone="hero" className="mb-6" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-5">
              {logo ? (
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-card bg-white p-2">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.width ?? 80}
                    height={logo.height ?? 80}
                    className="size-full object-contain"
                    priority
                  />
                </div>
              ) : null}

              <div className="min-w-0">
                <h1 className="font-display text-2xl leading-tight font-extrabold text-balance lg:text-4xl">
                  {scholarship.name}
                </h1>
                {scholarship.full_name && scholarship.full_name !== scholarship.name ? (
                  <p className="mt-1.5 text-white/70">{scholarship.full_name}</p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
                  {location ? <span>{location}</span> : null}
                  {scholarship.establish ? (
                    <span>Established {scholarship.establish.slice(0, 4)}</span>
                  ) : null}
                  {scholarship.rating ? (
                    <span className="inline-flex items-center gap-1 text-gold-300">
                      <StarIcon />
                      {scholarship.rating}/5
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {scholarship.show_apply_button ? (
              <ButtonLink
                href={`/common-application-form?scholarship=${scholarship.slug}`}
                variant="accent"
                size="lg"
                className="shrink-0"
              >
                {scholarship.apply_button_text || 'Apply Now'}
              </ButtonLink>
            ) : null}
          </div>

          {/* No fact strip here, unlike the university, program and exam heroes:
              a scheme carries no schedule or highlight data, so the strip could
              only restate the meta line directly above it. */}
        </div>
      </section>

      <SectionNav
        basePath={`/scholarship/${scholarship.slug}`}
        sections={scholarship.university_contents}
        activeSlug={activeSlug}
      />

      <div className="container-page py-10 lg:py-14">
        <article className="min-w-0 max-w-4xl">
          <SectionBody section={section} heading={heading} />
        </article>
      </div>
    </>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden="true">
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
    </svg>
  );
}
