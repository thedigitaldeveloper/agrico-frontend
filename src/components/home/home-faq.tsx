import { HelpCircle, MessageSquarePlus } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { FaqList } from '@/components/ui/faq-list';
import type { FaqItem, SectionHeaderConfig } from '@/lib/cms/repositories/home';

export interface Faq {
  question: string;
  answer: string;
}

export function HomeFaq({
  faqs,
  config,
}: {
  faqs?: FaqItem[];
  config?: SectionHeaderConfig | null;
}) {
  const faqItems = faqs ?? [];

  if (faqItems.length === 0) {
    return null;
  }

  const eyebrow = config?.eyebrow ?? '';
  const heading = config?.heading ?? '';
  const description =
    config?.description ?? '';
  const badges = config?.badges && config.badges.length > 0 ? config.badges : null;
  const ctaLabel = config?.ctaLabel ?? '';
  const ctaLink = config?.ctaLink ?? '';

  return (
    <section className="relative border-t border-ink-200/60 bg-gradient-to-b from-white to-ink-50/40 py-6 sm:py-8 lg:py-12">
      <div className="container-page">
        {/* Compact Centered Section Header */}
        <div className="relative mx-auto mb-4 max-w-2xl text-center sm:mb-6 lg:mb-8">
          {/* Subtle Ambient Radial Glow */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 rounded-full bg-brand-50/70 blur-2xl -z-10"
          />

          <div className="mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <span className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent via-brand-300 to-brand-400" />
            <div className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-brand-800 uppercase ring-1 ring-brand-200/80 ring-inset shadow-2xs sm:text-2xs sm:px-3.5 sm:py-1">
              <HelpCircle className="size-2.5 text-brand-700 sm:size-3" />
              {eyebrow}
            </div>
            <span className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent via-brand-300 to-brand-400" />
          </div>

          <h2 className="font-display text-lg font-extrabold tracking-tight text-ink-900 text-balance sm:text-2xl lg:text-3xl">
            {heading}
          </h2>
          {description ? (
            <p className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-ink-600 sm:mt-2 sm:text-sm">
              {description}
            </p>
          ) : null}

          {/* Micro-FAQ Tags (Horizontal Compact) */}
          {badges && badges.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-semibold text-ink-600 sm:mt-3 sm:gap-2 sm:text-2xs">
              {badges.map((b, idx) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1 rounded-full border border-ink-200/80 bg-white px-2 py-0.5 text-ink-700 shadow-2xs sm:px-2.5 sm:py-1"
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      idx % 3 === 0 ? 'bg-brand-600' : idx % 3 === 1 ? 'bg-emerald-600' : 'bg-gold-600'
                    }`}
                  />
                  {b}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Centered FAQ Accordion Box */}
        <div className="mx-auto max-w-3xl rounded-2xl border border-ink-200/80 bg-white p-5 shadow-xs sm:p-7">
          <FaqList
            items={faqItems.map((faq) => ({
              key: faq.question,
              question: faq.question,
              answer: (
                <p className="pb-3 text-xs leading-relaxed text-ink-600 sm:text-sm">{faq.answer}</p>
              ),
            }))}
          />
        </div>

        {/* Bottom Centered Action Button */}
        <div className="mt-8 flex justify-center lg:mt-10">
          {ctaLink && ctaLabel ? <ButtonLink href={ctaLink} variant="outline" size="sm" className="rounded-pill px-6 shadow-xs">
            <MessageSquarePlus className="size-3.5" />
            <span>{ctaLabel}</span>
          </ButtonLink> : null}
        </div>
      </div>
    </section>
  );
}


