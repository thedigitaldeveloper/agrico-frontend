import Image from 'next/image';
import { CheckCircle2, ExternalLink } from 'lucide-react';

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
      <section className="surface-inverse bg-[#10281E] text-white">
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
                  <p className="mt-1.5 text-white/75">{scholarship.full_name}</p>
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
        </div>
      </section>

      <SectionNav
        basePath={`/scholarship/${scholarship.slug}`}
        sections={scholarship.university_contents}
        activeSlug={activeSlug}
      />

      <div className="container-page py-10 lg:py-14">
        <article className="min-w-0 max-w-4xl space-y-8">
          {scholarship.summary && !section ? (
            <>
              <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
                {scholarship.benefit_amount ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                    <p className="text-2xs font-extrabold uppercase tracking-wider text-emerald-900">
                      Stipend / Financial Benefit
                    </p>
                    <p className="mt-1 font-display text-lg font-extrabold text-emerald-950">
                      {scholarship.benefit_amount}
                    </p>
                  </div>
                ) : null}

                <div>
                  <h2 className="font-display text-xl font-bold text-ink-950 mb-2.5">
                    About This Agriculture Scholarship Scheme
                  </h2>
                  <p className="text-base leading-relaxed text-ink-700">{scholarship.summary}</p>
                </div>

                {scholarship.eligibility_notes?.length ? (
                  <div className="pt-4 border-t border-ink-150">
                    <h3 className="font-display text-base font-bold text-ink-950 mb-3">
                      Key Eligibility &amp; Continuation Rules
                    </h3>
                    <ul className="space-y-2.5">
                      {scholarship.eligibility_notes.map((note) => (
                        <li key={note} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-700">
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-700 mt-0.5" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="pt-4 border-t border-ink-150 flex flex-wrap items-center gap-3">
                  <ButtonLink
                    href={`/common-application-form?scholarship=${scholarship.slug}`}
                    variant="primary"
                    size="sm"
                  >
                    Request Scholarship Guidance
                  </ButtonLink>
                  {scholarship.official_portal ? (
                    <a
                      href={scholarship.official_portal}
                      target={scholarship.official_portal.startsWith('http') ? '_blank' : undefined}
                      rel={scholarship.official_portal.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-700"
                    >
                      <span>Official Portal / Reference</span>
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>

              {scholarship.application_steps && scholarship.application_steps.length > 0 ? (
                <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-2xs space-y-4">
                  <h2 className="font-display text-xl font-bold text-ink-950">
                    Step-by-Step Scholarship Application &amp; Disbursement Process
                  </h2>
                  <ol className="space-y-4">
                    {scholarship.application_steps.map((step) => (
                      <li
                        key={step.title}
                        className="rounded-xl border border-ink-150 bg-ink-50/40 p-4 space-y-1"
                      >
                        <h3 className="font-display text-base font-bold text-ink-900">
                          {step.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-ink-700">{step.detail}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {scholarship.documents_required && scholarship.documents_required.length > 0 ? (
                <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-2xs space-y-4">
                  <h2 className="font-display text-xl font-bold text-ink-950">
                    Mandatory Documents Checklist
                  </h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {scholarship.documents_required.map((doc) => (
                      <li
                        key={doc}
                        className="flex items-start gap-2.5 rounded-xl border border-ink-150 bg-ink-50/40 p-3.5 text-sm leading-relaxed text-ink-800"
                      >
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-700 mt-0.5" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {scholarship.faqs && scholarship.faqs.length > 0 ? (
                <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-2xs space-y-4">
                  <h2 className="font-display text-xl font-bold text-ink-950">
                    Frequently Asked Questions — {scholarship.name}
                  </h2>
                  <div className="space-y-4">
                    {scholarship.faqs.map((faq) => (
                      <div key={faq.question} className="border-b border-ink-150 pb-4 last:border-b-0 last:pb-0">
                        <h3 className="font-display text-base font-bold text-ink-900">
                          {faq.question}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          {section ? <SectionBody section={section} heading={heading} /> : null}
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
